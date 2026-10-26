import library from "@/data/servicePhotos.json";
import type { Photo } from "./destinationCardPhotos";

export type ServicePhotoCategory = "flight" | "car" | "bike" | "rv" | "campervan" | "tour" | "attraction" | "tent" | "rvpark" | "cabin" | "hotel" | "glamping" | "tinyhouse" | "kayak" | "bottle" | "headlamp" | "jacket" | "firstaid" | "layers" | "power" | "parkentry";
const pools = library as Partial<Record<ServicePhotoCategory, Photo[]>>;

export function photoHash(value: string): number {
  let h = 0;
  for (const c of value) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function servicePhoto(category: ServicePhotoCategory, seed: string, offset = 0): Photo | undefined {
  const pool = pools[category];
  if (!pool?.length) return undefined;
  return pool[(photoHash(seed) + offset) % pool.length];
}

export function airportRentalPhoto(kind: "car" | "suv", seed: string): Photo | undefined {
  const matching = pools.car?.filter((photo) => kind === "suv"
    ? /suv/i.test(photo.subject)
    : /sedan/i.test(photo.subject));
  if (!matching?.length) return servicePhoto("car", seed, kind === "suv" ? 1 : 0);
  return matching[photoHash(seed) % matching.length];
}

// Choose by the offered service, never by its position in a filtered grid.
export function serviceCategory(text: string, category: "stay" | "rental" | "gear"): ServicePhotoCategory | undefined {
  const t = text.toLowerCase();
  if (category === "rental") {
    if (/bike|bicycle|cycling/.test(t)) return "bike";
    if (/kayak|canoe/.test(t)) return "kayak";
    if (/car rental|airport rentals|rentcars|sedan|suv|economybookings|qeeq/.test(t)) return "car";
    if (/campervan|sprinter|\bvan\b/.test(t)) return "campervan";
    if (/motorhome|class [abc]|\brv\b/.test(t)) return "rv";
    if (/tent/.test(t)) return "tent";
  }
  if (category === "stay") {
    if (/glamp|yurt|safari tent/.test(t)) return "glamping";
    if (/tiny/.test(t)) return "tinyhouse";
    if (/cabin|vacation rental|whole.home/.test(t)) return "cabin";
    if (/hotel|lodge|inn|resort/.test(t)) return "hotel";
    if (/rv|roverpass|harvest|farm|winery/.test(t)) return "rvpark";
    return "tent";
  }
  if (category === "gear") {
    if (/bottle|water|hydration/.test(t)) return "bottle";
    if (/lamp|light/.test(t)) return "headlamp";
    if (/first.?aid|medical/.test(t)) return "firstaid";
    if (/jacket|rain|shell/.test(t)) return "jacket";
    if (/wool|layer|thermal/.test(t)) return "layers";
    if (/jackery|power|solar/.test(t)) return "power";
    if (/tent/.test(t)) return "tent";
    if (/kayak/.test(t)) return "kayak";
    if (/bike|bicycle/.test(t)) return "bike";
  }
  return undefined;
}
// Typical entry-level prices shown only when a partner gives no price; always labelled as estimates.
const ESTIMATES: Array<[RegExp, string]> = [
  [/glamp|yurt/, "Est. from $90/night"],
  [/cabin|vacation|tiny|home/, "Est. from $120/night"],
  [/hotel|lodge|inn|resort/, "Est. from $110/night"],
  [/trailer|towable/, "Est. from $95/day"],
  [/small camper|sleeps 2|2-berth/, "Est. from $95/day"],
  [/motorhome|\brv\b|class [abc]|campervan|\bvan\b/, "Est. from $150/day"],
  [/\bsuv\b/, "Est. from $55/day"],
  [/car|sedan/, "Est. from $45/day"],
  [/bike|bicycle|kayak|canoe/, "Est. from $35/day"],
  [/camp|tent|site|harvest|roverpass/, "Est. from $35/night"],
];
export function estimatedFrom(text: string): string {
  const t = text.toLowerCase();
  return ESTIMATES.find(([re]) => re.test(t))?.[1] ?? "Check live price";
}
