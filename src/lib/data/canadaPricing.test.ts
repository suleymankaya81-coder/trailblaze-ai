import { describe, expect, it } from "vitest";
import { cadToUsd, canadaEstimate, CANADA_PRICE_BASIS } from "./canadaPricing";
import { isNonRoadDestination, isOfferEligibleForPlace } from "./destinationAccess";
describe("Canadian estimates in USD", () => {
  it("converts Canadian car average rather than US $45 default", () => { expect(CANADA_PRICE_BASIS.cad.car).toBe(52); expect(cadToUsd(52)).toBe(36); });
  it("converts Canadian SUV benchmark", () => { expect(cadToUsd(CANADA_PRICE_BASIS.cad.suv)).toBe(51); });
  it("uses drivable motorhome average, not towable units", () => { expect(cadToUsd(CANADA_PRICE_BASIS.cad.motorhome)).toBe(163); });
  it("uses Canadian campervan average", () => { expect(cadToUsd(CANADA_PRICE_BASIS.cad.campervan)).toBe(162); });
  it("does not invent cabin averages", () => { expect(canadaEstimate("cabin")).toBe("Check live price"); });
});
describe("access and country eligibility", () => {
  it("rejects fly-in road rentals", () => { expect(isOfferEligibleForPlace("airport_rentals", "ca", true, "rv_rental")).toBe(false); });
  it("rejects US-only Canadian campground offers", () => { expect(isOfferEligibleForPlace("campspot", "ca", false, "stay")).toBe(false); });
  it("allows Canadian road rentals", () => { expect(isOfferEligibleForPlace("motorhome_republic", "ca", false, "rv_rental")).toBe(true); });
  it("honors explicit non-road access", () => { expect(isNonRoadDestination("test", "fly-in")).toBe(true); });
});