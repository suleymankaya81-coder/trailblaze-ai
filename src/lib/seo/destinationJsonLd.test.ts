import { describe, expect, it } from "vitest";
import type { DestinationView } from "@/lib/data/destinations.functions";
import { buildDestinationJsonLd } from "./destinationJsonLd";

const dest = {
  name: "Yellowstone", slug: "yellowstone", region: "Wyoming", tagline: "Geysers and wildlife",
  heroImage: "https://example.org/yellowstone.jpg", stays: [{ externalUrl: "https://example.org/booking" }],
  travelPlan: { days: [
    { title: "Geysers", stops: [{ name: "Old Faithful", detail: "View the geyser from designated boardwalks." }, { name: "Grand Prismatic Spring", detail: "View the thermal basin from designated paths." }] },
    { title: "Canyon", stops: [{ name: "Artist Point", detail: "Visit the overlook for views of the Lower Falls." }] },
  ] },
} as unknown as DestinationView;

describe("destination structured data", () => {
  it("preserves the visible daily stop order in one suggested trip", () => {
    const result = buildDestinationJsonLd(dest, "https://minialife.com/destinations/yellowstone");
    expect(result).toMatchObject({ "@graph": expect.arrayContaining([{
      "@type": "TouristTrip", "@id": "https://minialife.com/destinations/yellowstone#trip",
      name: "2 days in Yellowstone", url: "https://minialife.com/destinations/yellowstone#flow",
      description: expect.any(String),
      itinerary: { "@type": "ItemList", itemListOrder: "https://schema.org/ItemListOrderAscending", numberOfItems: 3,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Day 1: Geysers", item: { "@type": "TouristAttraction", name: "Old Faithful", description: dest.travelPlan?.days[0].stops[0].detail } },
          { "@type": "ListItem", position: 2, name: "Day 1: Geysers", item: { "@type": "TouristAttraction", name: "Grand Prismatic Spring", description: dest.travelPlan?.days[0].stops[1].detail } },
          { "@type": "ListItem", position: 3, name: "Day 2: Canyon", item: { "@type": "TouristAttraction", name: "Artist Point", description: dest.travelPlan?.days[1].stops[0].detail } },
        ],
      },
    }]) });
  });
  it("does not invent live availability from a booking URL", () => {
    const result = JSON.stringify(buildDestinationJsonLd(dest, "https://minialife.com/destinations/yellowstone"));
    expect(result).not.toContain('"availability"');
    expect(result).not.toContain('"offers"');
  });
  it("omits a trip when no visible stored daily plan exists", () => {
    expect(JSON.stringify(buildDestinationJsonLd({ ...dest, travelPlan: null }, "https://minialife.com/destinations/yellowstone"))).not.toContain('"TouristTrip"');
  });
});