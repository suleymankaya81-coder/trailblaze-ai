// One source for page hierarchy: the visible breadcrumb trail and the
// BreadcrumbList JSON-LD are both built from the same Crumb[] so they never
// disagree. Paths are site-relative; the last crumb is the current page.
const BASE = "https://minialife.com";

export type Crumb = { name: string; path: string };

export const HOME: Crumb = { name: "Home", path: "/" };
export const DESTINATIONS: Crumb = { name: "Destinations", path: "/destinations" };
export const TRIP_GUIDES: Crumb = { name: "Trip Guides", path: "/trip-guides" };
export const ROAD_TRIPS: Crumb = { name: "Road Trips", path: "/road-trips" };
export const GATEWAY_TRIPS: Crumb = { name: "Gateway Road Trips", path: "/corridors" };

export const absoluteUrl = (path: string) => (path === "/" ? `${BASE}/` : `${BASE}${path}`);

export function destinationCrumbs(dest: { name: string; slug: string }): Crumb[] {
  return [HOME, DESTINATIONS, { name: dest.name, path: `/destinations/${dest.slug}` }];
}

/** Guides that belong to one place: Home › Destinations › Place › Guide. */
export function placeGuideCrumbs(dest: { name: string; slug: string }, label: string, path: string): Crumb[] {
  return [...destinationCrumbs(dest), { name: label, path }];
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
