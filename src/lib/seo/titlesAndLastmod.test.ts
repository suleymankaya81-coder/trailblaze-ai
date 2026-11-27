import { describe, expect, it } from "vitest";
import { placeTitle, TITLE_MAX } from "./routeSeo";
import { BULK_LASTMOD_THRESHOLD, realLastmods, urlsetXml } from "./sitemap.server";

describe("place main-page titles (all languages)", () => {
  it("are the hub for the place: no road-trip or itinerary wording, within 60 characters", () => {
    for (const name of ["Zion National Park", "Kristianstads Vattenrike", "Parco naturale regionale di Piana Crixia", "Gjáin"]) {
      for (const locale of ["en", "de", "fr"] as const) {
        const t = placeTitle(name, locale);
        expect(t.length, t).toBeLessThanOrEqual(TITLE_MAX);
        expect(t).not.toMatch(/road ?trip|itinerar|itinéraire|reiseplan|roadtrip/i);
        expect(t).toContain(name.length > 45 ? name.slice(0, 20) : name);
      }
    }
    expect(placeTitle("Zion National Park", "de")).toBe("Zion National Park: Reiseführer — WildParkRoutes");
    expect(placeTitle("Gjáin", "fr")).toBe("Gjáin : guide de voyage, carte et accès — WildParkRoutes");
  });
});

describe("sitemap lastmod only from real content dates", () => {
  const url = (i: number, lastmod?: string) => ({ loc: `https://wildparkroutes.com/p${i}`, lastmod });
  it("drops a bulk timestamp shared by more than the threshold, keeps individual dates", () => {
    const bulk = Array.from({ length: BULK_LASTMOD_THRESHOLD + 1 }, (_, i) => url(i, "2026-11-12T11:44:14.610Z"));
    const real = [url(100, "2026-10-03T09:00:00.000Z"), url(101, "2026-10-04T10:00:00.000Z"), url(102)];
    const out = realLastmods([...bulk, ...real]);
    expect(out.slice(0, bulk.length).every((u) => u.lastmod === undefined)).toBe(true);
    expect(out.slice(bulk.length).map((u) => u.lastmod)).toEqual(["2026-10-03T09:00:00.000Z", "2026-10-04T10:00:00.000Z", undefined]);
    const xml = urlsetXml([...bulk, ...real]);
    expect(xml).not.toContain("2026-11-12");
    expect(xml).toContain("<lastmod>2026-10-03T09:00:00.000Z</lastmod>");
  });
  it("keeps up to the threshold on one day (a real editing day)", () => {
    const day = Array.from({ length: BULK_LASTMOD_THRESHOLD }, (_, i) => url(i, `2026-10-05T0${i % 10}:00:00.000Z`));
    expect(realLastmods(day).every((u) => u.lastmod)).toBe(true);
  });
});
