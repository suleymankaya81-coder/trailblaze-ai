import { describe, expect, it } from "vitest";
import { fallbackMapStyle, PRIMARY_MAP_STYLE, PRIMARY_MAP_TIMEOUT, FALLBACK_MAP_TIMEOUT } from "./mapRecovery";

describe("map provider recovery", () => {
  it("uses an independent OSM raster provider without API keys, fonts or sprites", () => {
    const style = fallbackMapStyle();
    const source = style.sources.basemap;
    expect(source.type).toBe("raster");
    if (source.type !== "raster") throw new Error("Expected raster source");
    expect(source.tiles).toEqual(["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]);
    expect(PRIMARY_MAP_STYLE).toContain("tiles.openfreemap.org");
    expect(style.glyphs).toBeUndefined();
    expect(style.sprite).toBeUndefined();
    expect(source.attribution).toContain("https://www.openstreetmap.org/copyright");
  });
  it("bounds both loading attempts instead of leaving an empty map forever", () => {
    expect(PRIMARY_MAP_TIMEOUT).toBe(4000);
    expect(FALLBACK_MAP_TIMEOUT).toBe(12000);
  });
});