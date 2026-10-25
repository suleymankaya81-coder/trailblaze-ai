import type { Corridor } from "./corridors";

import { corridorDescription, corridorKeyword, corridorTitle } from "./routeSeo";

/** Search phrase used as the page name (H1-independent) and in structured data. */
export function corridorSearchTitle(corridor: Corridor): string {
  return corridorKeyword(corridor.slug, corridor.title);
}

/** Full <title>, kept within 60 characters. */
export function corridorPageTitle(corridor: Corridor): string {
  return corridorTitle(corridor.slug, corridor.title, corridor.idealDays);
}

export function corridorSearchDescription(corridor: Corridor, stopNames: string[] = []): string {
  return corridorDescription(corridor.slug, corridor.title, corridor.idealDays, corridor.gateway.code, stopNames);
}

type VisibleStop = { slug: string; name: string };

// Describe the displayed self-drive suggestion, never a packaged tour or live inventory.
export function buildCorridorJsonLd(corridor: Corridor, stops: VisibleStop[], pageUrl: string) {
  const first = stops[0];
  const itinerary = stops.map((stop) => ({
    "@type": "Place",
    name: stop.name,
    url: `https://minialife.com/destinations/${stop.slug}`,
  }));
  if (first) itinerary.push({ "@type": "Place", name: `Return to ${first.name} (${corridor.gateway.code})`, url: `https://minialife.com/destinations/${first.slug}` });
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        "@id": `${pageUrl}#trip`,
        name: corridorSearchTitle(corridor),
        description: corridor.intro,
        url: pageUrl,
        itinerary: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: itinerary.length,
          itemListElement: itinerary.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "MiniaLife", item: "https://minialife.com/" },
          { "@type": "ListItem", position: 2, name: "Gateway Road Trips", item: "https://minialife.com/corridors" },
          { "@type": "ListItem", position: 3, name: corridorSearchTitle(corridor), item: pageUrl },
        ],
      },
    ],
  };
}