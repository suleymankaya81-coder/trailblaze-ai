import { describe, it, expect } from "vitest";
import { mapsUrl, mapsUrlParts, buildGpx, findMarker, toPoint, dayPoints, MAPS_MAX_WAYPOINTS } from "./dayRoute";
import { decodeLayout, encodeLayout, campLinks } from "./tripBuilder";
import storedPoints from "@/data/daily-route-points.json";

const mk = (name: string, lat: number, lng: number) => ({ name, lat, lng, sourceUrl: "https://x.org" });

describe("Google Maps day links", () => {
  it("covers all 500 destinations and 1512 days without dropping any daily endpoint", () => {
    const entries = Object.values(storedPoints);
    expect(entries).toHaveLength(500);
    expect(entries.reduce((sum, days) => sum + days.length, 0)).toBe(1512);
    for (const days of entries) for (const points of days) {
      const urls = mapsUrlParts(points).map(u => new URL(u));
      expect(urls.length).toBeGreaterThan(0);
      expect(urls.every(u => (u.searchParams.get("waypoints")?.split("|").length ?? 0) <= 3)).toBe(true);
    }
  });
  it("keeps stop order: origin, waypoints, destination", () => {
    const url = mapsUrl([{ name: "A", lat: 1, lng: 2, query: "A" }, { name: "B", query: "B, Zion, Utah" }, { name: "C", lat: 3, lng: 4, query: "C" }]);
    expect(url).not.toBeNull();
    const u = new URL(url ?? "https://invalid.test");
    expect(u.searchParams.get("origin")).toBe("1.00000,2.00000");
    expect(u.searchParams.get("waypoints")).toBe("B, Zion, Utah");
    expect(u.searchParams.get("destination")).toBe("3.00000,4.00000");
  });
  it("splits routes longer than the waypoint limit", () => {
    const pts = Array.from({ length: MAPS_MAX_WAYPOINTS + 5 }, (_, i) => ({ name: `S${i}`, lat: i, lng: i, query: `S${i}` }));
    expect(mapsUrlParts(pts).length).toBe(2);
  });
  it("preserves all nine stops in two mobile-safe parts sharing stop five", () => {
    const pts = Array.from({ length: 9 }, (_, i) => ({ name: `S${i + 1}`, query: `S${i + 1}` }));
    const urls = mapsUrlParts(pts).map(u => new URL(u));
    expect(urls).toHaveLength(2);
    expect(urls[0].searchParams.get("origin")).toBe("S1");
    expect(urls[0].searchParams.get("waypoints")).toBe("S2|S3|S4");
    expect(urls[0].searchParams.get("destination")).toBe("S5");
    expect(urls[1].searchParams.get("origin")).toBe("S5");
    expect(urls[1].searchParams.get("waypoints")).toBe("S6|S7|S8");
    expect(urls[1].searchParams.get("destination")).toBe("S9");
    expect(mapsUrl(pts)).toBeNull();
  });
  it("opens day two independently instead of continuing the previous nine stops", () => {
    const urls = mapsUrlParts([{ name: "Day 2 start", query: "Day 2 start" }, { name: "Day 2 end", query: "Day 2 end" }]);
    const url = new URL(urls[0]);
    expect(url.searchParams.get("origin")).toBe("Day 2 start");
    expect(url.searchParams.get("destination")).toBe("Day 2 end");
  });
});

describe("GPX", () => {
  it("is only built when every stop has real coordinates", () => {
    expect(buildGpx("t", [{ name: "A", lat: 1, lng: 2, query: "A" }, { name: "B", query: "B" }])).toBeNull();
    const g = buildGpx("Day & night", [{ name: "A", lat: 1, lng: 2, query: "A" }, { name: "B", lat: 3, lng: 4, query: "B" }])!;
    expect(g).toContain('<wpt lat="1" lon="2">');
    expect(g).toContain("Day &amp; night");
  });
});

describe("stop matching", () => {
  it("keeps German display labels independent of Acadia day-two routing identities", () => {
    const day = { title: "Gipfel", start: "Morgen", driving: "Drive", note: "Note", stops: [{ name: "Cadillac-Berg", routingName: "Cadillac Mountain Summit", detail: "View" }, { name: "Jordan-Teich", routingName: "Jordan Pond", detail: "Walk" }] };
    const points = dayPoints(day, [], "Acadia", "Maine", "acadia");
    expect(points[0].name).toBe("Cadillac-Berg");
    expect(points[0].query).toContain("Cadillac Mountain Summit");
    expect(points[1].query).toContain("Jordan Pond");
  });
  it("matches only this plan's markers and adds place + state to text fallbacks", () => {
    expect(findMarker("Old Faithful", [mk("Old Faithful Geyser", 44.46, -110.83)])?.lat).toBe(44.46);
    expect(toPoint("Springdale", [], "Zion", "Utah")).toEqual({ name: "Springdale", query: "Springdale, Zion, Utah" });
  });
});

describe("trip builder links", () => {
  it("rejects tampered layouts and drops unknown stops", () => {
    expect(decodeLayout("<script>", 5)).toBeNull();
    expect(decodeLayout("0.1", 5)).toBeNull();
    expect(decodeLayout("0.9.1-2-3.3", 5)).toEqual([[0, 1], [2], [3]]);
    expect(encodeLayout([[0, 1], [2], [3]])).toBe("0.1-2-3");
  });
  it("campsite links carry publisher 3115962", () => {
    const l = campLinks({ name: "A", query: "A, Zion, Utah" }, "zion");
    expect(new URL(l.campspot).searchParams.get("awinaffid")).toBe("3115962");
    expect(new URL(l.campspot).searchParams.get("awinmid")).toBe("22326");
    expect(new URL(l.roverpass).searchParams.get("awinmid")).toBe("32065");
  });
});
