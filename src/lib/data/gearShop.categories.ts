import counts from "@/data/gear-categories/counts.json";

export type ShopCategoryKey = "camping" | "hiking" | "cycling" | "lights" | "apparel" | "eyewear" | "bags";
export type ShopProduct = { id: string; name: string; image: string; price: number; listPrice: number | null; url: string };
export type ShopCategoryFile = { key: string; reviewed: string; items: ShopProduct[] };

export const SHOP_CATEGORY_REVIEWED = counts.reviewed;
export const shopCategoryCounts = counts.counts as Record<ShopCategoryKey, number>;

export const shopCategoryMeta: Record<ShopCategoryKey, { label: string; intro: string; guides: { label: string; to: string }[] }> = {
  camping: { label: "Camping & Outdoor", intro: "Camp chairs, lanterns, cookware and campsite extras from ROCKBROS for nights near the trailhead.", guides: [] },
  hiking: { label: "Hiking & Backpacks", intro: "Daypacks, hydration packs and trail carry options for park hikes and scenic overlooks.", guides: [] },
  cycling: { label: "Cycling Gear", intro: "Helmets, pumps, locks, mounts and bike accessories for rides on park roads and rail trails.", guides: [{ label: "Best Cycling Accessories", to: "/gear/best-cycling-accessories" }, { label: "Bike Repair Kit Essentials", to: "/gear/bike-repair-kit-essentials" }] },
  lights: { label: "Lights & Power", intro: "Bike lights, headlamps and lanterns for early starts, dusk rides and camp evenings.", guides: [{ label: "Best Cycling Accessories", to: "/gear/best-cycling-accessories" }] },
  apparel: { label: "Apparel & Cold Weather", intro: "Jerseys, base layers, balaclavas and warm layers for chilly mornings at altitude.", guides: [] },
  eyewear: { label: "Eyewear & Gloves", intro: "Sunglasses, goggles and gloves for bright desert light, wind and long days outside.", guides: [{ label: "Best Cycling Accessories", to: "/gear/best-cycling-accessories" }] },
  bags: { label: "Travel & Moto Bags", intro: "Frame, saddle, handlebar, moto and travel bags to keep road-trip gear organized.", guides: [{ label: "7 Bikepacking Essentials", to: "/gear/7-bikepacking-essentials" }] },
};

export const isShopCategory = (k: string): k is ShopCategoryKey => k in shopCategoryMeta;
