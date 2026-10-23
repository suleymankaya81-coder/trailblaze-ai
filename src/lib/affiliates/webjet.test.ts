import { describe, expect, it } from "vitest";
import { airportRentalsLink, motorhomeRepublicLink, withWebjetAffiliate } from "./webjet";
describe("webjet links", () => {
  it("Motorhome Republic carries affiliate=minialife", () => expect(motorhomeRepublicLink()).toBe("https://www.motorhomerepublic.com/usa/?affiliate=minialife"));
  it("Airport Rentals carries affiliate=minialife", () => expect(airportRentalsLink()).toBe("https://www.airportrentals.com/?affiliate=minialife"));
  it("does not duplicate the code", () => expect(withWebjetAffiliate("https://www.motorhomerepublic.com/usa/?affiliate=minialife")).toBe("https://www.motorhomerepublic.com/usa/?affiliate=minialife"));
  it("leaves other hosts alone", () => expect(withWebjetAffiliate("https://www.rei.com/")).toBe("https://www.rei.com/"));
});
