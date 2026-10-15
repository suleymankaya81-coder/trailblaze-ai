import { describe, expect, it } from "vitest";
import { nearGoCity, tpLink, ROAD_PREPARATION_PARTNERS } from "./travelpayouts";

describe("travelpayouts links", () => {
  it("routes car rental to the approved EconomyBookings link", () => {
    expect(tpLink(ROAD_PREPARATION_PARTNERS.car_rental, "moab")).toBe("https://economybookings.tpm.lv/Ldg7kknv?sub_id=moab");
  });
  it("replaces offline maps with Radical Storage", () => {
    expect(ROAD_PREPARATION_PARTNERS.offline_maps).toBe("radicalstorage");
  });
  it("uses EKTA for insurance", () => {
    expect(ROAD_PREPARATION_PARTNERS.insurance).toBe("ekta");
  });
  it("uses Airalo for eSIM", () => {
    expect(ROAD_PREPARATION_PARTNERS.esim).toBe("airalo");
  });
  it("uses the dashboard link and tags the destination", () => {
    expect(tpLink("klook", "grand-canyon")).toBe("https://klook.tpm.lv/nayF33og?sub_id=grand-canyon");
  });
  it("keeps the plain link without a destination", () => {
    expect(tpLink("airalo")).toBe("https://airalo.tpm.lv/Cl55ghx0");
  });
  it("shows Go City only near covered cities", () => {
    expect(nearGoCity("red-rock-canyon-las-vegas")).toBe(true);
    expect(nearGoCity("yellowstone")).toBe(false);
  });
});
