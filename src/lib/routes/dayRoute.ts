import type { TravelPlan, TravelMarker } from "@/lib/data/travelPlan";
import storedPoints from "@/data/daily-route-points.json";

/** A routable point: real coordinates when verified, otherwise a disambiguated text query. */
export type RoutePoint = { name: string; lat?: number; lng?: number; query: string };

export const MAPS_MAX_WAYPOINTS = 3; // Maps URLs support only three intermediate waypoints in mobile browsers.

export function normalizeName(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/\(.*?\)/g, "")
    .replace(/\b(the|trail|trailhead|overlook|viewpoint|area|point)\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

/** Match a stop name to a verified marker; exact normalized match first, then containment. */
export function findMarker(name: string, markers: TravelMarker[]): TravelMarker | undefined {
  const n = normalizeName(name);
  if (!n) return undefined;
  return markers.find(m => normalizeName(m.name) === n)
    ?? markers.find(m => { const mn = normalizeName(m.name); return mn.length > 3 && (n.includes(mn) || mn.includes(n)); });
}

export function toPoint(name: string, markers: TravelMarker[], place: string, region?: string): RoutePoint {
  const m = findMarker(name, markers);
  const query = [name, place, region].filter(Boolean).join(", ");
  return m ? { name, lat: m.lat, lng: m.lng, query } : { name, query };
}

export function dayPoints(day: TravelPlan["days"][number], markers: TravelMarker[], place: string, region?: string, slug?: string): RoutePoint[] {
  const cache = storedPoints as Record<string, RoutePoint[][]>;
  const canonical = slug ? cache[slug]?.find(points => points.length === day.stops.length && points.every((p, i) => normalizeName(p.name) === normalizeName(day.stops[i].routingName ?? day.stops[i].name))) : undefined;
  if (canonical) return canonical.map((p, i) => ({ ...p, name: day.stops[i].name }));
  return day.stops.map(s => ({ ...toPoint(s.routingName ?? s.name, markers, place, region), name: s.name }));
}

const enc = (p: RoutePoint) => p.lat != null && p.lng != null ? `${p.lat.toFixed(5)},${p.lng.toFixed(5)}` : p.query;

/** Free Google Maps directions URL (no API key). Returns null for fewer than 2 points. */
export function mapsUrl(points: RoutePoint[]): string | null {
  if (points.length < 2) return null;
  if (points.length > MAPS_MAX_WAYPOINTS + 2) return null; // Use mapsUrlParts: never silently discard stops.
  const pts = points;
  const params = new URLSearchParams({ api: "1", origin: enc(pts[0]), destination: enc(pts[pts.length - 1]), travelmode: "driving" });
  const mid = pts.slice(1, -1);
  if (mid.length) params.set("waypoints", mid.map(enc).join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Split long routes into consecutive legs that each fit one Maps link (shared end/start point). */
export function mapsUrlParts(points: RoutePoint[]): string[] {
  const size = MAPS_MAX_WAYPOINTS + 2;
  if (points.length <= size) { const u = mapsUrl(points); return u ? [u] : []; }
  const out: string[] = [];
  for (let i = 0; i < points.length - 1; i += size - 1) { const u = mapsUrl(points.slice(i, i + size)); if (u) out.push(u); }
  return out;
}

export function hasAllCoords(points: RoutePoint[]): boolean {
  return points.length >= 2 && points.every(p => p.lat != null && p.lng != null);
}

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** GPX 1.1 with waypoints + a route through them. Only real coordinates; returns null otherwise. */
export function buildGpx(title: string, points: RoutePoint[]): string | null {
  if (!hasAllCoords(points)) return null;
  const wpts = points.map(p => `  <wpt lat="${p.lat}" lon="${p.lng}"><name>${xml(p.name)}</name></wpt>`).join("\n");
  const rtepts = points.map(p => `    <rtept lat="${p.lat}" lon="${p.lng}"><name>${xml(p.name)}</name></rtept>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="MiniaLife" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>${xml(title)}</name></metadata>\n${wpts}\n  <rte><name>${xml(title)}</name>\n${rtepts}\n  </rte>\n</gpx>\n`;
}

export function slugify(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

/** Browser-only: trigger a GPX file download. Call from event handlers. */
export function downloadGpx(filename: string, gpx: string) {
  const url = URL.createObjectURL(new Blob([gpx], { type: "application/gpx+xml" }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Straight-line distance in miles (labelled "approx." in UI; no paid routing). */
export function haversineMiles(a: RoutePoint, b: RoutePoint): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const R = 3958.8, r = (d: number) => d * Math.PI / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
