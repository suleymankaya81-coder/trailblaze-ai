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

export type FeaturedGearOffer = OfferView & {
  destinationSlug: string;
  destinationName: string;
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
      .in("category", [...GLOBAL_SERVICE_CATEGORIES]);

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
      globalServices,
      similar,
    };
  });

// Homepage module: a handful of real rv_rental/gear_rental/gear_purchase
// offers spanning different destinations. The seed data reuses a shared
// catalog per category across every destination, so we dedupe by title —
// otherwise a naive limit() surfaces the same handful of items repeated.
export const getFeaturedGearOffers = createServerFn({ method: "GET" }).handler(
  async (): Promise<FeaturedGearOffer[]> => {
    const { data: offers, error: offersError } = await supabase
      .from("offers")
      .select("*")
      .in("category", ["rv_rental", "gear_rental", "gear_purchase"])
      .order("title", { ascending: true })
      .limit(60);

    if (offersError) {
      console.error("[getFeaturedGearOffers] offers query failed", offersError);
      return [];
    }
    if (!offers || offers.length === 0) return [];

    const seenTitles = new Set<string>();
    const distinctOffers: Tables<"offers">[] = [];
    for (const offer of offers) {
      if (seenTitles.has(offer.title)) continue;
      seenTitles.add(offer.title);
      distinctOffers.push(offer);
      if (distinctOffers.length >= 8) break;
    }

    const destinationIds = [
      ...new Set(
        distinctOffers.map((o) => o.destination_id).filter((id): id is string => id !== null),
      ),
    ];
    const { data: destRows, error: destError } = await supabase
      .from("destinations")
      .select("id, slug, name")
      .in("id", destinationIds);

    if (destError) {
      console.error("[getFeaturedGearOffers] destinations query failed", destError);
      return [];
    }

    const destById = new Map<string, { id: string; slug: string; name: string }>(
      (destRows ?? []).map((d) => [d.id, d]),
    );

    return distinctOffers
      .map((offer) => {
        const dest = offer.destination_id ? destById.get(offer.destination_id) : undefined;
        if (!dest) return null;
        return { ...toOfferView(offer), destinationSlug: dest.slug, destinationName: dest.name };
      })
      .filter((o): o is FeaturedGearOffer => o !== null);
  },
);

export type HomepageDestination = {
  id: string;
  slug: string;
  name: string;
  region: string;
  heroImage: string;
  bestSeason: string | null;
  tripDurationDays: string | null;
};

// Homepage module: a handful of published destinations for the "3 large +
// 3 compact" grid. Ranked by scenic_score (the closest honest proxy for
// "featured" the schema has — there's no real popularity metric) with name
// as a stable tiebreaker.
export const getHomepageDestinations = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageDestination[]> => {
    const { data, error } = await supabase
      .from("destinations")
      .select("id, slug, name, region, hero_image, best_season, trip_duration_days")
      .eq("status", "published")
      .order("scenic_score", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .limit(6);

    if (error) {
      console.error("[getHomepageDestinations] query failed", error);
      return [];
    }

    return (data ?? []).map((d) => ({
      id: d.id,
      slug: d.slug,
      name: d.name,
      region: d.region ?? "",
      heroImage: d.hero_image ?? "",
      bestSeason: d.best_season,
      tripDurationDays: d.trip_duration_days,
    }));
  },
);

// Site-search matching against the live catalog: exact slug, then
// alias/name substring match, both case-insensitive. Returns null rather
// than guessing when nothing matches — callers must not fall back to an
// arbitrary destination on a miss.
export const findDestinationSlugByQuery = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ query: z.string() }).parse(input))
  .handler(async ({ data }): Promise<{ slug: string | null }> => {
    const q = data.query.trim().toLowerCase();
    if (!q) return { slug: null };

    const { data: rows, error } = await supabase
      .from("destinations")
      .select("slug, name, aliases")
      .eq("status", "published");

    if (error) {
      console.error("[findDestinationSlugByQuery] query failed", error);
      return { slug: null };
    }
    if (!rows || rows.length === 0) return { slug: null };

    const bySlug = rows.find((d) => d.slug.toLowerCase() === q);
    if (bySlug) return { slug: bySlug.slug };

    const byAlias = rows.find((d) => {
      const name = d.name.toLowerCase();
      return (
        name.includes(q) ||
        d.aliases.some((a) => {
          const alias = a.toLowerCase();
          return alias === q || alias.includes(q) || q.includes(alias);
        })
      );
    });
    if (byAlias) return { slug: byAlias.slug };

    return { slug: null };
  });
