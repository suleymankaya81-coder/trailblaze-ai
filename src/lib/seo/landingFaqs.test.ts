import { describe, expect, it } from "vitest";
import { landingFaqs } from "./landingFaqs";

const full = { bestSeason: "June to September", tripDays: "3–4 days", airport: "BZN", driveMinutes: 90, permitLevel: "high", dailyBudget: 180 };
const empty = { bestSeason: null, tripDays: null, airport: null, driveMinutes: null, permitLevel: null, dailyBudget: null };

describe("search page FAQs", () => {
  it("best-time pages answer month questions", () => {
    const f = landingFaqs("best_time", "Yellowstone", full);
    expect(f[0].q).toBe("What month is best to visit Yellowstone?");
    expect(f).toHaveLength(3);
  });
  it("itinerary pages answer airport and cost with typical wording", () => {
    const f = landingFaqs("trip_planner", "Yellowstone", full);
    expect(f.map((x) => x.q)).toContain("Which airport should you fly into for Yellowstone?");
    expect(f.find((x) => x.q.includes("cost"))?.a).toContain("typical estimate");
  });
  it("things-to-do pages list section headings", () => {
    const f = landingFaqs("things_to_do", "Moab", full, [{ heading: "1. Delicate Arch" }, { heading: "Canyonlands" }]);
    expect(f[0].a).toBe("Highlights include Delicate Arch, Canyonlands.");
  });
  it("skips questions with missing data", () => {
    expect(landingFaqs("best_time", "X", empty)).toEqual([]);
    expect(landingFaqs("trip_planner", "X", empty)).toEqual([]);
  });
});
