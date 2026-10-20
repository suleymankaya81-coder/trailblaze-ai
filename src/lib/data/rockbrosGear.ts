import { buildAwinLink } from "@/lib/affiliates/awin";
import image0 from "@/assets/gear/rockbros-47157010038836.jpg.asset.json";
import image1 from "@/assets/gear/rockbros-47669011677236.jpg.asset.json";
import image2 from "@/assets/gear/rockbros-50509698007092.jpg.asset.json";
import image3 from "@/assets/gear/rockbros-48239748448308.jpg.asset.json";
import image4 from "@/assets/gear/rockbros-47196910485556.jpg.asset.json";
import image5 from "@/assets/gear/rockbros-47839557681204.jpg.asset.json";
import image6 from "@/assets/gear/rockbros-48073350381620.jpg.asset.json";

export const CATALOG_REVIEW_DATE = "2026-10-19";
export const ROCKBROS_ADVERTISER_ID = 58007;
export const gearProducts = [
  {
    ...{
      id: "47157010038836",
      catalogTitle: "Bicycle Saddle Bag 100% Waterproof 8L",
      price: 57.99,
      currency: "USD",
      productUrl:
        "https://rockbrosbike.us/products/rockbros-bicycle-saddle-bag-100-waterproof-8l?variant=47157010038836",
      name: "8L Saddle Bag",
      purpose: "Rack-free luggage",
      spec: "8L · Seat-mounted",
      description:
        "A roll-top bag for carrying soft layers behind the saddle. The listing describes multiple attachment straps and a waterproof closure.",
      caution:
        "Check saddle clearance and strap compatibility; keep valuables in a separate dry liner.",
    },
    image: image0.url,
  },
  {
    ...{
      id: "47669011677236",
      catalogTitle: "100% Waterproof Bike Rack Bag Lightweight 23L - Black",
      price: 77.99,
      currency: "USD",
      productUrl:
        "https://rockbrosbike.us/products/100-waterproof-bike-rack-bag-lightweight-23l?variant=47669011677236",
      name: "23L Rack Bag",
      purpose: "More carrying space",
      spec: "23L · Rack-mounted",
      description:
        "The largest luggage option in this selection. The listing describes a wide-opening compartment and adjustable mounting buckles.",
      caution:
        "Requires a compatible rear rack. Check rack dimensions and the bicycle’s load limit.",
    },
    image: image1.url,
  },
  {
    ...{
      id: "50509698007092",
      catalogTitle: "1.6L Waterproof Bike Handlebar Bag with Built-In Light Strip",
      price: 43.99,
      currency: "USD",
      productUrl:
        "https://rockbrosbike.us/products/1-6l-waterproof-bike-handlebar-bag-with-built-in-light-strip?variant=50509698007092",
      name: "1.6L Handlebar Bag",
      purpose: "Small items up front",
      spec: "1.6L · Light strip",
      description:
        "Compact storage with a detachable light strip and a shoulder strap for taking the bag off the bike.",
      caution:
        "Check brake-cable clearance. A light strip is not a substitute for a compliant front and rear light.",
    },
    image: image2.url,
  },
  {
    ...{
      id: "48239748448308",
      catalogTitle: "0.8L Slim Bike Top Tube Bag | Water-Resistant",
      price: 47.99,
      currency: "USD",
      productUrl:
        "https://rockbrosbike.us/products/0-8l-slim-bike-top-tube-bag-water-resistant?variant=48239748448308",
      name: "0.8L Top Tube Bag",
      purpose: "Quick-access storage",
      spec: "0.8L · Water-resistant",
      description:
        "A slim bag for small ride essentials. The listing describes an approximately 5.5cm profile and multiple fastening points.",
      caution: "Water-resistant is not the same as waterproof. Check frame fit and knee clearance.",
    },
    image: image3.url,
  },
  {
    ...{
      id: "47196910485556",
      catalogTitle: "1800LM Rechargeable Dual LED Bike Front Light",
      price: 64.99,
      currency: "USD",
      productUrl:
        "https://rockbrosbike.us/products/bike-light-front-1800lm-2-leds-rechargeable?variant=47196910485556",
      name: "1800LM Front Light",
      purpose: "Front illumination",
      spec: "Rechargeable · Dual LED",
      description:
        "A rechargeable dual-LED front light with a manufacturer-stated 1800-lumen output.",
      caution:
        "Output is not independently tested. Check runtime, mounting fit and local lighting rules; add a rear light.",
    },
    image: image4.url,
  },
  {
    ...{
      id: "47839557681204",
      catalogTitle: "4.5KPa Mini Air Pump with 1600mAh Battery & Camping Light - white",
      price: 28.99,
      currency: "USD",
      productUrl:
        "https://rockbrosbike.us/products/4-5kpa-mini-air-pump-with-1600mah-battery-camping-light?variant=47839557681204",
      name: "Mini Camping Air Pump",
      purpose: "Inflating a sleeping pad",
      spec: "4.5kPa · 1600mAh",
      description:
        "A compact inflation and deflation pump with a camping light. The catalog lists a 1600mAh battery and 102g weight.",
      caution:
        "For compatible inflatable camping equipment, not bicycle tires. Check nozzle fit before buying.",
    },
    image: image5.url,
  },
  {
    ...{
      id: "48073350381620",
      catalogTitle: "Bike Bottle Cage Ultralight Adjustable Side-Loading",
      price: 16.99,
      currency: "USD",
      productUrl:
        "https://rockbrosbike.us/products/bike-bottle-cage-ultralight-adjustable-side-loading?variant=48073350381620",
      name: "Side-Loading Bottle Cage",
      purpose: "Bottle access",
      spec: "Adjustable · PC + ABS",
      description:
        "An adjustable side-loading bottle cage made from PC and ABS, according to the product description.",
      caution:
        "Check frame mounting points, bottle diameter and clearance. A bottle is not included in this recommendation.",
    },
    image: image6.url,
  },
] satisfies GearProduct[];

