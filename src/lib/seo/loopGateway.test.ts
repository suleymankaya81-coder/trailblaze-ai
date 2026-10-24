import { describe, expect, it } from "vitest";
import { loopGatewayAirport, type LoopStop } from "./guides";
const stop = (a: Partial<LoopStop>): LoopStop => ({ slug: "x", name: "X", lat: 0, lng: 0, heroImage: "", tripDurationDays: null, permitLevel: null, permitHeadline: null, ...a });
describe("loop gateway airport", () => {
  it("uses the first stop with airport data", () => {
    expect(loopGatewayAirport([stop({}), stop({ airportCode: "LAS", airportName: "Harry Reid" })])).toEqual({ code: "LAS", name: "Harry Reid" });
  });
  it("hides booking when no stop has an airport", () => {
    expect(loopGatewayAirport([stop({})])).toBeNull();
  });
});
