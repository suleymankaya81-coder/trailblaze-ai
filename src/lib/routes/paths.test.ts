import { describe, expect, it } from "vitest";
import { destinationPath, geoDestinationPath, geoGuidePath, regionPath } from "./paths";
import { absoluteUrl, SITE_ORIGIN } from "@/config/site";

const zion = { slug: "zion", country_code: "us", region_slug: "utah" };

describe("paths", () => {
  it("keeps the current flat destination address", () => {
    expect(destinationPath("zion")).toBe("/destinations/zion");
    expect(destinationPath("zion", "de")).toBe("/de/destinations/zion");
  });
  it("builds country/region/place addresses", () => {
    expect(geoDestinationPath(zion)).toBe("/destinations/us/utah/zion");
    expect(geoDestinationPath(zion, "de")).toBe("/de/destinations/us/utah/zion");
  });
  it("nests guides under the place", () => {
    expect(geoGuidePath(zion, "glamping")).toBe("/destinations/us/utah/zion/glamping");
  });
  it("slugifies region names", () => {
    expect(regionPath("US", "District of Columbia")).toBe("/destinations/us/district-of-columbia");
  });
  it("absolute URLs follow the central origin", () => {
    expect(absoluteUrl("/x")).toBe(`${SITE_ORIGIN}/x`);
  });
});
