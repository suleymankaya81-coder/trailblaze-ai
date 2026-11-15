import { expect, it } from "vitest";
import { viatorPlaceSearchUrl } from "./viatorSearch";

it("preserves approved direct partner tracking and UK destination context", () => {
  const url = new URL(viatorPlaceSearchUrl("Seven Sisters", "gb"));
  expect(url.searchParams.get("text")).toBe("Seven Sisters United Kingdom");
  expect(url.searchParams.get("pid")).toBe("P00327298");
  expect(url.searchParams.get("mcid")).toBe("42383");
  expect(url.searchParams.get("medium")).toBe("link");
});