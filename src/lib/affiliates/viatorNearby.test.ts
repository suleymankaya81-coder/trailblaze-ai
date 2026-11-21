import { describe, expect, it } from "vitest";
import { nearestViatorHub } from "./viatorNearby";

describe("nearest Viator day-trip base", () => {
  const list: [number, string, number, number, string][] = [[1, "Nice", 43.7, 7.27, "fr"], [2, "Sanremo", 43.82, 7.78, "it"], [3, "Marseille", 43.3, 5.37, "fr"]];
  it("picks the closest base in the same country", () => {
    expect(nearestViatorHub(43.75, 7.6, "fr", 60, list)?.name).toBe("Nice");
  });
  it("never crosses a border even when the foreign town is closer", () => {
    expect(nearestViatorHub(43.8, 7.7, "it", 60, list)?.name).toBe("Sanremo");
    expect(nearestViatorHub(43.8, 7.7, "fr", 60, list)?.name).toBe("Nice");
  });
  it("returns nothing beyond 60 km", () => {
    expect(nearestViatorHub(45.5, 6.0, "fr", 60, list)).toBeNull();
  });
  it("uses the real snapshot for a French park", () => {
    expect(nearestViatorHub(43.75, 6.35, "fr")).not.toBeNull();
  });
});

import { isOutdoorListing } from "./viatorNearby";
describe("hub fallback keeps outdoor listings only", () => {
  it("accepts nature activities", () => {
    expect(isOutdoorListing("Thrilling Speedboat Ride on River in Warsaw")).toBe(true);
    expect(isOutdoorListing("DAVOS: Paragliding Tandem Flight In Swiss Alps")).toBe(true);
  });
  it("rejects city or unrelated activities", () => {
    expect(isOutdoorListing("FSO Gunrange, Shooting Package US ARMY")).toBe(false);
    expect(isOutdoorListing("Davos Switzerland Escape Game Private Adventure")).toBe(false);
    expect(isOutdoorListing("Warsaw Photographer - One Hour 200 Photos")).toBe(false);
  });
});
