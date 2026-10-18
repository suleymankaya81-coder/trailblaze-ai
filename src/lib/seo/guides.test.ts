import { describe, expect, it } from "vitest";
import { LOOPS, haversineMiles, isNoReservationEligible, isRvEligible, suggestedDays, validateLoop, type GuideDest, type LoopStop } from "./guides";

const base: GuideDest = { slug: "x-test", name: "X", airportCode: "AAA", airportName: "A Airport", driveMinutes: 60, permitLevel: "high", permitNote: "Timed entry May–Oct.", permitHeadline: null, campingScore: 8, bestSeason: null };
const stop = (slug: string, lng: number, lat: number): LoopStop => ({ slug, name: slug, lng, lat, heroImage: "", tripDurationDays: "2–3 days", permitLevel: "none", permitHeadline: null });

describe("guide eligibility", () => {
  it("no-reservation page needs high/moderate permit level and a note", () => {
    expect(isNoReservationEligible(base)).toBe(true);
    expect(isNoReservationEligible({ ...base, permitLevel: "none" })).toBe(false);
    expect(isNoReservationEligible({ ...base, permitNote: null })).toBe(false);
  });
  it("RV page needs camping score 7+ and airport drive data", () => {
    expect(isRvEligible(base)).toBe(true);
    expect(isRvEligible({ ...base, campingScore: 6 })).toBe(false);
    expect(isRvEligible({ ...base, driveMinutes: null })).toBe(false);
  });
});

describe("loops", () => {
  it("needs at least 3 stops", () => {
    expect(validateLoop([stop("a", -112, 37), stop("b", -112.1, 37.5)])).toBe(false);
  });
  it("rejects a leg over 250 straight-line miles", () => {
    expect(validateLoop([stop("a", -110.6, 44.6), stop("b", -110.7, 43.8), stop("c", -114, 48.5)])).toBe(false);
    expect(validateLoop([stop("a", -113, 37.2), stop("b", -112.2, 37.6), stop("c", -111.2, 38.2)])).toBe(true);
  });
  it("suggested days use the lower bound of the stored range", () => {
    expect(suggestedDays("3–5 days")).toBe(3);
    expect(suggestedDays(null)).toBe(2);
  });
  it("haversine is roughly right (Zion to Bryce ~ 50 mi)", () => {
    const d = haversineMiles([-112.987, 37.2002], [-112.1677, 37.6283]);
    expect(d).toBeGreaterThan(45);
    expect(d).toBeLessThan(60);
  });
  it("loop slugs are unique and each has 3–5 stops", () => {
    expect(new Set(LOOPS.map((l) => l.slug)).size).toBe(LOOPS.length);
    for (const l of LOOPS) expect(l.stops.length >= 3 && l.stops.length <= 5).toBe(true);
  });
});
