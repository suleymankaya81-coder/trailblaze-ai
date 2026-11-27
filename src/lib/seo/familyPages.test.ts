import { describe, expect, it } from "vitest";
import { corridorAnswer, flyDriveAnswer, loopAnswer, noReservationAnswer, rvAnswer } from "./familyAnswers";
import { flyDriveTitle } from "./flyDrive";
import { noReservationTitle, rvCampingTitle } from "./guidesSeo";
import { destinationSearchTitle, loopSearchTitle, TITLE_MAX } from "./routeSeo";
import { buildCorridorJsonLd, corridorPageTitle } from "./corridorSeo";
import { CORRIDORS } from "./corridors";
import { LOOPS } from "./guides";
import { STORED_UNKNOWN_FACT } from "./season";

const zion = { slug: "zion", name: "Zion National Park", airportCode: "SGU", airportName: "St. George Regional Airport", driveMinutes: 71, driveMiles: 46, permitLevel: "high", campingScore: 8, tripDurationDays: "3–4 days" };
const geuldal = { slug: "geuldal", name: "Geuldal", airportCode: "MST", airportName: "Maastricht Aachen Airport", driveMinutes: 25, driveMiles: null, permitLevel: "moderate", campingScore: null, tripDurationDays: "3 days" };
const boiler = "Check the official visitor information for Geuldal. Entry, activity permissions and overnight accommodation are separate checks; the source excerpts below do not establish availability for your dates.";

describe("family answers (stored facts only)", () => {
  it("fly & drive answers the closest-airport question", () => {
    expect(flyDriveAnswer(zion)).toEqual(["The closest airport to Zion National Park is St. George Regional Airport (SGU), about 1 h 11 min away by car (46 mi / 74 km)."]);
    expect(flyDriveAnswer(zion, "de")[0]).toMatch(/^Der nächste Flughafen bei Zion National Park ist St. George Regional Airport \(SGU\)/);
  });
  it("no-reservation uses the stored level and note, never boilerplate", () => {
    expect(noReservationAnswer(zion, "Angels Landing requires a permit from a lottery. Book early.")).toEqual(["Booking demand at Zion National Park is high.", "Angels Landing requires a permit from a lottery."]);
    expect(noReservationAnswer(geuldal, boiler)).toEqual(["Booking demand at Geuldal is moderate."]);
  });
  it("rv, loop and corridor answers", () => {
    expect(rvAnswer(zion).join(" ")).toContain("pick up near St. George Regional Airport (SGU); the drive to Zion National Park is about 1 h 11 min");
    expect(rvAnswer(geuldal)).not.toContain("camping score");
    expect(loopAnswer([{ name: "A" }, { name: "B" }, { name: "C" }], 6, "Las Vegas (LAS)")[0]).toBe("This loop links 3 stops, from A to C, over about 6 days; the nearest arrival airport is Las Vegas (LAS).");
    const c = CORRIDORS[0];
    expect(corridorAnswer(c, c.stops.map((s) => ({ name: s })))[0]).toContain(`(${c.gateway.code}) and takes ${c.idealDays}`);
  });
  it("no answer ever carries unknown-fact wording", () => {
    for (const out of [noReservationAnswer(geuldal, boiler), rvAnswer(geuldal), flyDriveAnswer(geuldal)]) expect(STORED_UNKNOWN_FACT.test(out.join(" "))).toBe(false);
  });
});

describe("family titles: intent keyword + stored fact, ≤ 60, distinct from the place page", () => {
  it("each family has its own title, all within 60 characters", () => {
    const titles = [flyDriveTitle(zion), rvCampingTitle(zion), noReservationTitle(zion), destinationSearchTitle(zion.name)];
    expect(new Set(titles).size).toBe(titles.length);
    for (const t of titles) expect(t.length, t).toBeLessThanOrEqual(TITLE_MAX);
    expect(flyDriveTitle(zion)).toContain("SGU");
    expect(rvCampingTitle(zion)).toMatch(/Zion National Park RV Camping/);
    expect(noReservationTitle(zion)).toMatch(/Zion National Park Reservations/);
  });
  it("loop titles carry stops and days when they fit, and all route titles stay unique", () => {
    const t = loopSearchTitle(LOOPS[0].slug, LOOPS[0].title, 5, 9);
    expect(t.length).toBeLessThanOrEqual(TITLE_MAX);
    const all = [...LOOPS.map((l) => loopSearchTitle(l.slug, l.title, l.stops.length, l.stops.length * 2)), ...CORRIDORS.map(corridorPageTitle)];
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("FAQPage only for visible answers", () => {
  it("corridor markup mirrors the visible corridor.faqs exactly", () => {
    const c = CORRIDORS.find((x) => x.faqs.length)!;
    const ld = buildCorridorJsonLd(c, c.stops.map((s) => ({ slug: s, name: s })), "https://wildparkroutes.com/corridors/x");
    const faq = (ld["@graph"] as Record<string, unknown>[]).find((n) => n["@type"] === "FAQPage") as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(c.faqs.map((f) => [f.q, f.a]));
  });
});
