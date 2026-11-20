import { describe, expect, it } from "vitest";
import { carLinkFor, countryCurrency, formatCountryPrice, partnersFor, rvLinkFor } from "./countryPartners";

const AFTER_BF = Date.UTC(2027, 0, 10);
describe("country partners", () => {
  it("Australia uses AUD and the verified Australia campervan page", () => {
    expect(countryCurrency("au")).toBe("AUD");
    expect(rvLinkFor("au", Date.UTC(2026, 10, 20))).toBe("https://www.motorhomerepublic.com/australia-campervan-rental?affiliate=minialife");
    expect(partnersFor("au", "campground")).toEqual([]);
  });
  it("New Zealand uses NZD and excludes US campground partners", () => {
    expect(countryCurrency("nz")).toBe("NZD");
    expect(partnersFor("nz", "campground")).toEqual([]);
  });
  it("New Zealand uses its verified RV page, not the US promotion", () => {
    expect(rvLinkFor("nz", Date.UTC(2026, 10, 20))).toBe("https://www.motorhomerepublic.com/new-zealand-motorhome-rental?affiliate=minialife");
    expect(carLinkFor("nz")).toBe("https://www.airportrentals.com/?affiliate=minialife");
  });
  it("Netherlands uses EUR and excludes US campground partners", () => {
    expect(countryCurrency("nl")).toBe("EUR");
    expect(partnersFor("nl", "campground")).toEqual([]);
    expect(rvLinkFor("nl", Date.UTC(2026, 10, 20))).toBe("https://www.motorhomerepublic.com/netherlands-motorhome-rental?affiliate=minialife");
  });
  it("US campgrounds are RoverPass, Campspot and Harvest Hosts", () => expect(partnersFor("us", "campground")).toEqual(["roverpass", "campspot", "harvest_hosts"]));
  it("Canada has no US-only campground partners", () => expect(partnersFor("CA", "campground")).toEqual([]));
  it("unknown countries get no partners", () => { expect(partnersFor("jp", "rv")).toEqual([]); expect(rvLinkFor("jp")).toBeNull(); expect(carLinkFor("jp")).toBeNull(); });
  it("Canada RV link goes to the Canada search with the affiliate code", () => expect(rvLinkFor("ca", AFTER_BF)).toBe("https://www.motorhomerepublic.com/canada/?affiliate=minialife"));
  it("Canada RV link ignores the US Black Friday deal", () => expect(rvLinkFor("ca", Date.UTC(2026, 10, 20))).toContain("/canada/"));
  it("US RV link stays on the USA search", () => expect(rvLinkFor("us", AFTER_BF)).toBe("https://www.motorhomerepublic.com/united-states-rv-rental?affiliate=minialife"));
  it("currency follows the country", () => { expect(countryCurrency("ca")).toBe("CAD"); expect(countryCurrency("us")).toBe("USD"); });
  it("formats Canadian prices in CAD", () => expect(formatCountryPrice(120, "ca")).toBe("$120"));
  it("formats non-local currency explicitly", () => expect(formatCountryPrice(120, "us", "CAD")).toBe("CA$120"));
  it("UK has no US-only campground partners", () => expect(partnersFor("GB", "campground")).toEqual([]));
  it("UK RV link goes to the UK search and ignores the US deal", () => expect(rvLinkFor("gb", Date.UTC(2026, 10, 20))).toBe("https://www.motorhomerepublic.com/united-kingdom/?affiliate=minialife"));
  it("DACH uses local currencies and no US campgrounds", () => { expect(countryCurrency("de")).toBe("EUR"); expect(countryCurrency("at")).toBe("EUR"); expect(countryCurrency("ch")).toBe("CHF"); expect(partnersFor("de", "campground")).toEqual([]); });
  it("German RV link goes to the Germany search", () => expect(rvLinkFor("de", AFTER_BF)).toBe("https://www.motorhomerepublic.com/germany/?affiliate=minialife"));
  it("France, Portugal and Greece use EUR and no US campgrounds", () => {
    expect(countryCurrency("fr")).toBe("EUR");
    expect(countryCurrency("pt")).toBe("EUR");
    expect(countryCurrency("gr")).toBe("EUR");
    expect(partnersFor("fr", "campground")).toEqual([]);
    expect(partnersFor("pt", "campground")).toEqual([]);
    expect(partnersFor("gr", "campground")).toEqual([]);
  });
  it("French, Portuguese and Greek RV links go to their own search", () => {
    expect(rvLinkFor("fr", AFTER_BF)).toBe("https://www.motorhomerepublic.com/france/?affiliate=minialife");
    expect(rvLinkFor("pt", AFTER_BF)).toBe("https://www.motorhomerepublic.com/portugal/?affiliate=minialife");
    expect(rvLinkFor("gr", AFTER_BF)).toBe("https://www.motorhomerepublic.com/greece/?affiliate=minialife");
  });
  it("Nordic countries use their own currencies and no US campgrounds", () => {
    expect(["no", "is", "se", "fi", "dk"].map((c) => countryCurrency(c))).toEqual(["NOK", "ISK", "SEK", "EUR", "DKK"]);
    expect(partnersFor("no", "campground")).toEqual([]);
  });
});
