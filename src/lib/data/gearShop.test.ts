import { describe, expect, it } from "vitest";
import { shopPicks } from "./gearShop";
import { gearShopLink } from "./rockbrosGear";

describe("gear shop picks", () => {
  it("shows six picks", () => expect(shopPicks).toHaveLength(6));
  it("links every pick through Awin with MiniaLife and ROCKBROS ids", () => {
    for (const { product } of shopPicks) {
      const url = gearShopLink(product);
      expect(url).toContain("awin1.com");
      expect(url).toContain("3115962");
      expect(url).toContain("58007");
    }
  });
});
