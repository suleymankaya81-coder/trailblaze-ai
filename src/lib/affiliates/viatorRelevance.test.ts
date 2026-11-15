import { describe, expect, it } from "vitest";
import { isPlaceExperienceRelevant } from "./viatorRelevance";

describe("destination-specific real Viator results", () => {
  it("matches Seven Sisters without requiring the administrative country-park suffix", () => {
    expect(isPlaceExperienceRelevant("Seven Sisters Country Park", "Seven Sisters and South Downs Tour from Brighton", "Visit England's Seven Sisters", { countryCode: "gb", region: "England" })).toBe(true);
  });
  it("rejects Lake Tahoe tours for Clear Lake in Manitoba", () => {
    expect(isPlaceExperienceRelevant("Clear Lake", "Clear Kayak Tour of Lake Tahoe’s Crystal Waters", "Enjoy clear lake water in California", { countryCode: "ca", region: "Manitoba" })).toBe(false);
  });
  it("requires affirmative Canadian location for same-name Canadian places", () => {
    expect(isPlaceExperienceRelevant("Clear Lake", "Clear Lake guided walk", "Visit Wasagaming in Manitoba, Canada", { countryCode: "ca", region: "Manitoba" })).toBe(true);
  });
  it("rejects Alaska wilderness results for Allagash", () => {
    expect(isPlaceExperienceRelevant("Allagash Wilderness", "PRISTINE - Wilderness, Wildlife, Glacier Experience in Anchorage")).toBe(false);
  });
  it("rejects Oklahoma City tours for Broken Bow Lake", () => {
    expect(isPlaceExperienceRelevant("Broken Bow Lake", "Oklahoma City Bricktown Canal Narrated Boat Tour")).toBe(false);
  });
  it("retains Yellowstone tours named by the provider", () => {
    expect(isPlaceExperienceRelevant("Yellowstone National Park", "Yellowstone National Park Self-Guided Driving Audio Tour")).toBe(true);
  });
  it("accepts a destination explicitly visited in the provider description", () => {
    expect(isPlaceExperienceRelevant("Grand Teton", "Wildlife day trip", "Visit Grand Teton National Park with a guide.")).toBe(true);
  });
  it("does not match a short place name inside other words", () => {
    expect(isPlaceExperienceRelevant("Ely", "Lovely Las Vegas tour")).toBe(false);
  });
  it("UK places need British geography in the listing", () => {
    expect(isPlaceExperienceRelevant("Lake District National Park", "Lake District tour from Seattle", "", { countryCode: "gb", region: "Cumbria" })).toBe(false);
    expect(isPlaceExperienceRelevant("Lake District National Park", "Lake District day tour in England", "", { countryCode: "gb", region: "Cumbria" })).toBe(true);
  });
});

import { isNearbyExperienceRelevant } from "./viatorRelevance";
describe("nearby Viator fallback", () => {
  it("accepts a tour from the gateway town", () => {
    expect(isNearbyExperienceRelevant("Yorkshire Dales day trip from Skipton, England", "", { gateways: ["Skipton"], area: "Yorkshire Dales", state: "England", countryCode: "gb" })).toBe(true);
  });
  it("rejects a same-name town in another country", () => {
    expect(isNearbyExperienceRelevant("Banff food tour", "Scotland coast", { gateways: ["Banff"], area: "Canadian Rockies", state: "Alberta", countryCode: "ca" })).toBe(false);
  });
  it("does not accept a state name alone", () => {
    expect(isNearbyExperienceRelevant("Alabama BBQ tour", "", { gateways: ["Fort Payne"], area: "Northeastern Alabama", state: "Alabama", countryCode: "us" })).toBe(false);
  });
});
