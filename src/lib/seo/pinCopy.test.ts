import { describe, expect, it } from "vitest";
import { DESC_MAX, DESC_MIN, type PinKind, pinDescription, pinTitle } from "./pinCopy";

const base = {
  name: "Zion National Park",
  tagline: "Towering sandstone cliffs and slot canyons in southern Utah. A classic stop on any desert road trip.",
  seoTitle: "Top 10 Things to Do in Zion National Park | MiniaLife",
  seoDescription: "Discover the best time to visit Zion. Learn about weather, crowds and shuttle seasons for your trip.",
  bestSeason: "March – May, September – November",
  duration: "3-5 days",
  airport: "SGU",
};
const kinds: PinKind[] = ["destination", "best_time", "things_to_do", "glamping", "trip_planner"];

describe("pin copy", () => {
  for (const kind of kinds) {
    it(`${kind}: title ≤100, description 250–450, no credits or broken text`, () => {
      const t = pinTitle({ ...base, kind });
      const d = pinDescription({ ...base, kind });
      expect(t.length).toBeLessThanOrEqual(100);
      expect(d.length).toBeGreaterThanOrEqual(DESC_MIN);
      expect(d.length).toBeLessThanOrEqual(DESC_MAX);
      expect(d).not.toMatch(/Photo:|Wikimedia|undefined|null/);
      expect(`${t} ${d}`).not.toMatch(/National Park National Park|  /);
    });
  }
  it("uses the real list count only when the guide has one", () => {
    expect(pinTitle({ ...base, kind: "things_to_do" })).toBe("10 Best Things to Do in Zion National Park");
    expect(pinTitle({ ...base, seoTitle: "Things to Do in Zion", kind: "things_to_do" })).toBe("Best Things to Do in Zion National Park: Outdoor Guide");
  });
  it("still reaches 250 chars when the source text is thin", () => {
    const d = pinDescription({ kind: "glamping", name: "Stowe", seoDescription: "Find cabins near Stowe." });
    expect(d.length).toBeGreaterThanOrEqual(DESC_MIN);
  });
});
