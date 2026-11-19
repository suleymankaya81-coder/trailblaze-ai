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
  ca: { name: "Canada", nameDe: "Kanada" },
  gb: { name: "United Kingdom", nameDe: "Vereinigtes Königreich" },
  de: { name: "Germany", nameDe: "Deutschland" },
  at: { name: "Austria", nameDe: "Österreich" },
  ch: { name: "Switzerland", nameDe: "Schweiz" },
  it: { name: "Italy", nameDe: "Italien" },
  es: { name: "Spain", nameDe: "Spanien" },
  fr: { name: "France", nameDe: "Frankreich" },
  pt: { name: "Portugal", nameDe: "Portugal" },
  gr: { name: "Greece", nameDe: "Griechenland" },
  no: { name: "Norway", nameDe: "Norwegen" },
  is: { name: "Iceland", nameDe: "Island" },
  se: { name: "Sweden", nameDe: "Schweden" },
  fi: { name: "Finland", nameDe: "Finnland" },
  dk: { name: "Denmark", nameDe: "Dänemark" },
  nl: { name: "Netherlands", nameDe: "Niederlande" },
  be: { name: "Belgium", nameDe: "Belgien" },
  ie: { name: "Ireland", nameDe: "Irland" },
  pl: { name: "Poland", nameDe: "Polen" },
  ro: { name: "Romania", nameDe: "Rumänien" },
  sk: { name: "Slovakia", nameDe: "Slowakei" },
  cz: { name: "Czechia", nameDe: "Tschechien" },
  hu: { name: "Hungary", nameDe: "Ungarn" },
  si: { name: "Slovenia", nameDe: "Slowenien" },
  hr: { name: "Croatia", nameDe: "Kroatien" },
  me: { name: "Montenegro", nameDe: "Montenegro" },
  al: { name: "Albania", nameDe: "Albanien" },
  mk: { name: "North Macedonia", nameDe: "Nordmazedonien" },
  ba: { name: "Bosnia and Herzegovina", nameDe: "Bosnien und Herzegowina" },
  rs: { name: "Serbia", nameDe: "Serbien" },
  bg: { name: "Bulgaria", nameDe: "Bulgarien" },
  ee: { name: "Estonia", nameDe: "Estland" },
  lv: { name: "Latvia", nameDe: "Lettland" },
  lt: { name: "Lithuania", nameDe: "Litauen" },
  lu: { name: "Luxembourg", nameDe: "Luxemburg" },
  mt: { name: "Malta", nameDe: "Malta" },
  cy: { name: "Cyprus", nameDe: "Zypern" },
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

/** Name of a country's first-level region in page wording, e.g. state, canton or region. */
export function regionUnit(country: string): { en: string; enPlural: string; de: string; dePlural: string } {
  if (country === "us") return { en: "state", enPlural: "states", de: "Bundesstaat", dePlural: "Bundesstaaten" };
  if (country === "ca") return { en: "province", enPlural: "provinces and territories", de: "Provinz", dePlural: "Provinzen und Territorien" };
  if (country === "gb") return { en: "nation", enPlural: "nations", de: "Landesteil", dePlural: "Landesteilen" };
  if (country === "de" || country === "at") return { en: "state", enPlural: "states", de: "Bundesland", dePlural: "Bundesländern" };
  if (country === "ch") return { en: "canton", enPlural: "cantons", de: "Kanton", dePlural: "Kantonen" };
  return { en: "region", enPlural: "regions", de: "Region", dePlural: "Regionen" };
}
/** German "in the USA" vs "in Spanien". */
export const deIn = (country: string, nameDe: string) => (country === "us" ? `in den ${nameDe}` : `in ${nameDe}`);
