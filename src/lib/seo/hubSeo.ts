// Search-phrase titles/descriptions for hub and high-traffic static pages.
// Keywords chosen from Semrush US data (Oct 2026); each hub targets a distinct
// phrase family so hubs never overlap loop, corridor or destination metadata.
import { BRAND, DESCRIPTION_MAX, TITLE_MAX, fitText } from "./routeSeo";

export interface HubSeo {
  /** Primary Google query family this page targets. */
  keyword: string;
  title: string;
  description: string;
}

function hub(keyword: string, titleCandidates: string[], descriptionCandidates: string[]): HubSeo {
  return {
    keyword,
    title: fitText(titleCandidates, TITLE_MAX),
    description: fitText(descriptionCandidates, DESCRIPTION_MAX),
  };
}

export const HUB_SEO = {
  // "road trip planner" 27.1k/mo; "how to plan a road trip" 135k/mo.
  home: hub(
    "road trip planner",
    [`Free Road Trip Planner: USA Outdoor Itineraries${BRAND}`, `Free USA Road Trip Planner${BRAND}`],
    [
      "How to plan a road trip in the USA: free self-drive itineraries for national parks, airport loops and RV routes — with maps, entry notes and booking links.",
      "Free USA road trip planner: self-drive itineraries for national parks, airport loops and RV routes, with maps and entry notes.",
    ],
  ),
  // "national parks usa" 9.9k/mo.
  destinations: hub(
    "national parks usa",
    [`USA National Parks & Outdoor Destinations${BRAND}`, `USA Outdoor Destinations${BRAND}`],
    [
      "Explore 500 USA national parks, scenic towns and outdoor destinations: free travel guides with itineraries, entry notes, stays and rental options.",
      "Explore 500 USA national parks and outdoor destinations: free travel guides with itineraries, entry notes and stays.",
    ],
  ),
  // "road trip" 60.5k/mo; loops already own "<region> road trip" phrases.
  roadTrips: hub(
    "usa road trips",
    [`USA Road Trips: Airport Loops & Park Routes${BRAND}`, `USA Road Trips${BRAND}`],
    [
      "USA road trips that loop back to your arrival airport: multi-park routes with suggested days per stop, leg distances, maps and rental tips.",
      "USA road trips: multi-park airport loops with suggested days per stop, leg distances, maps and rental tips.",
    ],
  ),
  // Gateway corridor hub; corridor pages own "<city> road trip" phrases.
  corridors: hub(
    "gateway road trips",
    [`USA Airport Road Trip Loops: Gateway Road Trips${BRAND}`, `Gateway Road Trips${BRAND}`],
    [
      "Free USA self-drive itineraries that return to your arrival airport. Compare national park and coastal loops, suggested days and notes for overseas visitors.",
      "Free USA self-drive itineraries that return to your arrival airport: national park and coastal loops with suggested days.",
    ],
  ),
  // "fly and drive" 110/mo but low difficulty; "self drive" family.
  flyAndDrive: hub(
    "fly and drive",
    [`Fly & Drive: Closest Airports to US Parks${BRAND}`, `Fly & Drive Guides${BRAND}`],
    [
      "Fly and drive guides for 500 US destinations: the closest airport to fly into, drive times to the park and where to sleep the first night.",
      "Fly and drive guides: the closest airport for every US destination, drive times and where to sleep the first night.",
    ],
  ),
  // "rv camping" 6.6k/mo; "rv parks" 33.1k/mo.
  rvCamping: hub(
    "rv camping",
    [`RV Camping & RV Parks: National Park Guides${BRAND}`, `RV Camping Guides${BRAND}`],
    [
      "RV camping guides for national parks and outdoor towns: campgrounds, RV parks, hookups and campervan or motorhome rental options across the USA.",
      "RV camping guides: campgrounds, RV parks, hookups and campervan rentals for national parks and outdoor towns.",
    ],
  ),
  // "national park reservations" 5.4k/mo.
  noReservation: hub(
    "national park reservations",
    [`National Park Reservations & Backup Plans${BRAND}`, `Park Reservations & Backup Plans${BRAND}`],
    [
      "National park reservations explained: timed-entry rules, permit lotteries, workarounds and nearby alternatives when you can't get a spot.",
      "National park reservations explained: timed-entry rules, workarounds and nearby alternatives when you can't get a spot.",
    ],
  ),
  // "cycling gear" 5.4k/mo; "bike gear" 6.6k/mo.
  gear: hub(
    "cycling gear",
    [`Bike & Cycling Gear: Curated Trip Essentials${BRAND}`, `Cycling Gear: Trip Essentials${BRAND}`],
    [
      "Curated cycling gear and bike accessories for outdoor trips: helmets, lights, repair kits and apparel from handpicked partner brands.",
      "Curated cycling gear and bike accessories: helmets, lights, repair kits and apparel from handpicked partner brands.",
    ],
  ),
  tripGuides: hub(
    "trip guides",
    [`Trip Guides: Fly & Drive, RV, Permits & Loops${BRAND}`, `Trip Guides${BRAND}`],
    [
      "All MiniaLife trip guides in one place: road trip loops, gateway road trips, fly & drive, RV & camping and national park reservation guides.",
      "All trip guides in one place: road trip loops, fly & drive, RV & camping and national park reservation guides.",
    ],
  ),
} as const satisfies Record<string, HubSeo>;

export type HubKey = keyof typeof HUB_SEO;
