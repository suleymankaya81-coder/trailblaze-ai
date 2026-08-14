/**
 * scripts/audit-destinations-scale.ts
 *
 * Run LOCALLY — no network access from an agent sandbox. Read-only
 * (anon key): queries destinations + offers, writes one report, changes
 * nothing.
 *
 *   npx tsx scripts/audit-destinations-scale.ts
 *   # add a deep (slow, rate-limited) image-caption recheck against
 *   # existing hero_image/gallery URLs already in the DB:
 *   DEEP_IMAGE_CHECK=true UNSPLASH_ACCESS_KEY=... npx tsx scripts/audit-destinations-scale.ts
 *
 * Covers the destinations-table-scale audit:
 *   1. Content-depth sample (~15 destinations outside the first 20 by
 *      created_at) — prints tagline + offer why_recommended text for
 *      manual judgment; this script can't judge "genuine vs templated"
 *      itself, only surface the raw text.
 *   2. Completeness — null/empty critical fields, per destination.
 *   3. Offers coverage — offers per destination, zero-offer rows,
 *      min/max/avg.
 *   4. Image integrity — duplicate hero_image/gallery URLs shared
 *      across different destinations (always run, cheap); optional
 *      deep pass re-verifies each URL's Unsplash caption against the
 *      destination's own name/region/aliases, same logic as
 *      fetch-destination-images.ts's plausibleMatch — opt-in because at
 *      ~1500+ images and Unsplash's 50/hr free tier this takes hours.
 *   5. Duplicate destinations — grouped by normalized name.
 *   6. Referential integrity — every similar_slugs entry must resolve
 *      to a real slug in the same fetch.
 *   7. Sitemap / publish-status breakdown.
 *
 * Paginates both destinations and offers in batches of 1000 so this
 * doesn't silently truncate if either table grows past Supabase's
 * default per-request row cap — the exact kind of scale surprise this
 * audit exists to catch.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const DEEP_IMAGE_CHECK = process.env.DEEP_IMAGE_CHECK === "true";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Destination = {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  tagline: string | null;
  hero_image: string | null;
  gallery: string[];
  seo_title: string | null;
  seo_description: string | null;
  best_season: string | null;
  scenic_score: number | null;
  camping_score: number | null;
  avg_daily_budget: number | null;
  trip_duration_days: string | null;
  trip_tags: string[] | null;
  similar_slugs: string[];
  aliases: string[];
  status: string;
  created_at: string;
};

type Offer = {
  id: string;
  destination_id: string | null;
  title: string;
  why_recommended: string | null;
  external_url: string | null;
  category: string;
};

async function fetchAll<T>(table: string, select: string, order: string): Promise<T[]> {
  const pageSize = 1000;
  let from = 0;
  const all: T[] = [];
  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order(order)
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`${table} fetch failed: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...(data as T[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim().length === 0;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bnational park\b|\bstate park\b|\bnational monument\b|\bnp\b/g, "")
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const UNSPLASH_ID_RE = /images\.unsplash\.com\/(photo-[a-zA-Z0-9_-]+)/;

async function recheckUnsplashCaption(
  url: string,
  keywords: string[],
): Promise<"match" | "mismatch" | "no-caption" | "not-unsplash" | "lookup-failed"> {
  const m = url.match(UNSPLASH_ID_RE);
  if (!m || !UNSPLASH_ACCESS_KEY) return "not-unsplash";

  const res = await fetch(`https://api.unsplash.com/photos/${m[1]}`, {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  });
  if (!res.ok) return "lookup-failed";

  const json = (await res.json()) as { description: string | null; alt_description: string | null };
  const caption = [json.description, json.alt_description].filter(Boolean).join(" ").toLowerCase();
  if (!caption) return "no-caption";
  return keywords.some((k) => caption.includes(k)) ? "match" : "mismatch";
}

async function main() {
  console.log("Fetching destinations...");
  const destinations = await fetchAll<Destination>(
    "destinations",
    "id, slug, name, region, tagline, hero_image, gallery, seo_title, seo_description, best_season, scenic_score, camping_score, avg_daily_budget, trip_duration_days, trip_tags, similar_slugs, aliases, status, created_at",
    "created_at",
  );
  console.log(`Fetched ${destinations.length} destinations.`);

  console.log("Fetching offers...");
  const offers = await fetchAll<Offer>(
    "offers",
    "id, destination_id, title, why_recommended, external_url, category",
    "id",
  );
  console.log(`Fetched ${offers.length} offers.\n`);

  const report: string[] = [`# Destination-scale audit\n\nGenerated ${new Date().toISOString()}\n`];

  // === 7. Status / sitemap breakdown ===
  const byStatus = new Map<string, number>();
  for (const d of destinations) byStatus.set(d.status, (byStatus.get(d.status) ?? 0) + 1);
  report.push("## Publish status breakdown (sitemap = status='published' only)\n");
  for (const [status, count] of byStatus) report.push(`- ${status}: ${count}`);
  report.push("");

  // === 2. Completeness ===
  const criticalFields: (keyof Destination)[] = [
    "tagline",
    "hero_image",
    "gallery",
    "seo_title",
    "seo_description",
    "best_season",
    "scenic_score",
    "camping_score",
    "avg_daily_budget",
    "trip_duration_days",
    "trip_tags",
    "similar_slugs",
  ];
  const incomplete: { slug: string; name: string; missing: string[] }[] = [];
  for (const d of destinations) {
    const missing = criticalFields.filter((f) => isEmpty(d[f]));
    if (missing.length > 0) incomplete.push({ slug: d.slug, name: d.name, missing });
  }
  report.push(
    `## Completeness — ${incomplete.length}/${destinations.length} destinations missing at least one critical field\n`,
  );
  for (const d of incomplete) {
    report.push(`- **${d.name}** (${d.slug}): missing ${d.missing.join(", ")}`);
  }
  report.push("");

  // === 3. Offers coverage ===
  const offerCounts = new Map<string, number>();
  for (const o of offers) {
    if (!o.destination_id) continue;
    offerCounts.set(o.destination_id, (offerCounts.get(o.destination_id) ?? 0) + 1);
  }
  const zeroOffer = destinations.filter((d) => !offerCounts.has(d.id));
  const counts = destinations.map((d) => offerCounts.get(d.id) ?? 0);
  const withOffers = counts.filter((c) => c > 0);
  const avg = withOffers.length > 0 ? withOffers.reduce((a, b) => a + b, 0) / withOffers.length : 0;
  report.push("## Offers coverage\n");
  report.push(`- Destinations with zero offers: ${zeroOffer.length}/${destinations.length}`);
  report.push(
    `- Offers per destination (destinations with >=1 offer): min ${withOffers.length ? Math.min(...withOffers) : 0}, max ${withOffers.length ? Math.max(...withOffers) : 0}, avg ${avg.toFixed(1)}`,
  );
  if (zeroOffer.length > 0) {
    report.push(`\nZero-offer destinations:`);
    for (const d of zeroOffer) report.push(`- ${d.name} (${d.slug})`);
  }
  report.push("");

  // === 5. Duplicate destinations (normalized name) ===
  const byNormName = new Map<string, Destination[]>();
  for (const d of destinations) {
    const key = normalizeName(d.name);
    if (!byNormName.has(key)) byNormName.set(key, []);
    byNormName.get(key)!.push(d);
  }
  const dupeGroups = [...byNormName.entries()].filter(([, ds]) => ds.length > 1);
  report.push(`## Duplicate destinations (normalized name match) — ${dupeGroups.length} groups\n`);
  for (const [norm, ds] of dupeGroups) {
    report.push(`- "${norm}": ${ds.map((d) => `${d.name} (${d.slug})`).join(" / ")}`);
  }
  report.push(
    "\n_This only catches exact normalized-name collisions. Near-duplicates with genuinely different wording won't show up here — see the full name list at the bottom of this report for manual scanning._\n",
  );

  // === 6. Referential integrity (similar_slugs) ===
  const allSlugs = new Set(destinations.map((d) => d.slug));
  const danglingRefs: { slug: string; name: string; badRefs: string[] }[] = [];
  for (const d of destinations) {
    const bad = (d.similar_slugs ?? []).filter((s) => !allSlugs.has(s));
    if (bad.length > 0) danglingRefs.push({ slug: d.slug, name: d.name, badRefs: bad });
  }
  report.push(
    `## Referential integrity — similar_slugs — ${danglingRefs.length} destinations with dangling references\n`,
  );
  for (const d of danglingRefs) {
    report.push(`- ${d.name} (${d.slug}) references missing slug(s): ${d.badRefs.join(", ")}`);
  }
  report.push("");

  // === 4. Image integrity — duplicate URLs ===
  const urlToDests = new Map<string, string[]>();
  for (const d of destinations) {
    const urls = [d.hero_image, ...(d.gallery ?? [])].filter((u): u is string => Boolean(u));
    for (const u of urls) {
      if (!urlToDests.has(u)) urlToDests.set(u, []);
      urlToDests.get(u)!.push(d.name);
    }
  }
  const dupeImages = [...urlToDests.entries()].filter(([, names]) => new Set(names).size > 1);
  report.push(
    `## Image integrity — duplicate URLs across different destinations — ${dupeImages.length} found\n`,
  );
  for (const [url, names] of dupeImages) {
    report.push(`- ${url}\n  used by: ${[...new Set(names)].join(", ")}`);
  }
  report.push("");

  if (DEEP_IMAGE_CHECK && UNSPLASH_ACCESS_KEY) {
    report.push("## Deep image caption recheck (Unsplash only, rate-limited)\n");
    let checked = 0;
    let mismatches = 0;
    for (const d of destinations) {
      const keywords = [d.name, d.region ?? "", ...(d.aliases ?? [])]
        .join(" ")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 2);
      const urls = [d.hero_image, ...(d.gallery ?? [])].filter((u): u is string => Boolean(u));
      for (const url of urls) {
        const result = await recheckUnsplashCaption(url, keywords);
        checked++;
        if (result === "mismatch") {
          mismatches++;
          report.push(`- MISMATCH: ${d.name} (${d.slug}) — ${url}`);
        }
        if (result === "match" || result === "mismatch") await sleep(1500); // stay under free-tier rate limit
      }
    }
    report.push(
      `\nChecked ${checked} Unsplash-sourced images, ${mismatches} caption mismatches.\n`,
    );
  } else {
    report.push(
      "## Deep image caption recheck\n\nSkipped — set DEEP_IMAGE_CHECK=true and UNSPLASH_ACCESS_KEY to run it. Expect this to take hours at ~1500 images against a 50/hr free-tier limit.\n",
    );
  }

  // === 1. Content-depth sample ===
  const sorted = [...destinations].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const original = sorted.slice(0, 20);
  const rest = sorted.slice(20);
  const sample = shuffle(rest).slice(0, 15);
  report.push(
    `## Content-depth sample — 15 of ${rest.length} destinations outside the first 20 (by created_at)\n`,
  );
  report.push(
    `_First 20 by created_at (treated as "original"): ${original.map((d) => d.slug).join(", ")}_\n`,
  );
  for (const d of sample) {
    report.push(`### ${d.name} (${d.slug}) — ${d.region ?? "no region"}`);
    report.push(`Tagline: ${d.tagline ?? "(none)"}`);
    const destOffers = offers.filter((o) => o.destination_id === d.id).slice(0, 2);
    for (const o of destOffers) {
      report.push(`- Offer "${o.title}" why_recommended: ${o.why_recommended ?? "(none)"}`);
    }
    if (destOffers.length === 0) report.push("- (no offers to sample)");
    report.push("");
  }

  // Full name list for manual near-duplicate scanning
  report.push("## Full destination list (for manual near-duplicate scan)\n");
  for (const d of sorted) report.push(`- ${d.name} (${d.slug}) — ${d.region ?? "no region"}`);

  const outPath = join(process.cwd(), "scripts", "output", "destination-scale-audit.md");
  writeFileSync(outPath, report.join("\n"));
  console.log(`\nWrote report: ${outPath}`);
}

main();
