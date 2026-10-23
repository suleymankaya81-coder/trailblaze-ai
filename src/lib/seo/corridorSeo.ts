import type { Corridor } from "./corridors";

const ROUTE_TITLES: Record<string, string> = {
  "grand-circle-from-las-vegas": "Grand Circle Road Trip from Las Vegas",
  "california-icons-from-san-francisco": "San Francisco to Yosemite Road Trip Loop",
  "florida-keys-loop-from-miami": "Miami to Key West Road Trip Loop",
  "utah-mighty-5-from-salt-lake-city": "Utah Mighty 5 Road Trip from Salt Lake City",
};

export function corridorSearchTitle(corridor: Corridor): string {
  return ROUTE_TITLES[corridor.slug] ?? corridor.title;
}

export function corridorSearchDescription(corridor: Corridor): string {
  const text = `${corridor.idealDays} from ${corridor.gateway.code}, returning to the same airport. ${corridor.intro}`;
  if (text.length <= 160) return text;
  const shortened = text.slice(0, 157);
  return `${shortened.slice(0, shortened.lastIndexOf(" "))}…`;
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