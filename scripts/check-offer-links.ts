/**
 * scripts/check-offer-links.ts
 *
 * Run LOCALLY — no network access from an agent sandbox. Read-only
 * (anon key): reads offers.external_url, HEAD/GET-checks each one,
 * writes a report. Never modifies data.
 *
 *   npx tsx scripts/check-offer-links.ts
 *
 * Offer count grew roughly 20x along with the destinations table, so
 * this checks concurrently (bounded pool, default 8 at a time — override
 * with CONCURRENCY=n) instead of one-at-a-time.
 *
 * Every failure is bucketed:
 *   - "blocked" (401/403/429, or a response that looks like a bot-
 *     protection page) — the partner is very likely fine for a real
 *     browser; this is not evidence of a broken link.
 *   - "not-found" (404/410) — genuine broken link.
 *   - "server-error" (5xx) — partner-side issue, may be transient.
 *   - "unreachable" (DNS/connection/timeout failure) — genuinely dead
 *     or misconfigured URL.
 * Report groups by partner so patterns (one partner's whole catalog
 * broken vs. scattered individual links) are easy to spot.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 8);
const TIMEOUT_MS = 10_000;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Offer = { id: string; title: string; partner: string | null; external_url: string | null };

type CheckResult =
  | { bucket: "ok"; status: number }
  | { bucket: "blocked"; status: number }
  | { bucket: "not-found"; status: number }
  | { bucket: "server-error"; status: number }
  | { bucket: "unreachable"; error: string };

async function fetchAllOffers(): Promise<Offer[]> {
  const pageSize = 1000;
  let from = 0;
  const all: Offer[] = [];
  for (;;) {
    const { data, error } = await supabase
      .from("offers")
      .select("id, title, partner, external_url")
      .not("external_url", "is", null)
      .order("id")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`offers fetch failed: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...(data as Offer[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function checkUrl(url: string): Promise<CheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    // Some partner sites don't implement HEAD properly — fall back to GET.
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    }
    if (res.status === 401 || res.status === 403 || res.status === 429) {
      return { bucket: "blocked", status: res.status };
    }
    if (res.status === 404 || res.status === 410) {
      return { bucket: "not-found", status: res.status };
    }
    if (res.status >= 500) {
      return { bucket: "server-error", status: res.status };
    }
    if (res.status >= 400) {
      // Other 4xx (not 401/403/404/410/429) — treat conservatively as blocked
      // rather than broken, since plenty of sites return odd 4xx codes to bots.
      return { bucket: "blocked", status: res.status };
    }
    return { bucket: "ok", status: res.status };
  } catch (err) {
    return { bucket: "unreachable", error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function runPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, i: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

async function main() {
  console.log("Fetching offers with external_url...");
  const offers = await fetchAllOffers();
  console.log(`Checking ${offers.length} links at concurrency ${CONCURRENCY}...\n`);

  let done = 0;
  const results = await runPool(offers, CONCURRENCY, async (offer) => {
    const result = await checkUrl(offer.external_url!);
    done++;
    if (done % 50 === 0) console.log(`  ${done}/${offers.length} checked...`);
    return { offer, result };
  });

  const byBucket = { ok: 0, blocked: 0, "not-found": 0, "server-error": 0, unreachable: 0 };
  const byPartner = new Map<string, { total: number; broken: number }>();
  const brokenLines: string[] = [];
  const blockedLines: string[] = [];

  for (const { offer, result } of results) {
    byBucket[result.bucket]++;
    const partner = offer.partner ?? "(no partner set)";
    if (!byPartner.has(partner)) byPartner.set(partner, { total: 0, broken: 0 });
    const p = byPartner.get(partner)!;
    p.total++;

    const detail =
      result.bucket === "unreachable" ? `unreachable (${result.error})` : `HTTP ${result.status}`;

    if (
      result.bucket === "not-found" ||
      result.bucket === "server-error" ||
      result.bucket === "unreachable"
    ) {
      p.broken++;
      brokenLines.push(
        `- [${result.bucket}] ${offer.title} (${partner}): ${offer.external_url} — ${detail}`,
      );
    } else if (result.bucket === "blocked") {
      blockedLines.push(
        `- [blocked, likely fine] ${offer.title} (${partner}): ${offer.external_url} — ${detail}`,
      );
    }
  }

  const report: string[] = [
    `# Offer link check\n`,
    `Generated ${new Date().toISOString()}. ${offers.length} links checked at concurrency ${CONCURRENCY}.\n`,
    `## Summary\n`,
    `- OK: ${byBucket.ok}`,
    `- Blocked (401/403/429 — likely bot protection, not broken): ${byBucket.blocked}`,
    `- Not found (404/410 — genuinely broken): ${byBucket["not-found"]}`,
    `- Server error (5xx): ${byBucket["server-error"]}`,
    `- Unreachable (DNS/connection/timeout): ${byBucket.unreachable}`,
    ``,
    `## By partner\n`,
  ];
  for (const [partner, stats] of [...byPartner.entries()].sort(
    (a, b) => b[1].broken - a[1].broken,
  )) {
    report.push(`- ${partner}: ${stats.total} links, ${stats.broken} genuinely broken`);
  }

  report.push(`\n## Genuinely broken (404/410/5xx/unreachable) — ${brokenLines.length}\n`);
  report.push(...brokenLines);

  report.push(
    `\n## Blocked — likely bot protection, not a real signal of breakage — ${blockedLines.length}\n`,
  );
  report.push(...blockedLines);

  const outPath = join(process.cwd(), "scripts", "output", "offer-link-check.md");
  writeFileSync(outPath, report.join("\n"));
  console.log(`\nWrote report: ${outPath}`);
  console.log(
    `OK ${byBucket.ok} · blocked ${byBucket.blocked} · broken ${brokenLines.length} · unreachable-of-that ${byBucket.unreachable}`,
  );
}

main();
