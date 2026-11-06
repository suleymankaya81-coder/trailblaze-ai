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
