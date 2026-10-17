import type { DestinationView } from "@/lib/data/destinations.functions";

// Describe the visible guide, not unverified live inventory or a bookable tour.
export function buildDestinationJsonLd(dest: DestinationView, pageUrl: string): Record<string, unknown> {
  const destination: Record<string, unknown> = {
    "@type": "TouristDestination",
    "@id": `${pageUrl}#destination`,
    name: dest.name,
    url: pageUrl,
  };
  if (dest.tagline) destination.description = dest.tagline;
  if (dest.heroImage) destination.image = dest.heroImage;
  if (dest.region) destination.address = dest.region;
  const graph: Record<string, unknown>[] = [destination, {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "MiniaLife", item: "https://minialife.com/" },
      { "@type": "ListItem", position: 2, name: "Destinations", item: "https://minialife.com/destinations" },
      { "@type": "ListItem", position: 3, name: dest.name, item: pageUrl },
    ],
  }];
  const plan = dest.travelPlan;
  if (plan) {
    graph.push({
      "@type": "TouristTrip",
      "@id": `${pageUrl}#trip`,
      name: `${plan.days.length} days in ${dest.name}`,
      url: `${pageUrl}#flow`,
      description: `Suggested sightseeing itinerary for ${dest.name}; not a bookable guided tour.`,
      itinerary: {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: plan.days.reduce((count, day) => count + day.stops.length, 0),
        itemListElement: plan.days.flatMap((day, dayIndex) => day.stops.map((stop, stopIndex) => ({
          "@type": "ListItem",
          position: plan.days.slice(0, dayIndex).reduce((count, previous) => count + previous.stops.length, 0) + stopIndex + 1,
          name: `Day ${dayIndex + 1}: ${day.title}`,
          item: { "@type": "TouristAttraction", name: stop.name, description: stop.detail },
        }))),
      },
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
