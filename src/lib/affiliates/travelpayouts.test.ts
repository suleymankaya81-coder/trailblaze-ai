import { describe, expect, it } from "vitest";
import { nearGoCity, tpLink } from "./travelpayouts";

describe("travelpayouts links", () => {
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
