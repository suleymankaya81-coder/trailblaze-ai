import { describe, it, expect } from "vitest";
import { mapsUrl, mapsUrlParts, buildGpx, findMarker, toPoint, MAPS_MAX_WAYPOINTS } from "./dayRoute";
import { decodeLayout, encodeLayout, campLinks } from "./tripBuilder";

const mk = (name: string, lat: number, lng: number) => ({ name, lat, lng, sourceUrl: "https://x.org" });

describe("Google Maps day links", () => {
  it("keeps stop order: origin, waypoints, destination", () => {
    const u = new URL(mapsUrl([{ name: "A", lat: 1, lng: 2, query: "A" }, { name: "B", query: "B, Zion, Utah" }, { name: "C", lat: 3, lng: 4, query: "C" }])!);
    expect(u.searchParams.get("origin")).toBe("1.00000,2.00000");
    expect(u.searchParams.get("waypoints")).toBe("B, Zion, Utah");
    expect(u.searchParams.get("destination")).toBe("3.00000,4.00000");
  });
  it("splits routes longer than the waypoint limit", () => {
    const pts = Array.from({ length: MAPS_MAX_WAYPOINTS + 5 }, (_, i) => ({ name: `S${i}`, lat: i, lng: i, query: `S${i}` }));
    expect(mapsUrlParts(pts).length).toBe(2);
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
