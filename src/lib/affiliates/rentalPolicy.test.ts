import { describe, expect, it } from "vitest";
import { isApprovedRental, rentalPartnerUrl, RETIRED_CAR_PARTNERS } from "./rentalPolicy";

describe("exclusive rental partnerships", () => {
  it("allows only Motorhome Republic and Airport Rentals for rentals", () => {
    expect(isApprovedRental("motorhome_republic", "rv_rental")).toBe(true);
    expect(isApprovedRental("airport_rentals", "rv_rental")).toBe(true);
    for (const partner of [...RETIRED_CAR_PARTNERS, "bikesbooking", "arrive_outdoors"]) {
      expect(isApprovedRental(partner, "rv_rental")).toBe(false);
      expect(isApprovedRental(partner, "gear_rental")).toBe(false);
    }
    expect(isApprovedRental("rei", "gear_purchase")).toBe(true);
  });
  it("routes retired car offers to the approved tracked Airport Rentals link", () => {
    for (const partner of [...RETIRED_CAR_PARTNERS, "airport_rentals"]) {
      expect(rentalPartnerUrl(partner)).toBe("https://www.airportrentals.com/?affiliate=minialife");
    }
    expect(rentalPartnerUrl("motorhome_republic")).toBe("https://www.motorhomerepublic.com/usa/?affiliate=minialife");
  });
});