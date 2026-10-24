import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { parseTravelPlan, type TravelPlan } from "./travelPlan";
import { isApprovedRental } from "@/lib/affiliates/rentalPolicy";
import { withWebjetAffiliate } from "@/lib/affiliates/webjet";

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
  network: string | null;
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
  photoCredit: string | null;
  aliases: string[];
  bestSeason: string | null;
  scenicScore: number | null;
  campingScore: number | null;
  avgDailyBudget: number | null;
  tripDurationDays: string | null;
  id: string;
  permitLevel: "high" | "moderate" | "none" | null;
  permitHeadline: string | null;
  permitNote: string | null;
  permitSourceUrl: string | null;
  travelPlan: TravelPlan | null;
  airportCode: string | null;
  airportName: string | null;
  airportLat: number | null;
  airportLng: number | null;
  lat: number | null;
  lng: number | null;
  driveMinutes: number | null;
  driveMiles: number | null;
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
    externalUrl: row.external_url ? withWebjetAffiliate(row.external_url) : null,
    whyRecommended: row.why_recommended,
    description: row.description,
    duration: row.duration,
    partner: row.partner,
    network: row.network,
    category: row.category,
    commissionable: row.commissionable,
  };
}

// Other services retain their existing networks; rentals use the exclusive Webjet partners.
const SHOWN_NETWORKS = ["awin", "info"] as const;

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
      .eq("status", "published")
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
      .in("network", [...SHOWN_NETWORKS])
      .in("category", [...GLOBAL_SERVICE_CATEGORIES]);

    if (globalError) throw globalError;

    const order = GLOBAL_SERVICE_CATEGORIES as readonly string[];
    const globalServices = (globalRows ?? [])
      .slice()
      .sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category))
      .map(toOfferView);

    const byCategory = (categories: Tables<"offers">["category"][]) =>
      (offers ?? [])
        .filter((o) => categories.includes(o.category))
        .filter((o) => isApprovedRental(o.partner, o.category))
        .filter(
          (o) =>
            SHOWN_NETWORKS.some((network) => network === o.network) ||
            (o.partner === "motorhome_republic" && o.category === "rv_rental") ||
            (o.partner === "airport_rentals" && o.category === "rv_rental") ||
            (o.partner === "rei" && o.category === "gear_purchase"),
        )
        .map(toOfferView);

    let similar: SimilarDestination[] = [];
    if (dest.similar_slugs.length > 0) {
      const { data: similarRows, error: similarError } = await supabase
        .from("destinations")
        .select("slug, name, region, hero_image")
        .in("slug", dest.similar_slugs)
        .eq("status", "published");

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
      photoCredit: dest.photo_credit,
      aliases: dest.aliases,
      bestSeason: dest.best_season,
      scenicScore: dest.scenic_score,
      campingScore: dest.camping_score,
      avgDailyBudget: dest.avg_daily_budget,
      tripDurationDays: dest.trip_duration_days,
      id: dest.id,
      permitLevel: dest.permit_level,
      permitHeadline: dest.permit_headline,
      permitNote: dest.permit_note,
      permitSourceUrl: dest.permit_source_url,
      travelPlan: parseTravelPlan(dest.travel_plan),
      airportCode: dest.nearest_airport_code,
      airportName: dest.nearest_airport_name,
      airportLat: dest.airport_lat,
      airportLng: dest.airport_lng,
      lat: dest.lat,
      lng: dest.lng,
      driveMinutes: dest.drive_minutes,
      driveMiles: dest.drive_miles,
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
    // Query each rental type separately: an alphabetical car-only limit
    // otherwise crowds every RV and bicycle out of the homepage.
    const results = await Promise.all([
      supabase.from("offers").select("*").eq("category", "rv_rental").eq("subcategory", "RV").limit(4),
      supabase.from("offers").select("*").eq("category", "rv_rental").eq("subcategory", "Campervan").limit(4),
      supabase.from("offers").select("*").eq("category", "gear_rental").order("title").limit(40),
      supabase.from("offers").select("*").eq("category", "rv_rental").eq("subcategory", "Car rental").order("title").limit(2),
      supabase.from("offers").select("*").eq("category", "gear_purchase").order("title").limit(4),
    ]);
    const offersError = results.find((result) => result.error)?.error;
    const offers = results.flatMap((result) => result.data ?? []);

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
      .eq("status", "published")
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

    const { matchesTerm } = await import("./searchIntent");
    const byAlias = rows.find((d) => matchesTerm(q, d.name) || d.aliases.some((a) => matchesTerm(q, a)));
    if (byAlias) return { slug: byAlias.slug };

    return { slug: null };
  });

