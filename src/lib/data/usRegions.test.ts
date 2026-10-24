import { expect, it } from "vitest";
import { US_REGIONS } from "./usRegions";
it("every state belongs to exactly one region", () => {
  const all = Object.values(US_REGIONS).flatMap((r) => r.states as readonly string[]);
  expect(new Set(all).size).toBe(all.length);
  expect(all.length).toBe(51);
});
