import { describe, it, expect } from "vitest";
import { travelDescription } from "./travelMetadata";
const facts = { name: "Acadia", region: "Maine", destinationType: "national_park", tripDurationDays: "3–4 days", bestSeason: "June–October" };
describe("stored travel metadata", () => {
  it("preserves city/region, type, visit duration, season and camping context", () => {
    const d = travelDescription(facts, "destination", "Fallback");
    for (const value of ["Maine", "national park", "3–4 days", "June–October", "camping"]) expect(d).toContain(value);
    expect(d.length).toBeLessThanOrEqual(160);
  });
  it("does not invent unknown season or duration", () => {
    expect(travelDescription({ name: "Acadia" }, "rv-camping", "Fallback")).toBe("Acadia: RV parks, campgrounds & route.");
  });
});