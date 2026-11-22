import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { destinationShortAnswer } from "./destinationAnswer";

const zion = { slug: "zion", tagline: "Red sandstone cathedrals, a river you walk through, and canyon walls that glow at sunset.", bestSeason: "March – May, September – November", tripDurationDays: "3–4 days", airportCode: "SGU", airportName: "St. George Regional Airport", driveMinutes: 71 };

describe("destination short answer", () => {
  it("answers what / when / how long / how to arrive in at most 3 sentences", () => {
    const lines = destinationShortAnswer(zion);
    expect(lines).toEqual([
      "Red sandstone cathedrals, a river you walk through, and canyon walls that glow at sunset.",
      "The best time to visit is March – May, September – November, and this guide suggests 3–4 days.",
      "The closest arrival airport is St. George Regional Airport (SGU), about 1 h 11 min away by car.",
    ]);
  });
  it("leaves out sentences whose data is missing, never inventing values", () => {
    expect(destinationShortAnswer({ ...zion, bestSeason: null, tripDurationDays: null, airportCode: null })).toEqual([zion.tagline]);
    expect(destinationShortAnswer({ ...zion, tagline: "", bestSeason: null, tripDurationDays: null, airportCode: null })).toEqual([]);
    expect(destinationShortAnswer({ ...zion, driveMinutes: null })[2]).toBe("The closest arrival airport is St. George Regional Airport (SGU).");
  });
  it("does not describe a drive for boat, flight or expedition places", () => {
    expect(destinationShortAnswer({ ...zion, accessType: "fly-in" })).toHaveLength(2);
    expect(destinationShortAnswer({ ...zion, accessType: "ferry" }).join(" ")).not.toContain("by car");
  });
  it("uses German and French sentence templates on translated pages", () => {
    expect(destinationShortAnswer(zion, "de")[2]).toMatch(/^Der nächste Ankunftsflughafen ist .*mit dem Auto entfernt\.$/);
    expect(destinationShortAnswer(zion, "fr")[1]).toMatch(/^La meilleure période pour y aller est .* ; ce guide prévoit /);
  });
});

// Layout order: the answer is the first content of <main>, before booking, promos and tours.
const src = (p: string) => readFileSync(p, "utf8");
describe("answer-first page order", () => {
  it("guide pages: <main> → answer → compact booking strip → trip snapshot → sections", () => {
    const s = src("src/routes/destinations.$slug.$region.$place.$guide.tsx");
    const order = ["<main>", 'id="answer"', "<BookingStepsStrip", "<TripSnapshot", "<SectionBlock"].map((x) => s.indexOf(x));
    expect(order.every((i) => i > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(s).toMatch(/<BookingStepsStrip[^>]*compact/);
  });
  it("destination pages: short answer is the first child of <main>, before TopShowcase", () => {
    const s = src("src/components/destination/DestinationPageView.tsx");
    const main = s.indexOf("<main");
    expect(s.indexOf("<ShortAnswer", main)).toBeGreaterThan(main);
    expect(s.indexOf("<ShortAnswer", main)).toBeLessThan(s.indexOf("<TopShowcase", main));
  });
  it("home page has a <main> landmark around its content", () => {
    const s = src("src/routes/index.tsx");
    expect(s.indexOf("<main>")).toBeLessThan(s.indexOf("<HomeHero"));
    expect(s.indexOf("</main>")).toBeLessThan(s.indexOf("<Footer"));
  });
});
