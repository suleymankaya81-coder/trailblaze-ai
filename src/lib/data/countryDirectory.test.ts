import { describe, expect, it } from "vitest";
import { COUNTRY_DIRECTORY, TOTAL_PLACES, countryFlag } from "./countryDirectory";

describe("country directory", () => {
  it("lists every published country with real counts", () => {
    expect(COUNTRY_DIRECTORY.map((c) => c.code).sort()).toEqual(["al", "at", "au", "ba", "be", "bg", "ca", "ch", "cy", "cz", "de", "dk", "ee", "es", "fi", "fr", "gb", "gr", "hr", "hu", "ie", "is", "it", "lt", "lu", "lv", "me", "mk", "mt", "nl", "no", "nz", "pl", "pt", "ro", "rs", "se", "si", "sk", "us"]);
    expect(TOTAL_PLACES).toBe(COUNTRY_DIRECTORY.reduce((s, c) => s + c.places, 0));
    expect(COUNTRY_DIRECTORY.every((c) => c.places > 0 && c.regions > 0)).toBe(true);
  });
  it("groups European countries under Europe", () => {
    expect(COUNTRY_DIRECTORY.find((c) => c.code === "it")?.continent).toBe("europe");
    expect(countryFlag("us")).toBe("🇺🇸");
  });
  it("includes Belgium's 38 published places in Europe", () => {
    expect(COUNTRY_DIRECTORY.find((c) => c.code === "be")).toMatchObject({ places: 38, regions: 2, continent: "europe", flag: "🇧🇪" });
  });
});
