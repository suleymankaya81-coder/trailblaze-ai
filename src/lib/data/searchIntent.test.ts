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
  it("matches Yellowstone camping without requiring a short alias", () => {
    expect(matchesTerm("Yellowstone camping", "Yellowstone National Park")).toBe(true);
    expect(matchesTerm("Yellowstone camping", "Yellowstone Montana Gateway")).toBe(true);
    expect(matchesTerm("Yellowstone camping", "Grand Teton National Park")).toBe(false);
  });
  it("keeps Gateway Arch intact when matching its place name", () => {
    expect(matchesTerm("Gateway Arch", "Gateway Arch National Park")).toBe(true);
    expect(matchesTerm("Gateway Arch", "Arches National Park")).toBe(false);
  });
  it("does not turn a general trip query into a place match", () => {
    expect(matchesTerm("RV Adventure", "Yellowstone National Park")).toBe(false);
    expect(matchesTerm("glamping weekend", "la")).toBe(false);
  });
});
