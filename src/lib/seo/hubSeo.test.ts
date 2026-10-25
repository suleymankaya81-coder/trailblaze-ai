import { describe, expect, it } from "vitest";
import { HUB_SEO } from "./hubSeo";
import { CORRIDOR_KEYWORDS, DESCRIPTION_MAX, LOOP_KEYWORDS, TITLE_MAX } from "./routeSeo";

describe("hub SEO metadata", () => {
  it("keeps every title within the Google title limit", () => {
    for (const seo of Object.values(HUB_SEO)) {
      expect(seo.title.length).toBeLessThanOrEqual(TITLE_MAX);
    }
  });

  it("keeps every description within the Google description limit", () => {
    for (const seo of Object.values(HUB_SEO)) {
      expect(seo.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    }
  });

  it("gives every hub a unique title and description", () => {
    const titles = Object.values(HUB_SEO).map((s) => s.title);
    const descriptions = Object.values(HUB_SEO).map((s) => s.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("does not reuse loop or corridor keyword phrases", () => {
    const taken = [...Object.values(LOOP_KEYWORDS), ...Object.values(CORRIDOR_KEYWORDS)].map((k) => k.toLowerCase());
    for (const seo of Object.values(HUB_SEO)) {
      expect(taken).not.toContain(seo.keyword.toLowerCase());
    }
  });

  it("targets a real search phrase in each title", () => {
    for (const seo of Object.values(HUB_SEO)) {
      expect(seo.title.toLowerCase()).toContain(seo.keyword.toLowerCase().split(" ")[0]);
    }
  });
});
