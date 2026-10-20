import { describe, expect, it } from "vitest";
import { gearCategories, wildguarderProducts } from "./gearCategories";

describe("gear categories", () => {
  it("lists eight categories with positive item counts", () => {
    expect(gearCategories).toHaveLength(8);
    for (const c of gearCategories) expect(c.items).toBeGreaterThan(0);
  });
  it("optics category count matches the listed WILDGUARDER models", () => {
    const optics = gearCategories.find((c) => c.key === "optics");
    expect(optics?.items).toBe(wildguarderProducts.length);
  });
  it("every WILDGUARDER product links to the official store with a price", () => {
    for (const p of wildguarderProducts) {
      expect(p.url).toContain("store.wildguarder.com");
      expect(p.price).toBeGreaterThan(0);
      expect(p.image).toContain("/__l5e/assets-v1/");
    }
  });
});
