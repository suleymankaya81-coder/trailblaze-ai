import { expect, it } from "vitest";
import { viatorPlaceSearchUrl } from "./viatorSearch";
import { COUNTRIES } from "@/lib/routes/paths";
import { isViatorAreaAlias, isViatorPlaceCacheFresh, viatorPlaceQuery } from "./viatorPlaceIdentity";

for (const [code, country] of Object.entries(COUNTRIES)) {
  it(`uses the full country name and approved tracking for ${code}`, () => {
    const url = new URL(viatorPlaceSearchUrl("Test Place", code));
    expect(url.searchParams.get("text")).toBe(`Test Place ${code === "us" ? "USA" : country.name}`);
    expect(url.searchParams.get("pid")).toBe("P00327298");
    expect(url.searchParams.get("mcid")).toBe("42383");
  });
}
it("uses the same geographic search identity in API and fallback links", () => {
  expect(viatorPlaceQuery("Alto Garda Bresciano Regional Park", "it")).toBe("Lake Garda Italy");
  expect(new URL(viatorPlaceSearchUrl("Alto Garda Bresciano Regional Park", "it")).searchParams.get("text")).toBe("Lake Garda Italy");
  expect(isViatorAreaAlias("Alto Garda Bresciano Regional Park")).toBe(true);
  expect(isViatorAreaAlias("Lake Garda")).toBe(false);
});
it("invalidates pre-fix caches while bounding fresh empty searches to 24 hours", () => {
  const now = Date.parse("2026-11-22T10:04:00Z");
  expect(isViatorPlaceCacheFresh("2026-11-21T13:14:59Z", now)).toBe(false);
  expect(isViatorPlaceCacheFresh("2026-11-21T13:16:00Z", now)).toBe(true);
  expect(isViatorPlaceCacheFresh("2026-11-21T10:04:00Z", now)).toBe(false);
  expect(isViatorPlaceCacheFresh("2026-11-23T10:04:00Z", now)).toBe(false);
});

it("preserves approved direct partner tracking and UK destination context", () => {
  const url = new URL(viatorPlaceSearchUrl("Seven Sisters", "gb"));
  expect(url.searchParams.get("text")).toBe("Seven Sisters United Kingdom");
  expect(url.searchParams.get("pid")).toBe("P00327298");
  expect(url.searchParams.get("mcid")).toBe("42383");
  expect(url.searchParams.get("medium")).toBe("link");
});