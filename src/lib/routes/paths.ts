/**
 * Single builder for public page addresses. Today's live structure is flat
 * (/destinations/{slug}); `geoDestinationPath` is the target international
 * structure (/destinations/{country}/{region}/{slug}) used once the nested
 * routes and 301 map go live. Callers must not hand-write these strings.
 */
export type Locale = "en" | "de";

export const GUIDE_SEGMENTS = ["best-time", "things-to-do", "itinerary", "glamping"] as const;
export type GuideSegment = (typeof GUIDE_SEGMENTS)[number];

export function slugifyRegion(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function withLocale(path: string, locale: Locale = "en"): string {
  if (locale === "en") return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function destinationPath(slug: string, locale: Locale = "en"): string {
  return withLocale(`/destinations/${slug}`, locale);
}

export function countryPath(country: string, locale: Locale = "en"): string {
  return withLocale(`/destinations/${country.toLowerCase()}`, locale);
}

export function regionPath(country: string, region: string, locale: Locale = "en"): string {
  return withLocale(`/destinations/${country.toLowerCase()}/${slugifyRegion(region)}`, locale);
}

export function geoDestinationPath(
  d: { slug: string; country_code: string; region_slug: string | null },
  locale: Locale = "en",
): string {
  if (!d.region_slug) return withLocale(`/destinations/${d.country_code}/${d.slug}`, locale);
  return `${regionPath(d.country_code, d.region_slug, locale)}/${d.slug}`;
}

export function geoGuidePath(
  d: { slug: string; country_code: string; region_slug: string | null },
  guide: GuideSegment,
  locale: Locale = "en",
): string {
  return `${geoDestinationPath(d, locale)}/${guide}`;
}
