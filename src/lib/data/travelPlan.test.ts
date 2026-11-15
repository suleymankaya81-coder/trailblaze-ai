import { describe, expect, it } from "vitest";
import { parseTravelPlan } from "./travelPlan";
import sample from "../../../scripts/content-pipeline/travel-content/yellowstone.json";

describe("stored local travel plan", () => {
  it("accepts one-day and multi-day visits", () => {
    expect(parseTravelPlan(sample.plan)?.days.length).toBe(3);
    expect(parseTravelPlan({ ...sample.plan, days: sample.plan.days.slice(0, 1) })?.days.length).toBe(1);
    expect(parseTravelPlan({ ...sample.plan, days: [...sample.plan.days, ...sample.plan.days] })?.days.length).toBe(6);
    expect(parseTravelPlan({ ...sample.plan, days: [] })).toBeNull();
  });
  it("accepts one sourced sight but rejects empty days", () => {
    expect(parseTravelPlan({ ...sample.plan, days: sample.plan.days.map(day => ({ ...day, stops: day.stops.slice(0, 1) })) })?.days[0].stops.length).toBe(1);
    expect(parseTravelPlan({ ...sample.plan, days: sample.plan.days.map(day => ({ ...day, stops: [] })) })).toBeNull();
  });
  it("requires five local notes", () => {
    expect(parseTravelPlan({ ...sample.plan, intel: sample.plan.intel.slice(0, 4) })).toBeNull();
  });
  it("rejects impossible marker coordinates", () => {
    expect(parseTravelPlan({ ...sample.plan, markers: [{ name: "Old Faithful", lng: -181, lat: 44.46, sourceUrl: "https://www.nps.gov/yell/" }] })).toBeNull();
  });
});