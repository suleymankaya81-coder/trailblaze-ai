import { describe, expect, it } from "vitest";
import { airportRentalsLink, motorhomeRepublicLink, withWebjetAffiliate } from "./webjet";
describe("webjet links", () => {
  it("Motorhome Republic carries affiliate=minialife", () => expect(new URL(motorhomeRepublicLink()).searchParams.get("affiliate")).toBe("minialife"));
  it("Airport Rentals carries affiliate=minialife", () => expect(airportRentalsLink()).toBe("https://www.airportrentals.com/?affiliate=minialife"));
  it("does not duplicate the code", () => expect(withWebjetAffiliate(motorhomeRepublicLink())).toBe(motorhomeRepublicLink()));
  it("leaves other hosts alone", () => expect(withWebjetAffiliate("https://www.rei.com/")).toBe("https://www.rei.com/"));
  it("repairs retired USA URLs before the provider can discard the affiliate code", () => {
    expect(withWebjetAffiliate("https://www.motorhomerepublic.com/usa/?affiliate=minialife")).toBe("https://www.motorhomerepublic.com/united-states-rv-rental?affiliate=minialife");
  });
});

import { motorhomeRepublicLink as mhr } from "./webjet";
import { isMhrBlackFridayLive } from "./mhrBlackFriday";
describe("MHR Black Friday 2026", () => {
  it("live on 12 Nov, off after 2 Dec 10:59 UTC", () => {
    expect(isMhrBlackFridayLive(Date.UTC(2026, 10, 12))).toBe(true);
    expect(isMhrBlackFridayLive(Date.UTC(2026, 11, 2, 11))).toBe(false);
  });
  it("deal link keeps affiliate tag, reverts after sale", () => {
    const live = mhr(undefined, Date.UTC(2026, 10, 12));
    expect(live).toContain("special-offer-black-friday-sale");
    expect(live).toContain("affiliate=minialife");
    expect(mhr(undefined, Date.UTC(2026, 11, 3))).toBe("https://www.motorhomerepublic.com/united-states-rv-rental?affiliate=minialife");
  });
});
