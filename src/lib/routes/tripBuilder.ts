import type { TravelPlan } from "@/lib/data/travelPlan";
import { toPoint, type RoutePoint } from "./dayRoute";
import { buildAwinLink } from "@/lib/affiliates/awin";

/** Every stop a visitor may use: the plan's own stops first, then verified markers not already listed. */
export function stopPool(plan: TravelPlan, place: string, region?: string): RoutePoint[] {
  const seen = new Set<string>(); const out: RoutePoint[] = [];
  for (const d of plan.days) for (const s of d.stops) if (!seen.has(s.name)) { seen.add(s.name); out.push(toPoint(s.name, plan.markers, place, region)); }
  for (const m of plan.markers) if (!seen.has(m.name)) { seen.add(m.name); out.push({ name: m.name, lat: m.lat, lng: m.lng, query: [m.name, place, region].filter(Boolean).join(", ") }); }
  return out;
}

export type Layout = number[][]; // days → indices into the pool

export function defaultLayout(plan: TravelPlan, pool: RoutePoint[]): Layout {
  return plan.days.map(d => d.stops.map(s => pool.findIndex(p => p.name === s.name)).filter(i => i >= 0));
}

export const MIN_DAYS = 3, MAX_DAYS = 4;

/** Shareable compact form: "0.1-2.3-4" */
export function encodeLayout(l: Layout): string { return l.map(d => d.join(".")).join("-"); }

/** Validates untrusted input; drops unknown/duplicate stops; returns null when unusable. */
export function decodeLayout(raw: string | undefined | null, poolSize: number): Layout | null {
  if (!raw || raw.length > 200 || !/^[0-9.\-]*$/.test(raw)) return null;
  const used = new Set<number>();
  const days = raw.split("-").slice(0, MAX_DAYS).map(d => d.split(".").filter(Boolean).map(Number)
    .filter(n => Number.isInteger(n) && n >= 0 && n < poolSize && !used.has(n) && (used.add(n), true)));
  if (days.length < MIN_DAYS || days.every(d => d.length === 0)) return null;
  return days;
}

const CAMPSPOT_MID = 22326, ROVERPASS_MID = 32065;

/** Campsite search links for a night's stop, always through the shared Awin builder. */
export function campLinks(stop: RoutePoint, slug: string) {
  const q = stop.query;
  return {
    campspot: buildAwinLink({ id: `builder-campspot-${slug}`, partner: "campspot", networkMid: CAMPSPOT_MID, externalUrl: `https://www.campspot.com/search?location=${encodeURIComponent(q)}` }, `builder-${slug}`),
    roverpass: buildAwinLink({ id: `builder-roverpass-${slug}`, partner: "roverpass", networkMid: ROVERPASS_MID, externalUrl: "https://www.roverpass.com" }, `builder-${slug}`),
  };
}
