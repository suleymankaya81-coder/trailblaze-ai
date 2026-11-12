import { describe, expect, it } from "vitest";
import { fillParams, localTarget } from "./localPath";

describe("German link targets", () => {
  it("points place, road-trip and hub links to the German version", () => {
    expect(localTarget(fillParams("/destinations/$slug", { slug: "acadia" }), "de")).toBe("/de/destinations/us/maine/acadia");
    expect(localTarget("/road-trips/utah-mighty-5-loop", "de")).toBe("/de/road-trips/utah-mighty-5-loop");
    expect(localTarget("/trip-guides", "de")).toBe("/de/trip-guides");
    expect(localTarget("/", "de")).toBe("/de");
  });
  it("keeps saved search guides and untranslated pages in English", () => {
    // Guides have no German version: the link goes to the English guide at its new address.
    expect(localTarget("/acadia-best-time-to-visit", "de")).toBe("/destinations/us/maine/acadia/best-time");
    expect(localTarget("/privacy", "de")).toBeNull();
    expect(localTarget("/gear/category/bike", "de")).toBeNull();
  });
  it("rewrites old English addresses and leaves current ones unchanged", () => {
    expect(localTarget("/destinations/acadia", "en")).toBe("/destinations/us/maine/acadia");
    expect(localTarget("/about", "en")).toBeNull();
  });
});
