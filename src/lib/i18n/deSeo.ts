import { COUNTRIES, countryPath, regionPath } from "@/lib/routes/paths";
import type { Crumb } from "@/lib/seo/breadcrumbs";

// German crumbs mirror the English hierarchy under /de.
export const HOME_DE: Crumb = { name: "Startseite", path: "/de" };
export const DESTINATIONS_DE: Crumb = { name: "Reiseziele", path: "/de/destinations" };
export const ROAD_TRIPS_DE: Crumb = { name: "Roadtrips", path: "/de/road-trips" };

export const deMeta = (title: string, description: string, url: string) => [
  { title },
  { name: "description", content: description },
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:locale", content: "de_DE" },
  { property: "og:url", content: url },
];

/** German trail: Startseite › Reiseziele › Land › Region (region optional). */
export function deGeoCrumbs(country: string, region?: { slug: string; name: string }): Crumb[] {
  const crumbs: Crumb[] = [HOME_DE, DESTINATIONS_DE, { name: COUNTRIES[country]?.nameDe ?? country.toUpperCase(), path: countryPath(country, "de") }];
  if (region) crumbs.push({ name: region.name, path: regionPath(country, region.slug, "de") });
  return crumbs;
}
