import type { LucideIcon } from "lucide-react";
import { buildAwinLink } from "@/lib/affiliates/awin";
import { Bike, Binoculars, Glasses, Lamp, Mountain, Shirt, Tent, Briefcase } from "lucide-react";
import wg9801 from "@/assets/gear/wildguarder-wg9801.jpg.asset.json";
import hawknite1 from "@/assets/gear/wildguarder-hawknite1.jpg.asset.json";
import owler1 from "@/assets/gear/wildguarder-owler1.jpg.asset.json";

// Product counts computed from data/affiliate-feeds/rockbros/products.json (2,010 models)
// on 2026-10-20; Optics & Night Vision lists the three WILDGUARDER models below.
export const GEAR_COUNTS_REVIEW_DATE = "2026-10-20";

export type GearCategory = {
  key: string;
  label: string;
  items: number;
  icon: LucideIcon;
  /** Tailwind classes for the round icon badge. */
  tone: string;
  /** Where "Explore" leads; undefined renders "Coming soon". */
  href?: string;
  external?: boolean;
};

export const gearCategories: GearCategory[] = [
  { key: "camping", label: "Camping & Outdoor", items: 50, icon: Tent, tone: "bg-clay text-primary-foreground" },
  { key: "hiking", label: "Hiking & Backpacks", items: 27, icon: Mountain, tone: "bg-forest text-primary-foreground" },
  { key: "optics", label: "Optics & Night Vision", items: 3, icon: Binoculars, tone: "bg-sky text-primary-foreground", href: "#night-vision" },
  { key: "cycling", label: "Cycling Gear", items: 559, icon: Bike, tone: "bg-clay text-primary-foreground", href: "/gear/best-cycling-accessories" },
  { key: "lights", label: "Lights & Power", items: 208, icon: Lamp, tone: "bg-amber text-ink", href: "/gear/best-cycling-accessories" },
  { key: "apparel", label: "Apparel & Cold Weather", items: 449, icon: Shirt, tone: "bg-forest text-primary-foreground" },
  { key: "eyewear", label: "Eyewear & Gloves", items: 276, icon: Glasses, tone: "bg-sage-deep text-primary-foreground", href: "/gear/best-cycling-accessories" },
  { key: "bags", label: "Travel & Moto Bags", items: 213, icon: Briefcase, tone: "bg-clay text-primary-foreground", href: "/gear/7-bikepacking-essentials" },
];

// WILDGUARDER partner models (15% commission offer via Awin, invitation email).
// Names, prices and availability verified on store.wildguarder.com, checked 2026-10-20.
// Links go to the official store until the Awin tracking feed is available.
export const WILDGUARDER_REVIEW_DATE = "2026-10-20";

export type WildguarderProduct = {
  id: string;
  name: string;
  spec: string;
  price: number;
  image: string;
  url: string;
};

export const wildguarderProducts: WildguarderProduct[] = [
  {
    id: "wg9801",
    name: "WG9801 4K Night Vision Binoculars",
    spec: "3″ HD display · 48MP photo · 8X digital zoom",
    price: 189.99,
    image: wg9801.url,
    url: "https://store.wildguarder.com/product/4k-night-vision-binoculars/",
  },
  {
    id: "hawknite1",
    name: "Hawknite 1 4K Night Vision Binoculars",
    spec: "52MP photo · 1,200m range · full color at night",
    price: 299.99,
    image: hawknite1.url,
    url: "https://store.wildguarder.com/product/hawknite-1-true-4k-52mp-night-vision-binocular/",
  },
  {
    id: "owler1",
    name: "OWLER1 Night Vision Binoculars",
    spec: "20X optical zoom · 500m IR range",
    price: 294.99,
    image: owler1.url,
    url: "https://store.wildguarder.com/product/wildguarder-owler1-night-vision-binoculars/",
  },
];

export const wildguarderStoreUrl = "https://store.wildguarder.com/night-vision-binoculars/";

// WILDGUARDER Awin advertiser ID (approval email, 2026-10-20).
export const WILDGUARDER_AWIN_MID = 126831;

export function wildguarderLink(url: string, clickref: string): string {
  return buildAwinLink({ id: clickref, partner: "wildguarder", networkMid: WILDGUARDER_AWIN_MID, externalUrl: url }, clickref);
}

export function wildguarderPrice(p: WildguarderProduct): string {
  return `$${p.price.toFixed(2)}`;
}
