import { describe, expect, it } from "vitest";
import { gearProducts, gearShopLink } from "./rockbrosGear";
describe("ROCKBROS catalog selection", () => {
  it("keeps seven selected variants and recorded USD prices", () => {
    expect(gearProducts.map(({id, price, currency}) => ({id,price,currency}))).toEqual([
      {id:"47157010038836",price:57.99,currency:"USD"}, {id:"47669011677236",price:77.99,currency:"USD"}, {id:"50509698007092",price:43.99,currency:"USD"}, {id:"48239748448308",price:47.99,currency:"USD"}, {id:"47196910485556",price:64.99,currency:"USD"}, {id:"47839557681204",price:28.99,currency:"USD"}, {id:"48073350381620",price:16.99,currency:"USD"}
    ]);
  });
  it("attributes every product to publisher 3115962 and advertiser 58007", () => {
    for(const product of gearProducts) {
      const url = new URL(gearShopLink(product));
      expect(url.searchParams.get("awinaffid")).toBe("3115962");
      expect(url.searchParams.get("awinmid")).toBe("58007");
      expect(url.searchParams.get("ued")).toBe(product.productUrl);
      expect(new URL(product.productUrl).searchParams.get("variant")).toBe(product.id);
    }
  });
  it("uses a distinct stored photograph per product", () => {
    expect(new Set(gearProducts.map(product => product.image)).size).toBe(7);
  });
});
