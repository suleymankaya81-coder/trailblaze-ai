import { describe, expect, it } from "vitest";
import { fillParams, localTarget } from "./localPath";

describe("German link targets", () => {
  it("points place, road-trip and hub links to the German version", () => {
    expect(localTarget(fillParams("/destinations/$slug", { slug: "acadia" }), "de")).toBe("/de/destinations/acadia");
    expect(localTarget("/road-trips/utah-mighty-5-loop", "de")).toBe("/de/road-trips/utah-mighty-5-loop");
    expect(localTarget("/trip-guides", "de")).toBe("/de/trip-guides");
    expect(localTarget("/", "de")).toBe("/de");
  });
  it("keeps saved search guides and untranslated pages in English", () => {
    expect(localTarget("/acadia-best-time-to-visit", "de")).toBeNull();
    expect(localTarget("/privacy", "de")).toBeNull();
    expect(localTarget("/gear/category/bike", "de")).toBeNull();
  });
  it("leaves English pages unchanged", () => {
    expect(localTarget("/destinations/acadia", "en")).toBeNull();
  });
});
