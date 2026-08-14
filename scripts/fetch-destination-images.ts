/**
 * scripts/fetch-destination-images.ts
 *
 * Run LOCALLY — this needs real outbound network access to Supabase,
 * Unsplash, and Pexels, none of which are reachable from an agent
 * sandbox. It does not write to the database; it only reads (anon key)
 * and generates files for a human to review.
 *
 *   UNSPLASH_ACCESS_KEY=... PEXELS_API_KEY=... npx tsx scripts/fetch-destination-images.ts
 *   # or: bun run scripts/fetch-destination-images.ts
 *
 * Env required:
 *   VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY   (same .env the app uses)
 *   UNSPLASH_ACCESS_KEY                                 (required)
 *   PEXELS_API_KEY                                      (optional — fallback only)
 *
 * For every published destination, searches Unsplash (falling back to
 * Pexels when Unsplash has nothing usable) for real, name-matched
 * photography, then writes:
 *
 *   - supabase/migrations/<ts>_fix_destination_images.sql
 *     Adds a `photo_credit` text column to destinations + offers, and
 *     one UPDATE per resolved destination (hero_image, gallery,
 *     photo_credit). NOT applied automatically — review it, then hand
 *     it to Lovable / apply it yourself.
 *
 *   - scripts/output/destination-image-report.md
 *     Destination -> image URL -> photographer credit, for spot-
 *     checking before you trust the migration.
 *
 * Any destination neither API can plausibly match is skipped from the
 * migration entirely and listed under "needs manual review" instead of
 * guessing.
 */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in env.");
  process.exit(1);
}
if (!UNSPLASH_ACCESS_KEY) {
  console.error("Missing UNSPLASH_ACCESS_KEY in env (required; PEXELS_API_KEY is optional).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type DestinationRow = {
  slug: string;
  name: string;
  region: string | null;
  aliases: string[];
};

type PhotoCandidate = {
  url: string;
  credit: string;
  source: "unsplash" | "pexels";
  verified: boolean;
  downloadLocation?: string;
};

// Stops Unsplash calls for the rest of the run once we're clearly at the
// free-tier limit, so the run degrades to Pexels-only rather than getting
// the whole batch 403'd mid-way.
let unsplashExhausted = false;

const STOPWORDS = new Set(["the", "a", "an", "and", "of", "in", "at", "national", "park", "state"]);

function keywordsOf(...texts: (string | null | undefined)[]): string[] {
  return texts
    .filter((t): t is string => Boolean(t))
    .flatMap((t) => t.toLowerCase().split(/[^a-z0-9]+/))
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// Reject only when a caption exists and shares nothing with the
// destination's own keywords — exactly the signal that would have caught
// a Burj Al Arab photo showing up for Moab. Photos with no caption at all
// are accepted (Unsplash/Pexels already ranked them against the search
// query) but marked "unverified" in the report.
function plausibleMatch(caption: string, keywords: string[]): boolean {
  const cap = caption.toLowerCase();
  return keywords.some((k) => cap.includes(k));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchUnsplash(query: string, keywords: string[]): Promise<PhotoCandidate[]> {
  if (unsplashExhausted) return [];

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=4`,
    { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } },
  );

  const remaining = res.headers.get("x-ratelimit-remaining");
  if (remaining !== null && Number(remaining) < 3) {
    console.warn(
      `  ! Unsplash rate limit low (${remaining} left) — switching to Pexels-only for the rest of this run.`,
    );
    unsplashExhausted = true;
  }
  if (res.status === 403) {
    console.warn(
      "  ! Unsplash returned 403 (rate limited) — switching to Pexels-only for the rest of this run.",
    );
    unsplashExhausted = true;
    return [];
  }
  if (!res.ok) {
    console.error(`  Unsplash search failed (${res.status}) for "${query}"`);
    return [];
  }

  const json = (await res.json()) as {
    results: {
      urls: { regular: string };
      description: string | null;
      alt_description: string | null;
      user: { name: string; links: { html: string } };
      links: { download_location: string };
    }[];
  };

  const out: PhotoCandidate[] = [];
  for (const r of json.results) {
    const caption = [r.description, r.alt_description].filter(Boolean).join(" ");
    if (caption && !plausibleMatch(caption, keywords)) continue; // silent reject
    out.push({
      url: r.urls.regular,
      credit: `${r.user.name} (${r.user.links.html})`,
      source: "unsplash",
      verified: Boolean(caption),
      downloadLocation: r.links.download_location,
    });
  }
  return out;
}

async function searchPexels(query: string, keywords: string[]): Promise<PhotoCandidate[]> {
  if (!PEXELS_API_KEY) return [];

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=4`,
    {
      headers: { Authorization: PEXELS_API_KEY },
    },
  );
  if (!res.ok) {
    console.error(`  Pexels search failed (${res.status}) for "${query}"`);
    return [];
  }

  const json = (await res.json()) as {
    photos: {
      src: { large: string };
      photographer: string;
      photographer_url: string;
      alt: string | null;
    }[];
  };

  const out: PhotoCandidate[] = [];
  for (const p of json.photos) {
    if (p.alt && !plausibleMatch(p.alt, keywords)) continue; // silent reject
    out.push({
      url: p.src.large,
      credit: `${p.photographer} (${p.photographer_url})`,
      source: "pexels",
      verified: Boolean(p.alt),
    });
  }
  return out;
}

// Required by Unsplash's API guidelines for every photo actually used
// (not just previewed): GET the download_location the search result gave
// us for that specific photo — not a hand-built /photos/:id/download call.
async function triggerUnsplashDownload(downloadLocation: string): Promise<void> {
  try {
    await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });
  } catch (err) {
    console.error("  Download-tracking ping failed (non-fatal):", err);
  }
}

