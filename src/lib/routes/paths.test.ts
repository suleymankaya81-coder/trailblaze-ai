import { describe, expect, it } from "vitest";
import { canonicalPath, destinationPath, guidePath, parseLegacyGuidePath, regionPath } from "./paths";
import { absoluteUrl, SITE_ORIGIN } from "@/config/site";

describe("paths", () => {
  it("builds country/region/place addresses", () => {
    expect(destinationPath("acadia")).toBe("/destinations/us/maine/acadia");
    expect(destinationPath("acadia", "de")).toBe("/de/destinations/us/maine/acadia");
  });
  it("keeps unknown slugs flat so the server can redirect them", () => {
    expect(destinationPath("not-a-place")).toBe("/destinations/not-a-place");
  });
  it("nests guides under the place", () => {
    expect(guidePath("acadia", "glamping")).toBe("/destinations/us/maine/acadia/glamping");
  });
  it("slugifies region names", () => {
    expect(regionPath("US", "District of Columbia")).toBe("/destinations/us/district-of-columbia");
  });
  it("rewrites old flat and guide addresses", () => {
    expect(canonicalPath("/destinations/acadia")).toBe("/destinations/us/maine/acadia");
    expect(canonicalPath("/de/destinations/acadia#plan")).toBe("/de/destinations/us/maine/acadia#plan");
    expect(canonicalPath("/acadia-best-time-to-visit")).toBe("/destinations/us/maine/acadia/best-time");
    expect(canonicalPath("/acadia-itinerary")).toBe("/destinations/us/maine/acadia/itinerary");
    expect(canonicalPath("/about")).toBe("/about");
    expect(canonicalPath("/destinations/us")).toBe("/destinations/us");
  });
  it("ignores lookalike guide paths for unknown places", () => {
    expect(parseLegacyGuidePath("/nowhere-glamping")).toBeNull();
  });
  it("absolute URLs follow the central origin", () => {
    expect(absoluteUrl("/x")).toBe(`${SITE_ORIGIN}/x`);
  });
});
