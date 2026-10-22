import { describe, expect, it } from "vitest";
import { shopCategoryCounts, shopCategoryMeta } from "./gearShop.categories";

const files = import.meta.glob("../../data/gear-categories/[a-z]*.json", { eager: true }) as Record<string, { default: { key?: string; items?: { image: string; price: number; url: string }[] } }>;

describe("ROCKBROS shop categories", () => {
  for (const key of Object.keys(shopCategoryMeta)) {
    const file = Object.entries(files).find(([p]) => p.endsWith(`/${key}.json`))?.[1].default;
    it(`${key}: items have photo, price and tracked link; count matches`, () => {
      expect(file?.items?.length).toBe(shopCategoryCounts[key as keyof typeof shopCategoryCounts]);
      for (const p of file!.items!) {
        expect(p.image.startsWith("https://")).toBe(true);
        expect(p.price).toBeGreaterThan(0);
        const u = new URL(p.url);
        expect(u.searchParams.get("awinmid")).toBe("58007");
        expect(u.searchParams.get("awinaffid")).toBe("3115962");
      }
    });
  }
});
