import { describe, expect, it } from "vitest";
import { matchSearchIntent, matchesTerm } from "./searchIntent";

describe("search matching", () => {
  it("glamping weekend does not match the LA alias", () => {
    expect(matchesTerm("glamping weekend", "la")).toBe(false);
  });
  it("glamping weekend opens glamping destinations", () => {
    expect(matchSearchIntent("Glamping Weekend")).toEqual({ to: "/destinations", search: { tag: "glamping" } });
  });
  it("RV Adventure opens RV camping guides", () => {
    expect(matchSearchIntent("RV Adventure")?.to).toBe("/rv-camping");
  });
  it("place names still match", () => {
    expect(matchesTerm("yellowstone", "Yellowstone National Park")).toBe(true);
    expect(matchSearchIntent("Yellowstone")).toBeNull();
  });
});
