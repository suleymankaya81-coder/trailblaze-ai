import { gearFaqs, gearProducts, type GearProduct } from "./rockbrosGear";
import { cyclingAccessories, repairKit } from "./moreGear";
import bikeHero from "@/assets/gear/bikepacking-hero.jpg";
import cyclingHero from "@/assets/gear/act-cycling.jpg";
import repairHero from "@/assets/gear/act-repair.jpg";

export interface GearGuideConfig {
  slug: string;
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  lede: string;
  countWord: string;
  hero: string;
  heroAlt: string;
  introEyebrow: string;
  introTitle: string;
  intro: string[];
  shortlistTitle: string;
  tableNote: string;
  products: GearProduct[];
  faqs: ReadonlyArray<{ question: string; answer: string }>;
}

const commonFaqs = {
  tested: {
    question: "Are these products independently tested?",
    answer:
      "No. This is a catalog-based editorial selection, not a hands-on review. Specifications and performance claims come from the ROCKBROS listing and have not been independently tested by MiniaLife.",
  },
  price: {
    question: "Are prices and stock guaranteed?",
    answer:
      "No. Displayed USD prices are from the imported catalog reviewed on October 19, 2026. Prices, variants and availability can change. Confirm the current total, delivery region, taxes and returns on ROCKBROS before ordering.",
  },
};

export const gearGuides: Record<string, GearGuideConfig> = {
  bikepacking: {
    slug: "bikepacking",
    path: "/gear/7-bikepacking-essentials",
    title: "7 Bikepacking Essentials",
    metaTitle: "7 Bikepacking Essentials from ROCKBROS | MiniaLife",
    description:
      "Compare seven ROCKBROS bikepacking picks: bags, a front light, a bottle cage and a camping pump, with catalog prices and practical fit notes.",
    lede: "Thoughtful storage, light and little comforts for your next overnight ride. A catalog-based ROCKBROS edit.",
    countWord: "seven",
    hero: bikeHero,
    heroAlt: "Bikepackers on a mountain road — AI-generated editorial illustration",
    introEyebrow: "Less bulk. More outside.",
    introTitle: "Build a setup that fits your ride.",
    intro: [
      "A weekend ride does not need a shopping list as long as the route. These seven options cover different jobs: carrying luggage, keeping small items close, lighting the road and settling in at camp.",
      "Choose the pieces that suit your bike and plans. The saddle bag and rack bag are alternative luggage setups, not compulsory companions. This selection is based on the supplied product catalog, not hands-on testing.",
    ],
    shortlistTitle: "Seven picks. Different purposes.",
    tableNote:
      "Specifications are retailer-stated. Water-resistant and waterproof are different claims; neither has been independently tested here.",
    products: gearProducts,
    faqs: gearFaqs,
  },
  accessories: {
    slug: "accessories",
    path: "/gear/best-cycling-accessories",
    title: "Best Cycling Accessories",
    metaTitle: "Best Cycling Accessories from ROCKBROS | MiniaLife",
    description:
      "Seven ROCKBROS cycling accessories for safer, more comfortable rides: sunglasses, gloves, a tail light, mirror, bell, phone mount and lock, with catalog prices.",
    lede: "Small upgrades that make every ride safer and more comfortable. A catalog-based ROCKBROS edit.",
    countWord: "seven",
    hero: cyclingHero,
    heroAlt: "Cyclist in helmet and sunglasses on a coastal road — AI-generated illustration",
    introEyebrow: "See more. Be seen.",
    introTitle: "The little things that change a ride.",
    intro: [
      "Most riders do not need more bike — they need a few accessories that solve everyday problems: glare, sore hands, traffic behind them and finding the way.",
      "These seven picks each cover one job. Pick the ones that match how and where you ride. This selection is based on the supplied product catalog, not hands-on testing.",
    ],
    shortlistTitle: "Seven accessories. Seven jobs.",
    tableNote:
      "Specifications, volume and brightness figures are retailer-stated and have not been independently tested here.",
    products: cyclingAccessories,
    faqs: [
      {
        question: "Which accessory should I buy first?",
        answer:
          "For riding on roads, visibility usually comes first: a rear light and, where required, a bell. Comfort items such as gloves and sunglasses follow. Local laws on lights and bells vary, so check the rules where you ride.",
      },
      {
        question: "Will the phone mount fit my phone?",
        answer:
          "The selected phone bag is listed for phones below 6 inches. Many current phones are larger, so measure your phone, including its case, before ordering.",
      },
      {
        question: "Is a cable lock enough?",
        answer:
          "A light cable lock only deters casual theft during short stops. For longer or unattended parking, use a heavier U-lock or chain lock.",
      },
      commonFaqs.tested,
      commonFaqs.price,
    ],
  },
  repair: {
    slug: "repair",
    path: "/gear/bike-repair-kit-essentials",
    title: "Bike Repair Kit Essentials",
    metaTitle: "Bike Repair Kit Essentials from ROCKBROS | MiniaLife",
    description:
      "Seven ROCKBROS repair picks for the road and the home workshop: a repair kit, multi-tool, patch kit, tire lever, mini pump, tool set and repair stand.",
    lede: "Be ready for the unexpected — on the trail and at home. A catalog-based ROCKBROS edit.",
    countWord: "seven",
    hero: repairHero,
    heroAlt: "Bike multitool, tire levers and a flashlight on rocky ground — AI-generated illustration",
    introEyebrow: "Fix it. Ride on.",
    introTitle: "A flat should not end your day.",
    intro: [
      "Most roadside stops come down to a puncture, a loose bolt or a tire that needs air. The first five picks are small enough to carry on every ride; the last two are for the home workshop.",
      "Match the tools to your bike: valve type, bolt sizes and tubed or tubeless tires all matter. This selection is based on the supplied product catalog, not hands-on testing.",
    ],
    shortlistTitle: "Five for the ride. Two for home.",
    tableNote:
      "Specifications are retailer-stated. Tool contents can differ by variant; confirm them on the retailer page.",
    products: repairKit,
    faqs: [
      {
        question: "What should I carry on every ride?",
        answer:
          "A practical minimum is a multi-tool, tire lever, patch kit or spare tube, and a pump that fits your valves. Riders with tubeless tires usually also carry plugs and sealant.",
      },
      {
        question: "Does the mini pump fit my valves?",
        answer:
          "Bicycles use Presta or Schrader valves. Check the pump listing for valve compatibility before ordering, and keep any adapters with the pump.",
      },
      {
        question: "Can I clamp a carbon frame in the repair stand?",
        answer:
          "Clamping thin carbon frame tubes can damage them. Clamp the seatpost instead, and follow your bike manufacturer's guidance.",
      },
      commonFaqs.tested,
      commonFaqs.price,
    ],
  },
};
