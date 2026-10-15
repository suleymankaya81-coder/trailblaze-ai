import library from "@/data/servicePhotos.json";
import type { Photo } from "./destinationCardPhotos";

export type ServicePhotoCategory = "flight" | "car" | "bike" | "rv" | "campervan" | "tour" | "attraction" | "tent" | "rvpark" | "cabin" | "hotel" | "glamping" | "tinyhouse" | "kayak" | "bottle" | "headlamp" | "jacket" | "firstaid" | "layers" | "power";
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

// Choose by the offered service, never by its position in a filtered grid.
export function serviceCategory(text: string, category: "stay" | "rental" | "gear"): ServicePhotoCategory | undefined {
  const t = text.toLowerCase();
  if (category === "rental") {
    if (/bike|bicycle|cycling/.test(t)) return "bike";
    if (/kayak|canoe/.test(t)) return "kayak";
    if (/car rental|rentcars|sedan|suv|economybookings|qeeq/.test(t)) return "car";
    if (/campervan|sprinter|\bvan\b/.test(t)) return "campervan";
    if (/motorhome|class [abc]|\brv\b|rvshare/.test(t)) return "rv";
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