import { describe, expect, it } from "vitest";
import { GEAR_ARTICLE_SEO, GEAR_CATEGORY_SEO } from "./gearSeo";
import { HUB_SEO } from "./hubSeo";
import { CORRIDOR_KEYWORDS, DESCRIPTION_MAX, LOOP_KEYWORDS, TITLE_MAX } from "./routeSeo";
import { shopCategoryMeta } from "../data/gearShop.categories";
import { gearGuides } from "../data/gearGuides";

const ALL = [...Object.values(GEAR_CATEGORY_SEO), ...Object.values(GEAR_ARTICLE_SEO)];

describe("gear SEO metadata", () => {
  it("keeps every title within the Google title limit", () => {
    for (const seo of ALL) {
      expect(seo.title.length).toBeLessThanOrEqual(TITLE_MAX);
    }
  });

  it("keeps every description within the Google description limit", () => {
    for (const seo of ALL) {
      expect(seo.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    }
  });

  it("gives every gear page a unique title and description", () => {
    const titles = ALL.map((s) => s.title);
    const descriptions = ALL.map((s) => s.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("does not reuse hub, loop or corridor keyword phrases", () => {
    const taken = [
      ...Object.values(HUB_SEO).map((s) => s.keyword),
      ...Object.values(LOOP_KEYWORDS),
      ...Object.values(CORRIDOR_KEYWORDS),
    ].map((k) => k.toLowerCase());
    for (const seo of ALL) {
      expect(taken).not.toContain(seo.keyword.toLowerCase());
    }
  });

  it("targets a real search phrase in each title", () => {
    for (const seo of ALL) {
      expect(seo.title.toLowerCase()).toContain(seo.keyword.toLowerCase().split(" ")[0]);
    }
  });

  it("covers every gear shop category", () => {
    expect(Object.keys(GEAR_CATEGORY_SEO).sort()).toEqual(Object.keys(shopCategoryMeta).sort());
  });

  it("covers every gear guide article", () => {
    expect(Object.keys(GEAR_ARTICLE_SEO).sort()).toEqual(Object.keys(gearGuides).sort());
  });
});
