import { describe, expect, it } from "vitest";
import loops from "@/data/loops.json";
import { CORRIDORS } from "./corridors";
import { corridorPageTitle, corridorSearchDescription, corridorSearchTitle } from "./corridorSeo";
import { CORRIDOR_KEYWORDS, LOOP_KEYWORDS, loopSearchDescription, loopSearchTitle } from "./routeSeo";

const name = (slug: string) => slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

describe("road trip search metadata", () => {
  it("has a search phrase for every loop and corridor", () => {
    for (const l of loops) expect(LOOP_KEYWORDS[l.slug], l.slug).toBeTruthy();
    for (const c of CORRIDORS) expect(CORRIDOR_KEYWORDS[c.slug], c.slug).toBeTruthy();
  });

  it("keeps loop titles ≤60 and descriptions ≤160 and leads with the phrase", () => {
    for (const l of loops) {
      const stops = l.stops.map(name);
      const t = loopSearchTitle(l.slug, l.title, stops.length);
      expect(t.length, t).toBeLessThanOrEqual(60);
      expect(t.startsWith(LOOP_KEYWORDS[l.slug])).toBe(true);
      expect(loopSearchDescription(l.slug, l.title, stops).length).toBeLessThanOrEqual(160);
    }
  });

  it("keeps corridor titles ≤60 and descriptions ≤160", () => {
    for (const c of CORRIDORS) {
      const t = corridorPageTitle(c);
      expect(t.length, t).toBeLessThanOrEqual(60);
      expect(t.startsWith(corridorSearchTitle(c))).toBe(true);
      expect(corridorSearchDescription(c, c.stops.map(name)).length).toBeLessThanOrEqual(160);
    }
  });

  it("uses the exact Grand Circle phrase", () => {
    const c = CORRIDORS.find((x) => x.slug === "grand-circle-from-las-vegas")!;
    expect(corridorPageTitle(c)).toBe("Grand Circle Road Trip from Las Vegas — MiniaLife");
  });

  it("gives every page a distinct title", () => {
    const all = [...loops.map((l) => loopSearchTitle(l.slug, l.title, l.stops.length)), ...CORRIDORS.map(corridorPageTitle)];
    expect(new Set(all).size).toBe(all.length);
  });
});
