import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { destinationShortAnswer, isSeasonText } from "./destinationAnswer";

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
  it("does not describe a drive for boat, flight or expedition places, but says how they are reached", () => {
    expect(destinationShortAnswer({ ...zion, accessType: "fly-in" })[2]).toBe("It is reached by flight or as an expedition, not by road.");
    expect(destinationShortAnswer({ ...zion, accessType: "ferry" })[2]).toBe("It is reached by scheduled boat, not by road.");
    expect(destinationShortAnswer({ ...zion, accessType: "ferry" }).join(" ")).not.toContain("by car");
  });
  it("uses German and French sentence templates on translated pages", () => {
    expect(destinationShortAnswer(zion, "de")[2]).toMatch(/^Der nächste Ankunftsflughafen ist .*mit dem Auto entfernt\.$/);
    expect(destinationShortAnswer(zion, "fr")[1]).toMatch(/^La meilleure période pour y aller est .* ; ce guide prévoit /);
  });
});

// Real stored values (live pages, sample.json translations, combined-content caches).
const berowra = {
  slug: "berowra-valley-national-park-nsw", name: "Berowra Valley National Park", region: "New South Wales",
  tagline: "The Berowra Valley National Park is a protected national park in northern Sydney, New South Wales, Australia.",
  bestSeason: "No verified visitor-season recommendation is available for Berowra Valley National Park; consult the park authority for your travel dates.",
  tripDurationDays: "3 days", airportCode: "SYD", airportName: "Sydney Kingsford Smith International Airport", driveMinutes: 46,
};
const kristianstad = {
  slug: "kristianstads-vattenrike", name: "Kristianstads Vattenrike", region: "Skåne",
  tagline: "Kristianstad Water kingdom is a biosphere area in Kristianstad municipality in Skåne.",
  bestSeason: "No verified visitor-season recommendation is available for Kristianstads Vattenrike; consult the park authority for your travel dates.",
  tripDurationDays: "1 day", airportCode: "KID", airportName: "Kristianstad Airport", driveMinutes: 20,
};
const NO_SEASON = [
  berowra.bestSeason,
  "Check official seasonal information",
  "Check official seasonal access before choosing dates",
  "Contact local operators for seasonal availability",
  "Evidence does not specify a best season; verify weather conditions before travel.",
  "Keine verifizierte Empfehlung für die Besuchersaison ist für Kristianstads Vattenrike verfügbar; konsultieren Sie die Parkbehörde für Ihre Reisedaten.",
  "Überprüfen Sie die offiziellen Saisoninformationen",
  "Aucune recommandation vérifiée sur la saison idéale n'est disponible pour Åre ; consultez les autorités locales selon vos dates de voyage.",
  "Consulter les informations saisonnières officielles",
  "No verified visitor-season recommendation is available for Kristianstads Vattenrike; consult the park authority for your travel dates.",
];

describe("stored 'no verified season' text never becomes a season", () => {
  it("recognises real seasons and month ranges only", () => {
    for (const s of ["Late June – September", "March – May, September – November", "summer", "Spring and Summer", "Year-round", "Spring through Fall", "June – early October", "Juni – September", "Printemps et automne", "Été et automne", "März – Oktober", "Août"]) expect(isSeasonText(s)).toBe(true);
    for (const s of NO_SEASON) expect(isSeasonText(s)).toBe(false);
  });
  it("Australia: Berowra Valley keeps the tagline, suggested days and airport, without the placeholder", () => {
    expect(destinationShortAnswer(berowra)).toEqual([
      berowra.tagline,
      "This guide suggests 3 days.",
      "The closest arrival airport is Sydney Kingsford Smith International Airport (SYD), about 46 min away by car.",
    ]);
  });
  it("Europe: Kristianstads Vattenrike (English, German and French pages)", () => {
    const en = destinationShortAnswer(kristianstad).join(" ");
    expect(en).not.toMatch(/best time to visit is/i);
    expect(en).toContain("This guide suggests 1 day.");
    const de = destinationShortAnswer({ ...kristianstad, tagline: "Kristianstad Water Kingdom ist ein Biosphärengebiet in der Gemeinde Kristianstad in Skåne.", bestSeason: NO_SEASON[5] }, "de").join(" ");
    expect(de).not.toMatch(/beste Reisezeit ist/);
    expect(de).not.toContain("Keine verifizierte");
    expect(de).toMatch(/^Kristianstad Water Kingdom ist ein Biosphärengebiet.*Dieser Reiseplan sieht .* vor\./);
    const fr = destinationShortAnswer({ ...kristianstad, tagline: null, bestSeason: NO_SEASON[7] }, "fr").join(" ");
    expect(fr).not.toMatch(/meilleure période/);
    expect(fr).not.toContain("Aucune recommandation");
    expect(fr.startsWith("Kristianstads Vattenrike se situe dans la région suivante : Skåne.")).toBe(true);
  });
  it("no stored placeholder sentence ever appears in any language", () => {
    for (const bestSeason of NO_SEASON) for (const locale of ["en", "de", "fr"] as const) {
      const out = destinationShortAnswer({ ...berowra, bestSeason }, locale).join(" ");
      expect(out).not.toContain(bestSeason);
      expect(out).not.toMatch(/(best time to visit is|beste Reisezeit ist|meilleure période pour y aller est)/);
    }
  });
  it("without a tagline, a location sentence from name and region leads", () => {
    expect(destinationShortAnswer({ ...berowra, tagline: null })[0]).toBe("Berowra Valley National Park is in New South Wales.");
    expect(destinationShortAnswer({ ...berowra, tagline: null }, "de")[0]).toBe("Berowra Valley National Park liegt in New South Wales.");
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
