/**
 * Single builder for public page addresses.
 * Destinations live at /destinations/{country}/{region}/{slug}; guides at
 * …/{slug}/{guide}. Older flat addresses (/destinations/{slug},
 * /{slug}-glamping …) are rewritten here for links and 301-redirected by the
 * server. `src/data/destination-geo.json` (slug → "country/region") is
 * regenerated when destinations are published.
 */
import geo from "@/data/destination-geo.json";

export type Locale = "en" | "de";

const GEO = geo as Record<string, string>;

/** Guide address segment ↔ stored page type ↔ legacy root-path suffix. */
export const GUIDES = [
  { segment: "best-time", pageType: "best_time", legacySuffix: "best-time-to-visit" },
  { segment: "things-to-do", pageType: "things_to_do", legacySuffix: "things-to-do" },
  { segment: "itinerary", pageType: "trip_planner", legacySuffix: "itinerary" },
  { segment: "glamping", pageType: "glamping", legacySuffix: "glamping" },
] as const;
export type GuideSegment = (typeof GUIDES)[number]["segment"];

export const COUNTRIES: Record<string, { name: string; nameDe: string }> = {
  us: { name: "United States", nameDe: "USA" },
};

export function slugifyRegion(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function isCountry(code: string): boolean {
  return code in COUNTRIES;
}

/** "acadia" → { country: "us", region: "maine" } when known. */
export function destinationGeo(slug: string): { country: string; region: string } | null {
  const v = GEO[slug];
  if (!v) return null;
  const [country, region] = v.split("/");
  return { country, region };
}

export function regionSlugsOf(country: string): string[] {
  const out = new Set<string>();
  for (const v of Object.values(GEO)) {
    const [c, r] = v.split("/");
    if (c === country) out.add(r);
  }
  return [...out].sort();
}

function withLocale(path: string, locale: Locale = "en"): string {
  if (locale === "en") return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function countryPath(country: string, locale: Locale = "en"): string {
  return withLocale(`/destinations/${country.toLowerCase()}`, locale);
}

export function regionPath(country: string, region: string, locale: Locale = "en"): string {
  return withLocale(`/destinations/${country.toLowerCase()}/${slugifyRegion(region)}`, locale);
}

/** Canonical destination address; unknown slugs keep the flat form (server redirects it). */
export function destinationPath(slug: string, locale: Locale = "en"): string {
  const g = destinationGeo(slug);
  if (!g) return withLocale(`/destinations/${slug}`, locale);
  return `${regionPath(g.country, g.region, locale)}/${slug}`;
}

export function guidePath(slug: string, guide: GuideSegment, locale: Locale = "en"): string {
  return `${destinationPath(slug, locale)}/${guide}`;
}

export function guideByPageType(pageType: string) {
  return GUIDES.find((g) => g.pageType === pageType) ?? null;
}

export function guideBySegment(segment: string) {
  return GUIDES.find((g) => g.segment === segment) ?? null;
}

/** "/zion-glamping" → { slug: "zion", guide } when it is a known destination guide. */
export function parseLegacyGuidePath(path: string): { slug: string; guide: (typeof GUIDES)[number] } | null {
  const m = path.match(/^\/([a-z0-9-]+)$/);
  if (!m) return null;
  for (const g of GUIDES) {
    const suffix = `-${g.legacySuffix}`;
    if (m[1].endsWith(suffix)) {
      const slug = m[1].slice(0, -suffix.length);
      if (GEO[slug]) return { slug, guide: g };
    }
  }
  return null;
}

/** Stored legacy guide path ("/zion-glamping") for a destination + guide segment. */
export function legacyGuidePath(slug: string, segment: string): string | null {
  const g = guideBySegment(segment);
  return g ? `/${slug}-${g.legacySuffix}` : null;
}

/**
 * Rewrite any older-style address to its canonical form; other paths pass
 * through unchanged. Handles an optional /de prefix plus query/hash.
 */
export function canonicalPath(input: string): string {
  const [base, rest = ""] = input.split(/(?=[?#])/);
  const loc: Locale = base === "/de" || base.startsWith("/de/") ? "de" : "en";
  const path = loc === "de" ? base.slice(3) || "/" : base;
  const flat = path.match(/^\/destinations\/([a-z0-9-]+)\/?$/);
  if (flat && GEO[flat[1]]) return destinationPath(flat[1], loc) + rest;
  if (loc === "en") {
    const lg = parseLegacyGuidePath(path);
    if (lg) return guidePath(lg.slug, lg.guide.segment) + rest;
  }
  return input;
}
