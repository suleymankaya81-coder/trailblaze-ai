import { describe, expect, it } from "vitest";
import { flightFareBadge } from "./flightFare";

describe("flightFareBadge", () => {
  it("is hidden when no useful cached fare exists", () => {
    expect(flightFareBadge(null)).toBeNull();
    expect(flightFareBadge(undefined)).toBeNull();
    expect(flightFareBadge(0)).toBeNull();
    expect(flightFareBadge(18)).toBeNull();
  });
  it("rounds a cached fare", () => {
    expect(flightFareBadge(179.6)).toBe("Recent fares from ~$180");
  });
});
