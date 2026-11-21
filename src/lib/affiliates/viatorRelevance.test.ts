import { describe, expect, it } from "vitest";
import { isPlaceExperienceRelevant } from "./viatorRelevance";

describe("destination-specific real Viator results", () => {
  it("accepts Lake Garda listings for the explicitly mapped Alto Garda park", () => {
    expect(isPlaceExperienceRelevant("Alto Garda Bresciano Regional Park", "Lake Garda Boat Cruise", "Depart Sirmione, Italy", { countryCode: "it" })).toBe(true);
  });
  it("does not require international administrative suffixes", () => {
    expect(isPlaceExperienceRelevant("Sierra Nevada Parque Nacional", "Sierra Nevada hiking tour in Spain", "", { countryCode: "es" })).toBe(true);
    expect(isPlaceExperienceRelevant("Black Forest Nature Park", "Black Forest guided walk", "Germany", { countryCode: "de" })).toBe(true);
  });
  it("does not relax multiword names to arbitrary single words", () => {
    expect(isPlaceExperienceRelevant("Grand Teton", "Grand Canyon tour")).toBe(false);
    expect(isPlaceExperienceRelevant("Alto Garda Bresciano Regional Park", "Lake Como cruise in Italy")).toBe(false);
  });
  it("rejects Black River Gorges in Mauritius and scattered words for Black Forest", () => {
    expect(isPlaceExperienceRelevant("Black Forest National Park", "Hiking in the Black River Gorges National Parc - Native Forest", "Mauritius")).toBe(false);
    expect(isPlaceExperienceRelevant("Black Forest National Park", "Quebec forest walk", "See black bears in Canada")).toBe(false);
    expect(isPlaceExperienceRelevant("Black Forest National Park", "Baden-Baden, Black Forest and Strasbourg Day Trip from Frankfurt")).toBe(true);
  });
  it("does not reduce the Swiss National Park to any Swiss tour", () => {
    expect(isPlaceExperienceRelevant("Swiss National Park", "Lucerne Walking & Boat Tour: The Best Swiss Experience")).toBe(false);
    expect(isPlaceExperienceRelevant("Swiss National Park", "Hiking in the Swiss National Park")).toBe(true);
  });
  it("does not reduce Finland's Archipelago National Park to generic island tours", () => {
    expect(isPlaceExperienceRelevant("Archipelago National Park", "Stockholm Archipelago Boat Tour", "Sweden")).toBe(false);
    expect(isPlaceExperienceRelevant("Archipelago National Park", "Archipelago National Park kayaking", "Finland")).toBe(true);
  });
  it("distinguishes Marseille's Calanques park from Esterel coves", () => {
    expect(isPlaceExperienceRelevant("Calanques National Park", "Esterel Calanques Boat Tour from Saint-Raphael", "Cruise the Esterel coast")).toBe(false);
    expect(isPlaceExperienceRelevant("Calanques National Park", "Beautiful boat tour in the Calanques", "Depart Marseille")).toBe(true);
  });
  it("normalizes Nordic and German letters without losing the place name", () => {
    expect(isPlaceExperienceRelevant("Þingvellir National Park", "Thingvellir guided hike")).toBe(true);
    expect(isPlaceExperienceRelevant("Ærø", "Aero island tour")).toBe(true);
  });
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
  it("rejects Ontario gateway tours for a Newfoundland park", () => {
    expect(isNearbyExperienceRelevant("Toronto–Wasaga Beach driving tour", "Ontario, Canada", { gateways: ["Toronto"], state: "Newfoundland and Labrador", countryCode: "ca" })).toBe(false);
  });
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

describe("international word order and spelling", () => {
  it("accepts Gorges du Verdon listings in either word order", () => {
    expect(isPlaceExperienceRelevant("Gorges du Verdon", "Gorges du Verdon Shared Tour from Nice", "", { countryCode: "fr" })).toBe(true);
    expect(isPlaceExperienceRelevant("Gorges du Verdon", "Rafting in the Verdon Gorge", "", { countryCode: "fr" })).toBe(true);
  });
  it("accepts Sierra spelling for Serra de Tramuntana", () => {
    expect(isPlaceExperienceRelevant("Serra de Tramuntana", "Sierra de Tramuntana hiking day", "Mallorca", { countryCode: "es" })).toBe(true);
  });
  it("accepts a UK listing that names a British city instead of the country", () => {
    expect(isPlaceExperienceRelevant("Lake District National Park", "Lake District day tour", "Departs Manchester", { countryCode: "gb", region: "Cumbria" })).toBe(true);
  });
  it("does not treat New York as British geography", () => {
    expect(isPlaceExperienceRelevant("Lake District National Park", "Lake District tour", "Departs New York", { countryCode: "gb", region: "Cumbria" })).toBe(false);
  });
});
