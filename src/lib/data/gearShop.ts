import { gearProducts, type GearProduct } from "./rockbrosGear";

export type GearActivity = "bikepacking" | "cycling" | "repair" | "roadtrip";

export const activityLabel: Record<GearActivity, string> = {
  bikepacking: "Bikepacking",
  cycling: "Cycling Essentials",
  repair: "Repair & Safety",
  roadtrip: "Road Trip Cycling",
};

// Tailwind classes per activity so the page is not green-only.
export const activityTone: Record<GearActivity, string> = {
  bikepacking: "bg-forest text-primary-foreground",
  cycling: "bg-sky text-primary-foreground",
  repair: "bg-clay text-primary-foreground",
  roadtrip: "bg-amber text-ink",
};

const pickIds: Array<[string, GearActivity]> = [
  ["50509698007092", "bikepacking"],
  ["48239748448308", "cycling"],
  ["47196910485556", "repair"],
  ["47157010038836", "bikepacking"],
  ["48073350381620", "cycling"],
  ["47669011677236", "roadtrip"],
];

export const shopPicks: Array<{ product: GearProduct; activity: GearActivity }> = pickIds.map(
  ([id, activity]) => {
    const product = gearProducts.find((p) => p.id === id);
    if (!product) throw new Error(`Missing gear product ${id}`);
    return { product, activity };
  },
);