function sqlEscape(s: string): string {
  return s.replace(/'/g, "''");
}

function sqlArray(urls: string[]): string {
  return `ARRAY[${urls.map((u) => `'${sqlEscape(u)}'`).join(", ")}]`;
}

function migrationTimestamp(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "");
}

async function main() {
  const { data: destinations, error } = await supabase
    .from("destinations")
    .select("slug, name, region, aliases")
    .eq("status", "published")
    .order("name");

  if (error) {
    console.error("Failed to read destinations:", error.message);
    process.exit(1);
  }
  if (!destinations || destinations.length === 0) {
    console.error("No published destinations found.");
    process.exit(1);
  }

  console.log(`Found ${destinations.length} destinations.\n`);

  const migrationLines: string[] = [];
  const reportSections: string[] = [];
  const needsReview: string[] = [];

  for (const dest of destinations as DestinationRow[]) {
    console.log(`— ${dest.name} (${dest.slug})`);
    const keywords = keywordsOf(dest.name, dest.region, ...(dest.aliases ?? []));
    const query = `${dest.name} ${dest.region ?? ""} landscape`.trim();

    let candidates = await searchUnsplash(query, keywords);
    if (!unsplashExhausted) await sleep(1200); // stay well under the free-tier rate limit

    if (candidates.length === 0) {
      console.log("  No usable Unsplash results — trying Pexels fallback.");
      candidates = await searchPexels(query, keywords);
    }

    if (candidates.length === 0) {
      console.log("  ✗ No usable images found — flagged for manual review.\n");
      needsReview.push(`${dest.name} (${dest.slug})`);
      continue;
    }

    const [hero, ...gallery] = candidates;

    for (const c of [hero, ...gallery]) {
      if (c.source === "unsplash" && c.downloadLocation) {
        await triggerUnsplashDownload(c.downloadLocation);
        await sleep(400);
      }
    }

    const galleryUrls = gallery.map((g) => g.url);
    const creditParts = [`Hero: ${hero.credit}`];
    if (gallery.length > 0) creditParts.push(`Gallery: ${gallery.map((g) => g.credit).join(", ")}`);
    const photoCredit = creditParts.join(" · ");

    migrationLines.push(
      `UPDATE public.destinations SET hero_image = '${sqlEscape(hero.url)}', gallery = ${sqlArray(galleryUrls)}, photo_credit = '${sqlEscape(photoCredit)}' WHERE slug = '${sqlEscape(dest.slug)}';`,
    );

    const section: string[] = [`## ${dest.name} (${dest.slug})`];
    section.push(`- Hero: ${hero.url}${hero.verified ? "" : " _(unverified — no caption)_"}`);
    section.push(`  Credit: ${hero.credit} [${hero.source}]`);
    gallery.forEach((g, i) => {
      section.push(`- Gallery[${i}]: ${g.url}${g.verified ? "" : " _(unverified — no caption)_"}`);
      section.push(`  Credit: ${g.credit} [${g.source}]`);
    });
    reportSections.push(section.join("\n"));

    console.log(`  ✓ ${candidates.length} image(s) selected (${gallery.length} gallery).\n`);
  }

  const migrationPath = join(
    process.cwd(),
    "supabase",
    "migrations",
    `${migrationTimestamp()}_fix_destination_images.sql`,
  );
  const migrationSql =
    [
      "-- Auto-generated by scripts/fetch-destination-images.ts — review before applying.",
      "ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS photo_credit text;",
      "ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS photo_credit text;",
      "",
      ...migrationLines,
    ].join("\n") + "\n";
  writeFileSync(migrationPath, migrationSql);
  console.log(`\nWrote migration: ${migrationPath}`);

  mkdirSync(join(process.cwd(), "scripts", "output"), { recursive: true });
  const reportPath = join(process.cwd(), "scripts", "output", "destination-image-report.md");
  const reviewBlock =
    needsReview.length > 0
      ? `\n## Needs manual review\n\n${needsReview.map((n) => `- ${n}`).join("\n")}\n`
      : "";
  const report =
    `# Destination image report\n\n` +
    `Generated ${new Date().toISOString()}. ${destinations.length - needsReview.length}/${destinations.length} destinations resolved.\n\n` +
    reportSections.join("\n\n") +
    "\n" +
    reviewBlock;
  writeFileSync(reportPath, report);
  console.log(`Wrote report: ${reportPath}`);

  if (needsReview.length > 0) {
    console.log(`\n${needsReview.length} destination(s) need manual review:`);
    needsReview.forEach((n) => console.log(`  - ${n}`));
  }
}

main();
