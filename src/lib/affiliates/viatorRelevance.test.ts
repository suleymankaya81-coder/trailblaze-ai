import { describe, expect, it } from "vitest";
import { isPlaceExperienceRelevant } from "./viatorRelevance";

describe("destination-specific real Viator results", () => {
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
});