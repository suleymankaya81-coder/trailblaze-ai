import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (orig) => ({
  ...(await orig<typeof import("@tanstack/react-router")>()),
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => unknown }) => select({ location: { pathname: "/" } }),
  Link: ({ to, children, className }: { to: string; children: unknown; className?: string }) => createElement("a", { href: to, className }, children as never),
}));

import { nearbyPlaces } from "./nearby";
import { NearbyPlaces } from "@/components/destination/NearbyPlaces";
import { PlanDeeper } from "@/components/guides/PlanDeeper";
import type { DestinationView } from "./destinations.functions";

describe("nearby places from stored coordinates", () => {
  it("gives every sampled place up to 6 neighbours, nearest first", () => {
    for (const slug of ["zion", "geuldal", "berowra-valley-national-park-nsw", "waitomo-caves", "the-dolomites"]) {
      const n = nearbyPlaces(slug);
      expect(n.length, slug).toBeGreaterThan(0);
      expect(n.length).toBeLessThanOrEqual(6);
      expect(n.map((x) => x.km)).toEqual([...n.map((x) => x.km)].sort((a, b) => a - b));
    }
    expect(nearbyPlaces("zion")[0]).toEqual({ slug: "kanab", km: 44 });
  });
  it("renders linked cards with distance, and nothing when empty", () => {
    const html = renderToStaticMarkup(createElement(NearbyPlaces, { name: "Zion National Park", places: [{ slug: "kanab", name: "Kanab", region: "Utah", heroImage: "/x.jpg", distanceKm: 44 }] }));
    expect(html).toContain('href="/destinations/us/utah/kanab"');
    expect(html).toContain("44 km away");
    expect(renderToStaticMarkup(createElement(NearbyPlaces, { name: "X", places: [] }))).toBe("");
  });
});

describe("guide link block (PlanDeeper)", () => {
  const dest = { slug: "zion", name: "Zion National Park", airportCode: "SGU", airportName: "St. George Regional Airport", driveMinutes: 71, permitLevel: "high", permitNote: "Angels Landing requires a permit.", campingScore: 8, accessType: "road" } as unknown as DestinationView;
  it("links the place, its region hub and the other guides at their real URLs", () => {
    const html = renderToStaticMarkup(createElement(PlanDeeper, { dest, landingLinks: [{ path: "/zion-best-time-to-visit", pageType: "best_time" }, { path: "/zion-itinerary", pageType: "trip_planner" }], current: "landing", currentPath: "/zion-glamping" }));
    expect(html).toContain('href="/destinations/us/utah/zion"');
    expect(html).toContain('href="/destinations/us/utah"');
    expect(html).toContain('href="/destinations/us/utah/zion/best-time"');
    expect(html).toContain('href="/destinations/us/utah/zion/itinerary"');
    expect(html).not.toContain("zion-best-time-to-visit");
  });
});
