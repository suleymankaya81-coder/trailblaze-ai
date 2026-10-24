import { describe, expect, it } from "vitest";
import { hasViatorRating, validViatorHeight } from "./viatorDisplay";

describe("provider-only Viator ratings", () => {
  it("requires the provider rating and a positive review count", () => {
    expect(hasViatorRating(null, 12)).toBe(false);
    expect(hasViatorRating(undefined, 12)).toBe(false);
    expect(hasViatorRating(4.7, 0)).toBe(false);
    expect(hasViatorRating(4.7, 125)).toBe(true);
  });
  it("rejects invalid provider values", () => {
    for (const rating of [NaN, Infinity, -1, 0, 6]) expect(hasViatorRating(rating, 12)).toBe(false);
    expect(hasViatorRating(4.7, -1)).toBe(false);
    expect(hasViatorRating(4.7, 1.5)).toBe(false);
  });
});
describe("Viator frame heights", () => {
  it("accepts empty and measured finite heights only", () => {
    expect(validViatorHeight(0)).toBe(0);
    expect(validViatorHeight(642.2)).toBe(643);
    for (const value of [-1, Infinity, NaN, "500", null, 100001]) expect(validViatorHeight(value)).toBeNull();
  });
});