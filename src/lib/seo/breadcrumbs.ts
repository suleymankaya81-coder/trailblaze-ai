import { SITE_ORIGIN } from "@/config/site";
import { COUNTRIES, canonicalPath, countryPath, destinationGeo, destinationPath, regionPath } from "@/lib/routes/paths";
// One source for page hierarchy: the visible breadcrumb trail and the
// BreadcrumbList JSON-LD are both built from the same Crumb[] so they never
// disagree. Paths are site-relative; the last crumb is the current page.
const BASE = SITE_ORIGIN;

export type Crumb = { name: string; path: string };

export const HOME: Crumb = { name: "Home", path: "/" };
export const DESTINATIONS: Crumb = { name: "Destinations", path: "/destinations" };
export const TRIP_GUIDES: Crumb = { name: "Trip Guides", path: "/trip-guides" };
export const ROAD_TRIPS: Crumb = { name: "Road Trips", path: "/road-trips" };
export const GATEWAY_TRIPS: Crumb = { name: "Gateway Road Trips", path: "/corridors" };

export const absoluteUrl = (path: string) => (path === "/" ? `${BASE}/` : `${BASE}${path}`);

/** "new-york" → "New York", "district-of-columbia" → "District of Columbia". */
export function regionName(slug: string): string {
  return slug.split("-").map((w, i) => (i > 0 && ["of", "and"].includes(w) ? w : w[0].toUpperCase() + w.slice(1))).join(" ");
}

export function countryCrumbs(country: string): Crumb[] {
  return [HOME, DESTINATIONS, { name: COUNTRIES[country]?.name ?? country.toUpperCase(), path: countryPath(country) }];
}

export function regionCrumbs(country: string, region: string, name = regionName(region)): Crumb[] {
  return [...countryCrumbs(country), { name, path: regionPath(country, region) }];
}

/** Home › Destinations › Country › Region › Place (country/region omitted when unknown). */
export function destinationCrumbs(dest: { name: string; slug: string }): Crumb[] {
  const g = destinationGeo(dest.slug);
  const parents = g ? regionCrumbs(g.country, g.region) : [HOME, DESTINATIONS];
  return [...parents, { name: dest.name, path: destinationPath(dest.slug) }];
}

/** Guides that belong to one place: Home › Destinations › Place › Guide. */
export function placeGuideCrumbs(dest: { name: string; slug: string }, label: string, path: string): Crumb[] {
  return [...destinationCrumbs(dest), { name: label, path: canonicalPath(path) }];
}

/** Guide directories: Home › Trip Guides › Directory. */
export function hubCrumbs(name: string, path: string): Crumb[] {
  return [HOME, TRIP_GUIDES, { name, path }];
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

/** Standalone script for pages that have no other JSON-LD graph. */
export function breadcrumbScript(crumbs: Crumb[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({ "@context": "https://schema.org", ...breadcrumbJsonLd(crumbs) }).replace(/</g, "\\u003c"),
  };
}
