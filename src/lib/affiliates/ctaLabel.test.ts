import { describe, expect, it } from "vitest";
import { offerCtaLabel } from "./ctaLabel";

describe("offerCtaLabel", () => {
  it("never uses the passive 'Check availability' text", () => {
    for (const c of ["stay", "rv_rental", "car_rental", "activity", "esim", null]) {
      expect(offerCtaLabel(c, "Acadia")).not.toMatch(/check availability/i);
    }
  });
  it("names the place for RV and stays", () => {
    expect(offerCtaLabel("rv_rental", "Acadia")).toBe("Find campervans & RVs for Acadia");
    expect(offerCtaLabel("stay", "Acadia")).toBe("See stays near Acadia");
  });
  it("never promises a price or discount", () => {
    for (const c of ["stay", "rv_rental", "car_rental", "activity"]) {
      expect(offerCtaLabel(c, "Zion")).not.toMatch(/\$|%|discount/i);
    }
  });
});
