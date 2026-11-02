import { describe, expect, it } from "vitest";
import { activeRockbrosPromo } from "./rockbrosPromo";

describe("ROCKBROS WELCOME10 code", () => {
  it("shows 10% off with WELCOME10 through 31 Dec 2026", () => {
    const promo = activeRockbrosPromo(new Date("2026-12-31T20:00:00Z"));
    expect(promo?.code).toBe("WELCOME10");
    expect(promo?.percentOff).toBe(10);
  });
  it("is hidden from 1 Jan 2027 onwards", () => {
    expect(activeRockbrosPromo(new Date("2027-01-02T00:00:00Z"))).toBeNull();
  });
});
