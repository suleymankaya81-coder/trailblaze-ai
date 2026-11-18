import { describe, expect, it } from "vitest";
import { countryMapLinks, validMapCoordinate } from "./countryMap";

describe("country exploration map links", () => {
  it("uses the actual country and region in English and German destination links", () => {
    const place = { slug: "dynjandi", name: "Dynjandi", region: "westfjords", lat: 65.73, lng: -23.19, access: "road" };
    expect(countryMapLinks("is", place).destination).toBe("/destinations/is/westfjords/dynjandi");
    expect(countryMapLinks("is", place, "de").destination).toBe("/de/destinations/is/westfjords/dynjandi");
    const url = new URL(countryMapLinks("is", place).maps ?? "https://invalid.test");
    expect(url.searchParams.get("query")).toBe("65.73000,-23.19000");
    expect(url.pathname).toBe("/maps/search/");
  });
  it("rejects absent, infinite and out-of-range coordinates instead of creating misleading map targets", () => {
    expect(validMapCoordinate(null, 12)).toBe(false);
    expect(validMapCoordinate(91, 12)).toBe(false);
    expect(validMapCoordinate(12, Infinity)).toBe(false);
    expect(validMapCoordinate(12, -181)).toBe(false);
    expect(validMapCoordinate(0, 0)).toBe(true);
  });
});