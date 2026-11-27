import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (orig) => ({
  ...(await orig<typeof import("@tanstack/react-router")>()),
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => unknown }) => select({ location: { pathname: "/" } }),
  Link: ({ to, params, children, className }: { to: string; params?: Record<string, string>; children: unknown; className?: string }) =>
    createElement("a", { href: to.replace(/\$(\w+)/g, (_m: string, k: string) => params?.[k] ?? k), className }, children as never),
}));
vi.mock("@/components/site/Header", () => ({ Header: () => null }));
vi.mock("@/components/site/Footer", () => ({ Footer: () => null }));

import { computeHubStats, familyLead, hubFacts, hubLead, routesLead, type HubPlaceRow } from "./hubSummary";
import { GuideHub } from "@/components/guides/GuideHub";
import { GeoDirectory } from "@/components/destination/GeoDirectory";
import { LOOPS } from "./guides";
import { CORRIDORS } from "./corridors";
import { STORED_UNKNOWN_FACT } from "./season";

const rows: HubPlaceRow[] = [
  { slug: "zion", name: "Zion National Park", destinationType: "national_park", tripDurationDays: "3–4 days", airportCode: "SGU", airportName: "St. George Regional Airport", driveMinutes: 71, scenicScore: 10 },
  { slug: "bryce", name: "Bryce Canyon", destinationType: "national_park", tripDurationDays: "3–4 days", airportCode: "SGU", airportName: "St. George Regional Airport", driveMinutes: 150, scenicScore: 9 },
  { slug: "moab", name: "Moab", destinationType: "town", tripDurationDays: "2 days", airportCode: "CNY", airportName: "Canyonlands Regional Airport", driveMinutes: 48, scenicScore: 9 },
  { slug: "isle", name: "Some Island", destinationType: "island", tripDurationDays: null, airportCode: null, driveMinutes: null, accessType: "ferry", scenicScore: null },
];

describe("hub summaries from stored facts", () => {
  const s = computeHubStats(rows);
  it("computes counts, typical stay, airports, median drive, access and notable places", () => {
    expect(s).toMatchObject({ places: 4, typicalStay: "3–4 days", medianDriveMinutes: 71, ferry: 1, flyIn: 0 });
    expect(s.airports.map((a) => a.code)).toEqual(["SGU", "CNY"]);
    expect(s.notable).toEqual(["Zion National Park", "Bryce Canyon", "Moab"]);
  });
  it("answers first in en/de/fr, with stored regions.intro leading when present", () => {
    expect(hubLead("Utah", s)[0]).toBe("Utah has 4 destinations with a trip plan on WildParkRoutes, including Zion National Park, Bryce Canyon and Moab.");
    expect(hubLead("Utah", s, "de")[0]).toMatch(/^Utah hat 4 Reiseziele/);
    expect(hubLead("Utah", s, "fr")[0]).toMatch(/^Utah compte 4 destinations/);
    expect(hubLead("Utah", s, "en", "Red-rock country in the American Southwest.")[0]).toBe("Red-rock country in the American Southwest.");
  });
  it("omits facts that are unknown and never apologises", () => {
    const thin = computeHubStats([{ slug: "a", name: "A" }]);
    expect(hubLead("X", thin)).toEqual(["X has 1 destination with a trip plan on WildParkRoutes."]);
    expect(hubFacts(thin)).toEqual([{ label: "Destinations", value: "1" }]);
    for (const out of [hubLead("X", thin), hubFacts(s), hubLead("X", s, "de")]) expect(STORED_UNKNOWN_FACT.test(JSON.stringify(out))).toBe(false);
  });
  it("list-page leads", () => {
    expect(familyLead("rv-camping", [{ countryCode: "us", airportCode: "SGU", driveMinutes: 71 }, { countryCode: "ca", airportCode: "YYC", driveMinutes: 90 }])[0]).toBe("There are 2 RV and camping guides in 2 countries.");
    expect(routesLead("loops", LOOPS)[0]).toMatch(new RegExp(`^There are ${LOOPS.length} self-drive loops linking \\d+ stops`));
    expect(routesLead("corridors", CORRIDORS.filter((c) => !c.pilot), "de")[0]).toMatch(/^Es gibt \d+ Roadtrips/);
  });
});

describe("hub and list page structure", () => {
  it("GuideHub: answer first, H2s, and every guide linked in the server HTML (not just the first 24)", () => {
    const entries = Array.from({ length: 40 }, (_, i) => ({ slug: `place-${i}`, name: `Place ${String(i).padStart(2, "0")}`, state: "Utah", heroImage: "", airportCode: "SLC", driveMinutes: 60 + i, countryCode: "us" }));
    const html = renderToStaticMarkup(createElement(GuideHub, { family: "rv-camping", kicker: "RV & Camping", title: "RV & camping guides", intro: "i", entries }));
    expect(html).toContain('id="answer"');
    expect((html.match(/<h2/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
    for (const e of entries) expect(html).toContain(`href="/rv-camping/${e.slug}"`);
    expect(html.indexOf('id="answer"')).toBeLessThan(html.indexOf("<h2"));
  });
  it("GeoDirectory: lead, 'At a glance' facts and child links inside <main>", () => {
    const html = renderToStaticMarkup(createElement(GeoDirectory, { kicker: "k", title: "Utah destinations", intro: "i", crumbs: [], heading: "Destinations", action: "See", items: [{ to: "/destinations/us/utah/zion", title: "Zion", image: "" }], lead: hubLead("Utah", computeHubStats(rows)), facts: hubFacts(computeHubStats(rows)) }));
    const main = html.slice(html.indexOf("<main"));
    expect(main.indexOf('id="answer"')).toBeLessThan(main.indexOf("At a glance"));
    expect(main).toContain('href="/destinations/us/utah/zion"');
    expect(html).toContain("St. George Regional Airport (SGU)");
  });
});
