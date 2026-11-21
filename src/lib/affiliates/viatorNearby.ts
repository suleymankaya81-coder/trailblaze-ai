import hubs from "./data/viatorDestinations.json";

/** [Viator destinationId, name, lat, lng, our country code] from Viator's official taxonomy snapshot. */
type Hub = [number, string, number, number, string];
export type ViatorHub = { id: number; name: string; km: number };

/** Viator tag "Outdoor Activities" (tag filters are AND-combined, so one broad tag only). */
export const VIATOR_OUTDOOR_TAG = 21909;
const NATURE = /\b(national park|nature|natural park|hik(e|es|ing)|trek|walk(s|ing)? (in|through) (the )?(forest|mountains|park)|kayak|canoe|raft|paddle|sup\b|boat|cruise|lake|river|gorge|canyon|cave|glacier|waterfall|fjord|mountain|alps|forest|wildlife|bird|safari|bike|cycling|e-?bike|horse|snowshoe|ski|via ferrata|climb|beach|coast|island|valley|volcano|dolomit|national)/i;
const NOT_NATURE = /\b(shooting|gun|escape (game|room)|photographer|photo ?shoot|pub crawl|nightlife|cooking class|museum ticket|concentration camp|segway|murder|mystery|city tour|walking tour of the old town)\b/i;
/** Hub fallback keeps only listings whose own title describes an outdoor/nature activity. */
export function isOutdoorListing(title: string): boolean {
  return NATURE.test(title) && !NOT_NATURE.test(title);
}
export const VIATOR_HUB_MAX_KM = 60;

function km(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

/** Closest Viator city/town/park in the same country, only when it is a realistic day-trip base. */
export function nearestViatorHub(lat: number, lng: number, countryCode: string, maxKm = VIATOR_HUB_MAX_KM, list: Hub[] = hubs as unknown as Hub[]): ViatorHub | null {
  const cc = countryCode.toLowerCase();
  let best: ViatorHub | null = null;
  for (const [id, name, hLat, hLng, hCc] of list) {
    if (hCc !== cc) continue;
    const d = km(lat, lng, hLat, hLng);
    if (d <= maxKm && (!best || d < best.km)) best = { id, name, km: Math.round(d) };
  }
  return best;
}