export interface GearProduct {
  id: string;
  catalogTitle: string;
  price: number;
  currency: string;
  productUrl: string;
  name: string;
  purpose: string;
  spec: string;
  description: string;
  caution: string;
  image: string;
}
export function gearShopLink(product: GearProduct, guide = "bikepacking") {
  return buildAwinLink(
    {
      id: product.id,
      externalUrl: product.productUrl,
      partner: "awin",
      networkMid: ROCKBROS_ADVERTISER_ID,
    },
    `gear-${guide}-${product.id}`,
  );
}
export function catalogPrice(product: GearProduct) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency }).format(
    product.price,
  );
}

export const gearFaqs = [
  {
    question: "Do I need all seven products?",
    answer:
      "No. These are options for different needs, not a complete packing list. Start with luggage that fits your bike; the saddle bag and rack bag are alternative carrying setups. A helmet, repair kit, tire pump, rear light and route-appropriate supplies may still be needed.",
  },
  {
    question: "Are these products independently tested?",
    answer:
      "No. This is a catalog-based editorial selection, not a hands-on review. Capacities, materials and performance claims come from the ROCKBROS listing and have not been independently tested by MiniaLife.",
  },
  {
    question: "Can the mini air pump inflate bicycle tires?",
    answer:
      "No. The selected 4.5kPa mini pump is listed for inflatable camping equipment, such as compatible sleeping pads. You need a separate tire pump suitable for your bicycle valves and pressure requirements.",
  },
  {
    question: "Are prices and stock guaranteed?",
    answer:
      "No. Displayed USD prices are from the imported catalog reviewed on October 19, 2026. Prices, variants and availability can change. Confirm the current total, delivery region, taxes and returns on ROCKBROS before ordering.",
  },
  {
    question: "Can I ride these routes inside national parks?",
    answer:
      "Bicycle access is route-specific. National parks may restrict bicycles to designated roads and permitted trails. Check the official park rules, seasonal closures and road conditions before planning a ride; a road-trip guide is not a verified cycling route.",
  },
] as const;
