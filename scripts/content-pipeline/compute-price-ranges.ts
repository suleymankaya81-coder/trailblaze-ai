/**
 * scripts/content-pipeline/compute-price-ranges.ts
 *
 * Run LOCALLY — no network access from an agent sandbox. Read-only
 * (anon key). Computes real per-subcategory Stay price statistics from
 * the original 20 destinations only (not the 426 added later — those
 * are exactly what this whole content-pipeline system exists to bring
 * up to a verified standard, so they shouldn't seed the validation
 * range that governs them).
 *
 *   npx tsx scripts/content-pipeline/compute-price-ranges.ts
 *
 * "Original 20" is a heuristic (oldest 20 destinations by created_at) —
 * same one used in audit-destinations-scale.ts — since there's no
 * hardcoded authoritative list of which 20 came first. Sanity-check the
 * printed slug list against what you know before trusting the numbers.
 *
 * Does NOT propose or write any validation ranges itself — it only
 * reports the real distribution (count, min, max, mean, median, p10,
 * p90) per subcategory so a human (or a follow-up pass) can set sane
 * min/max bounds from actual data instead of a guess. Any subcategory
 * with fewer than MIN_SAMPLE_SIZE data points is flagged low-confidence
 * rather than given a range at all.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const MIN_SAMPLE_SIZE = 3;

// Subcategories we expect to see for Stays, based on the app's own
// BEST_FOR_BY_SUBCATEGORY map — listed explicitly (not just "whatever
// shows up") so a subcategory with zero real usage (e.g. hotel) is
// reported as zero rather than silently absent from the output.
const KNOWN_STAY_SUBCATEGORIES = ["campground", "glamping", "cabin", "lodge", "rv_park", "hotel"];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Destination = { id: string; slug: string; name: string; created_at: string };
type Offer = { subcategory: string | null; price_value: number | null; price_unit: string | null };

function normalizeSubcategory(raw: string | null): string {
  if (!raw) return "(none)";
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

async function main() {
  console.log("Fetching destinations to find the original 20 (oldest by created_at)...");
  const { data: allDest, error: destErr } = await supabase
    .from("destinations")
    .select("id, slug, name, created_at")
    .order("created_at", { ascending: true })
    .limit(20);

  if (destErr) {
    console.error("Failed to fetch destinations:", destErr.message);
    process.exit(1);
  }
  const original20 = (allDest ?? []) as Destination[];
  if (original20.length === 0) {
    console.error("No destinations found.");
    process.exit(1);
  }
  console.log(`Original 20 (by created_at): ${original20.map((d) => d.slug).join(", ")}\n`);

  const ids = original20.map((d) => d.id);
  const { data: offers, error: offersErr } = await supabase
    .from("offers")
    .select("subcategory, price_value, price_unit")
    .eq("category", "stay")
    .in("destination_id", ids);

  if (offersErr) {
    console.error("Failed to fetch offers:", offersErr.message);
    process.exit(1);
  }

  const bySubcat = new Map<string, number[]>();
  const unitsSeen = new Map<string, Set<string>>();
  for (const known of KNOWN_STAY_SUBCATEGORIES) bySubcat.set(known, []);

  for (const o of (offers ?? []) as Offer[]) {
    const key = normalizeSubcategory(o.subcategory);
    if (o.price_value == null) continue;
    if (!bySubcat.has(key)) bySubcat.set(key, []);
    bySubcat.get(key)!.push(o.price_value);
    if (!unitsSeen.has(key)) unitsSeen.set(key, new Set());
    if (o.price_unit) unitsSeen.get(key)!.add(o.price_unit);
  }

  const report: string[] = [
    `# Stay price statistics — original 20 destinations\n`,
    `Generated ${new Date().toISOString()}\n`,
    `Original-20 slugs (heuristic: oldest by created_at): ${original20.map((d) => d.slug).join(", ")}\n`,
    `## Per-subcategory price_value statistics ($, whatever price_unit is on file)\n`,
  ];

  for (const [subcat, values] of [...bySubcat.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const units = [...(unitsSeen.get(subcat) ?? [])].join(", ") || "(none set)";
    if (values.length === 0) {
      report.push(
        `### ${subcat}\n- Sample size: 0 — no Stay offers with this subcategory and a price_value in the original 20.\n- **LOW CONFIDENCE — do not derive a validation range from zero data. Flag as unvalidated for now.**\n`,
      );
      continue;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const median = percentile(sorted, 50);
    const p10 = percentile(sorted, 10);
    const p90 = percentile(sorted, 90);
    const lowConfidence = values.length < MIN_SAMPLE_SIZE;

    report.push(`### ${subcat}`);
    report.push(
      `- Sample size: ${values.length}${lowConfidence ? " — **LOW CONFIDENCE, fewer than " + MIN_SAMPLE_SIZE + " data points**" : ""}`,
    );
    report.push(`- price_unit seen: ${units}`);
    report.push(`- min: $${round(sorted[0])}, max: $${round(sorted[sorted.length - 1])}`);
    report.push(`- mean: $${round(mean)}, median: $${round(median)}`);
    report.push(`- p10: $${round(p10)}, p90: $${round(p90)}`);
    report.push(`- raw values: ${sorted.map((v) => `$${v}`).join(", ")}`);
    report.push("");
  }

  const outPath = join(process.cwd(), "scripts", "output", "stay-price-stats.md");
  writeFileSync(outPath, report.join("\n"));
  console.log(`\nWrote report: ${outPath}`);
  console.log("This script does not propose ranges — send the report back for a proposal.");
}

main();
