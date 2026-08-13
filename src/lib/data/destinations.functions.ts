import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type OfferView = {
  id: string;
  title: string;
  image: string | null;
  subcategory: string | null;
  priceDisplay: string | null;
  priceValue: number | null;
  priceUnit: string | null;
  externalUrl: string | null;
  whyRecommended: string | null;
  description: string | null;
  duration: string | null;
  partner: string | null;
  category: Tables<"offers">["category"];
  commissionable: boolean;
};

export type SimilarDestination = {
  slug: string;
  name: string;
  region: string;
  heroImage: string;
};

export type DestinationView = {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  heroImage: string;
  gallery: string[];
  aliases: string[];
  bestSeason: string | null;
  scenicScore: number | null;
  campingScore: number | null;
  avgDailyBudget: number | null;
  tripDurationDays: string | null;
  stays: OfferView[];
  rentals: OfferView[];
  activities: OfferView[];
  essentials: OfferView[];
  globalServices: OfferView[];
  similar: SimilarDestination[];
};

function toOfferView(row: Tables<"offers">): OfferView {
  return {
    id: row.id,
    title: row.title,
    image: row.image,
    subcategory: row.subcategory,
    priceDisplay: row.price_display,
    priceValue: row.price_value,
    priceUnit: row.price_unit,
    externalUrl: row.external_url,
    whyRecommended: row.why_recommended,
    description: row.description,
    duration: row.duration,
    partner: row.partner,
    category: row.category,
    commissionable: row.commissionable,
  };
}

export const GLOBAL_SERVICE_CATEGORIES = [
  "insurance",
  "esim",
  "offline_maps",
  "car_rental",
  "travel_card",
  "park_pass",
] as const;

export const getDestinationPageData = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }): Promise<DestinationView | null> => {
    const { data: dest, error: destError } = await supabase
      .from("destinations")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();

    if (destError) throw destError;
    if (!dest) return null;

    const { data: offers, error: offersError } = await supabase
      .from("offers")
      .select("*")
      .eq("destination_id", dest.id);

    if (offersError) throw offersError;

    const { data: globalRows, error: globalError } = await supabase
      .from("offers")
      .select("*")
      .is("destination_id", null)
      .in("category", GLOBAL_SERVICE_CATEGORIES as unknown as string[]);

    if (globalError) throw globalError;

    const order = GLOBAL_SERVICE_CATEGORIES as readonly string[];
    const globalServices = (globalRows ?? [])
      .slice()
      .sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category))
      .map(toOfferView);


    const byCategory = (categories: Tables<"offers">["category"][]) =>
      (offers ?? []).filter((o) => categories.includes(o.category)).map(toOfferView);

    let similar: SimilarDestination[] = [];
    if (dest.similar_slugs.length > 0) {
      const { data: similarRows, error: similarError } = await supabase
        .from("destinations")
        .select("slug, name, region, hero_image")
        .in("slug", dest.similar_slugs);

      if (similarError) throw similarError;

      similar = (similarRows ?? []).map((s) => ({
        slug: s.slug,
        name: s.name,
        region: s.region ?? "",
        heroImage: s.hero_image ?? "",
      }));
    }

    return {
      slug: dest.slug,
      name: dest.name,
      region: dest.region ?? "",
      tagline: dest.tagline ?? "",
      heroImage: dest.hero_image ?? "",
      gallery: dest.gallery,
      aliases: dest.aliases,
      bestSeason: dest.best_season,
      scenicScore: dest.scenic_score,
      campingScore: dest.camping_score,
      avgDailyBudget: dest.avg_daily_budget,
      tripDurationDays: dest.trip_duration_days,
      stays: byCategory(["stay"]),
      rentals: byCategory(["rv_rental", "gear_rental"]),
      activities: byCategory(["activity"]),
      essentials: byCategory(["gear_purchase"]),
      similar,
    };
  });
