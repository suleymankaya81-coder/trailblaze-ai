import { describe, expect, it } from "vitest";
import { carLinkFor, countryCurrency, formatCountryPrice, partnersFor, rvLinkFor } from "./countryPartners";

const AFTER_BF = Date.UTC(2027, 0, 10);
describe("country partners", () => {
  it("US campgrounds are RoverPass, Campspot and Harvest Hosts", () => expect(partnersFor("us", "campground")).toEqual(["roverpass", "campspot", "harvest_hosts"]));
  it("Canada has no US-only campground partners", () => expect(partnersFor("CA", "campground")).toEqual([]));
  it("unknown countries get no partners", () => { expect(partnersFor("fr", "rv")).toEqual([]); expect(rvLinkFor("fr")).toBeNull(); expect(carLinkFor("fr")).toBeNull(); });
  it("Canada RV link goes to the Canada search with the affiliate code", () => expect(rvLinkFor("ca", AFTER_BF)).toBe("https://www.motorhomerepublic.com/canada/?affiliate=minialife"));
  it("Canada RV link ignores the US Black Friday deal", () => expect(rvLinkFor("ca", Date.UTC(2026, 10, 20))).toContain("/canada/"));
  it("US RV link stays on the USA search", () => expect(rvLinkFor("us", AFTER_BF)).toBe("https://www.motorhomerepublic.com/usa/?affiliate=minialife"));
  it("currency follows the country", () => { expect(countryCurrency("ca")).toBe("CAD"); expect(countryCurrency("us")).toBe("USD"); });
  it("formats Canadian prices in CAD", () => expect(formatCountryPrice(120, "ca")).toBe("$120"));
  it("formats non-local currency explicitly", () => expect(formatCountryPrice(120, "us", "CAD")).toBe("CA$120"));
});
