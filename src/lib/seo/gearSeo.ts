// Search-phrase titles/descriptions for Gear Shop category pages and gear
// guide articles. Keywords chosen from Semrush US data (Oct 2026); each page
// targets a distinct phrase family so gear pages never overlap hub, loop,
// corridor or destination metadata.
import { BRAND, DESCRIPTION_MAX, TITLE_MAX, fitText } from "./routeSeo";

export interface GearSeo {
  /** Primary Google query family this page targets. */
  keyword: string;
  title: string;
  description: string;
}

function gear(keyword: string, titleCandidates: string[], descriptionCandidates: string[]): GearSeo {
  return {
    keyword,
    title: fitText(titleCandidates, TITLE_MAX),
    description: fitText(descriptionCandidates, DESCRIPTION_MAX),
  };
}

// Category pages under /gear/category/{key}.
export const GEAR_CATEGORY_SEO = {
  // "camping gear" 33.1k/mo; "camping essentials" 9.9k/mo.
  camping: gear(
    "camping essentials",
    [`Camping Essentials & Camp Gear${BRAND}`, `Camping Essentials${BRAND}`],
    [
      "Camping essentials for nights near the trailhead: camp chairs, lanterns, cookware and campsite extras, curated from partner catalogs with prices.",
      "Camping essentials: camp chairs, lanterns, cookware and campsite extras, curated from partner catalogs with prices.",
    ],
  ),
  // "hiking backpack" 27.1k/mo; "hiking gear" 9.9k/mo.
  hiking: gear(
    "hiking backpacks",
    [`Hiking Backpacks & Daypacks for the Trail${BRAND}`, `Hiking Backpacks${BRAND}`],
    [
      "Hiking backpacks and daypacks for park trails and scenic overlooks: hydration packs and trail carry options with catalog prices and fit notes.",
      "Hiking backpacks and daypacks: hydration packs and trail carry options for park hikes, with catalog prices.",
    ],
  ),
  // "bike accessories" 9.9k/mo; gear hub owns "cycling gear".
  cycling: gear(
    "bike accessories",
    [`Bike Accessories: Helmets, Pumps & Locks${BRAND}`, `Bike Accessories${BRAND}`],
    [
      "Bike accessories for rides on park roads and rail trails: helmets, pumps, locks, mounts and more, curated from partner catalogs with prices.",
      "Bike accessories: helmets, pumps, locks and mounts for park roads and rail trails, with catalog prices.",
    ],
  ),
  lights: gear(
    "bike lights",
    [`Bike Lights, Headlamps & Lanterns${BRAND}`, `Bike Lights & Headlamps${BRAND}`],
    [
      "Bike lights, headlamps and lanterns for early starts, dusk rides and camp evenings, curated from partner catalogs with prices and specs.",
      "Bike lights, headlamps and lanterns for early starts, dusk rides and camp evenings, with catalog prices.",
    ],
  ),
  apparel: gear(
    "cycling apparel",
    [`Cycling Apparel & Cold Weather Layers${BRAND}`, `Cycling Apparel${BRAND}`],
    [
      "Cycling apparel and cold weather layers for chilly mornings at altitude: jerseys, base layers and balaclavas with catalog prices.",
      "Cycling apparel and cold weather layers: jerseys, base layers and balaclavas, with catalog prices.",
    ],
  ),
  eyewear: gear(
    "cycling sunglasses",
    [`Cycling Sunglasses, Goggles & Gloves${BRAND}`, `Cycling Sunglasses${BRAND}`],
    [
      "Cycling sunglasses, goggles and gloves for bright desert light, wind and long days outside, curated from partner catalogs with prices.",
      "Cycling sunglasses, goggles and gloves for bright light, wind and long days outside, with catalog prices.",
    ],
  ),
  // "bikepacking" 9.9k/mo; the guide article owns "bikepacking gear".
  bags: gear(
    "bikepacking bags",
    [`Bikepacking Bags & Travel Storage${BRAND}`, `Bikepacking Bags${BRAND}`],
    [
      "Bikepacking bags and travel storage: frame, saddle, handlebar and moto bags to keep road-trip gear organized, with catalog prices.",
      "Bikepacking bags: frame, saddle, handlebar and travel bags to keep road-trip gear organized.",
    ],
  ),
} as const satisfies Record<string, GearSeo>;

export type GearCategorySeoKey = keyof typeof GEAR_CATEGORY_SEO;

// Gear guide articles. Keyed by GearGuideConfig slug.
export const GEAR_ARTICLE_SEO = {
  // "bikepacking gear" 1k/mo, low difficulty (26/100).
  bikepacking: gear(
    "bikepacking gear",
    [`Bikepacking Gear: 7 Essentials for Overnight Rides${BRAND}`, `7 Bikepacking Gear Essentials${BRAND}`],
    [
      "Bikepacking gear for overnight rides: seven picks covering bags, a front light, a bottle cage and a camping pump, with catalog prices and fit notes.",
      "Bikepacking gear: seven picks covering bags, a front light, a bottle cage and a camping pump, with catalog prices.",
    ],
  ),
  // "cycling accessories" 1.3k/mo.
  accessories: gear(
    "cycling accessories",
    [`Best Cycling Accessories for Safer Rides${BRAND}`, `Best Cycling Accessories${BRAND}`],
    [
      "Seven cycling accessories for safer, more comfortable rides: sunglasses, gloves, a tail light, mirror, bell, phone mount and lock, with prices.",
      "Seven cycling accessories: sunglasses, gloves, a tail light, mirror, bell, phone mount and lock, with prices.",
    ],
  ),
  repair: gear(
    "bike repair kit",
    [`Bike Repair Kit: 7 Essentials for Road & Home${BRAND}`, `Bike Repair Kit Essentials${BRAND}`],
    [
      "Bike repair kit essentials for the road and the home workshop: a multi-tool, patch kit, tire lever, mini pump and repair stand, with prices.",
      "Bike repair kit essentials: a multi-tool, patch kit, tire lever, mini pump and repair stand, with prices.",
    ],
  ),
} as const satisfies Record<string, GearSeo>;

export type GearArticleSeoKey = keyof typeof GEAR_ARTICLE_SEO;
