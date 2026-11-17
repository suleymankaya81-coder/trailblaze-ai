import { describe, expect, it } from "vitest";
import { COUNTRY_DIRECTORY, TOTAL_PLACES, countryFlag } from "./countryDirectory";

describe("country directory", () => {
  it("lists every published country with real counts", () => {
    expect(COUNTRY_DIRECTORY.map((c) => c.code).sort()).toEqual(["at", "ca", "ch", "de", "es", "fr", "gb", "gr", "it", "pt", "us"]);
    expect(TOTAL_PLACES).toBe(COUNTRY_DIRECTORY.reduce((s, c) => s + c.places, 0));
    expect(COUNTRY_DIRECTORY.every((c) => c.places > 0 && c.regions > 0)).toBe(true);
  });
  it("groups European countries under Europe", () => {
    expect(COUNTRY_DIRECTORY.find((c) => c.code === "it")?.continent).toBe("europe");
    expect(countryFlag("us")).toBe("🇺🇸");
  });
});
