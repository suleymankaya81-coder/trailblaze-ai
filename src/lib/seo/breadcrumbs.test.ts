import { describe, expect, it } from "vitest";

import { breadcrumbJsonLd, destinationCrumbs, hubCrumbs, placeGuideCrumbs } from "./breadcrumbs";

const dest = { name: "Yellowstone National Park", slug: "yellowstone" };

describe("breadcrumbs", () => {
  it("place guides sit under Destinations and their place", () => {
    expect(placeGuideCrumbs(dest, "RV & camping", "/rv-camping/yellowstone").map((c) => c.path)).toEqual([
      "/",
      "/destinations",
      "/destinations/us",
      "/destinations/us/wyoming",
      "/destinations/us/wyoming/yellowstone",
      "/rv-camping/yellowstone",
    ]);
  });

  it("place pages sit under country and state; guide directories have three levels", () => {
    expect(destinationCrumbs(dest).map((c) => c.name)).toEqual(["Home", "Destinations", "United States", "Wyoming", "Yellowstone National Park"]);
    expect(hubCrumbs("RV & camping guides", "/rv-camping").map((c) => c.path)).toEqual(["/", "/trip-guides", "/rv-camping"]);
  });

  it("JSON-LD uses absolute URLs with ordered positions", () => {
    const ld = breadcrumbJsonLd(destinationCrumbs(dest));
    expect(ld.itemListElement.map((i) => [i.position, i.item])).toEqual([
      [1, "https://minialife.com/"],
      [2, "https://minialife.com/destinations"],
      [3, "https://minialife.com/destinations/us"],
      [4, "https://minialife.com/destinations/us/wyoming"],
      [5, "https://minialife.com/destinations/us/wyoming/yellowstone"],
    ]);
  });
});
