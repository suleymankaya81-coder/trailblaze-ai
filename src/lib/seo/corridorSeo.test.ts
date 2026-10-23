import { describe, expect, it } from "vitest";
import { CORRIDORS } from "./corridors";
import { buildCorridorJsonLd } from "./corridorSeo";

describe("gateway suggested-trip data", () => {
  it("keeps the San Francisco loop in visible stop order and returns to SFO", () => {
    const corridor = CORRIDORS.find((c) => c.slug === "california-icons-from-san-francisco");
    if (!corridor) throw new Error("SFO corridor missing");
    const stops = [
      { slug: "san-francisco", name: "San Francisco" },
      { slug: "yosemite", name: "Yosemite" },
      { slug: "lake-tahoe", name: "Lake Tahoe" },
      { slug: "napa-valley", name: "Napa Valley" },
      { slug: "monterey", name: "Monterey" },
      { slug: "big-sur", name: "Big Sur" },
    ];
    const result = buildCorridorJsonLd(corridor, stops, "https://minialife.com/corridors/california-icons-from-san-francisco");
    const trip = result["@graph"][0];
    if (!("itinerary" in trip) || !trip.itinerary) throw new Error("Trip missing");
    expect(trip.itinerary.numberOfItems).toBe(7);
    expect(trip.itinerary.itemListElement.map((entry) => entry.item.url)).toEqual([
      "https://minialife.com/destinations/san-francisco",
      "https://minialife.com/destinations/yosemite",
      "https://minialife.com/destinations/lake-tahoe",
      "https://minialife.com/destinations/napa-valley",
      "https://minialife.com/destinations/monterey",
      "https://minialife.com/destinations/big-sur",
      "https://minialife.com/destinations/san-francisco",
    ]);
    expect(trip.itinerary.itemListElement.at(-1)?.item.name).toBe("Return to San Francisco (SFO)");
  });

  it("does not turn partner links into an offer or promise availability", () => {
    const corridor = CORRIDORS[0];
    if (!corridor) throw new Error("Corridor missing");
    const result = buildCorridorJsonLd(corridor, [{ slug: "las-vegas", name: "Las Vegas" }], "https://minialife.com/corridors/grand-circle-from-las-vegas");
    expect(result["@graph"][0]["@type"]).toBe("TouristTrip");
    expect(result["@graph"][0]).not.toHaveProperty("offers");
    expect(result["@graph"][0]).not.toHaveProperty("availability");
  });
});