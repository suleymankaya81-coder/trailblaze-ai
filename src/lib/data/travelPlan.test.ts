import { describe, expect, it } from "vitest";
import { parseTravelPlan } from "./travelPlan";
import sample from "../../../scripts/content-pipeline/travel-content/yellowstone.json";

describe("stored local travel plan", () => {
  it("requires 3–4 daily plans", () => {
    expect(parseTravelPlan(sample.plan)?.days.length).toBe(3);
    expect(parseTravelPlan({ ...sample.plan, days: sample.plan.days.slice(0, 2) })).toBeNull();
  });
  it("requires at least two sights each day", () => {
    expect(parseTravelPlan({ ...sample.plan, days: sample.plan.days.map(day => ({ ...day, stops: day.stops.slice(0, 1) })) })).toBeNull();
  });
  it("requires five local notes", () => {
    expect(parseTravelPlan({ ...sample.plan, intel: sample.plan.intel.slice(0, 4) })).toBeNull();
  });
  it("rejects impossible marker coordinates", () => {
    expect(parseTravelPlan({ ...sample.plan, markers: [{ name: "Old Faithful", lng: -181, lat: 44.46, sourceUrl: "https://www.nps.gov/yell/" }] })).toBeNull();
  });
});