// Plan Builder categories on the homepage — value must match a trip_tags
// entry written by the migration; label is what's shown on the card.
export const TRIP_TAG_OPTIONS = [
  { value: "weekend", label: "Weekend Escape" },
  { value: "rv_road_trip", label: "RV Road Trip" },
  { value: "glamping", label: "Glamping Getaway" },
  { value: "family", label: "Family Camping" },
  { value: "mountain", label: "Mountain Escape" },
  { value: "desert", label: "Desert Adventure" },
  { value: "lake", label: "Lakeside" },
  { value: "coastal", label: "Coastal" },
  { value: "national_park", label: "National Parks" },
] as const;

// Fixed page size for /destinations — 446 published rows and growing, so
// this can never be an unbounded fetch. Divides evenly into the grid's
// sm:grid-cols-2 lg:grid-cols-3 layout.
export const DESTINATIONS_PAGE_SIZE = 24;

// Full destinations list (for /destinations), optionally filtered by a
// single trip_tags value and paginated. Same per-row shape as
// HomepageDestination — both are "just enough to render a destination card."
export const getDestinationsList = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ tag: z.string().optional(), region: z.string().optional(), season: z.string().optional(), q: z.string().max(80).optional(), page: z.number().int().min(1).optional() }).parse(input),
  )
  .handler(async ({ data }): Promise<{ destinations: HomepageDestination[]; total: number }> => {
    const page = data.page ?? 1;
    const from = (page - 1) * DESTINATIONS_PAGE_SIZE;
    const to = from + DESTINATIONS_PAGE_SIZE - 1;

    let query = supabase
      .from("destinations")
      .select("id, slug, name, region, hero_image, best_season, trip_duration_days, trip_tags", {
        count: "exact",
      })
      .eq("status", "published")
      .order("name", { ascending: true });

    if (data.tag) query = query.contains("trip_tags", [data.tag]);
    const { US_REGIONS, isRegionKey, SEASONS } = await import("./usRegions");
    if (isRegionKey(data.region)) query = query.in("state", [...US_REGIONS[data.region].states]);
    if (data.season && (SEASONS as readonly string[]).includes(data.season)) query = query.contains("best_seasons", [data.season]);
    const nameQ = data.q?.trim().replace(/[%_,()]/g, "");
    if (nameQ) query = query.ilike("name", `%${nameQ}%`);

    const { data: rows, error, count } = await query.range(from, to);

    if (error) {
      console.error("[getDestinationsList] query failed", error);
      return { destinations: [], total: 0 };
    }

    return {
      destinations: (rows ?? []).map((d) => ({
        id: d.id,
        slug: d.slug,
        name: d.name,
        region: d.region ?? "",
        heroImage: d.hero_image ?? "",
        bestSeason: d.best_season,
        tripDurationDays: d.trip_duration_days,
      })),
      total: count ?? 0,
    };
  });

// Cover photos for route list cards: slug → published hero image.
export const getDestinationCovers = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slugs: z.array(z.string().max(80)).max(300) }).parse(d))
  .handler(async ({ data }): Promise<Record<string, string>> => {
    if (!data.slugs.length) return {};
    const { data: rows, error } = await supabase
      .from("destinations")
      .select("slug, hero_image")
      .eq("status", "published")
      .in("slug", data.slugs);
    if (error) {
      console.error("[getDestinationCovers] query failed", error);
      return {};
    }
    return Object.fromEntries((rows ?? []).filter((r) => r.hero_image).map((r) => [r.slug, r.hero_image as string]));
  });
