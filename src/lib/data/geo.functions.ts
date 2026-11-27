import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { validMapCoordinate, type CountryMapPlace } from "@/lib/routes/countryMap";
import { toCurrentOrigin } from "@/lib/seo/originUrl";
import { genuineSeason } from "@/lib/seo/season";
import { computeHubStats, type HubStats } from "@/lib/seo/hubSummary";

export type GeoPlace = { slug: string; name: string; heroImage: string; tagline: string | null; bestSeason: string | null };
export type GeoRegion = { slug: string; name: string; count: number; heroImage: string };

const code = z.string().regex(/^[a-z0-9-]{2,100}$/);

/** Published geographic points only; no visit permission or driving availability is inferred. */
export const getCountryMapPlaces = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ country: code }).parse(input))
  .handler(async ({ data }): Promise<CountryMapPlace[]> => {
    const { data: rows, error } = await supabase.from("destinations")
      .select("slug,name,region_slug,lat,lng,access_type").eq("country_code", data.country).eq("status", "published").order("name");
    if (error) throw error;
    return (rows ?? []).flatMap(r => r.region_slug && r.lat != null && r.lng != null && validMapCoordinate(r.lat, r.lng)
      ? [{ slug: r.slug, name: r.name, region: r.region_slug, lat: r.lat, lng: r.lng, access: r.access_type }] : []);
  });

/** Regions of one country with their published destination counts and a cover. */
export const getCountryRegions = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ country: code }).parse(input))
  .handler(async ({ data }): Promise<GeoRegion[]> => {
    const [{ data: regions, error }, { data: dests, error: dErr }] = await Promise.all([
      supabase.from("regions").select("slug, name").eq("country_code", data.country).eq("status", "published").order("name"),
      supabase.from("destinations").select("region_slug, hero_image, scenic_score").eq("country_code", data.country).eq("status", "published").order("scenic_score", { ascending: false, nullsFirst: false }),
    ]);
    if (error) throw error;
    if (dErr) throw dErr;
    return (regions ?? [])
      .map((r) => {
        const inRegion = (dests ?? []).filter((d) => d.region_slug === r.slug);
        return { slug: r.slug, name: r.name, count: inRegion.length, heroImage: toCurrentOrigin(inRegion.find((d) => d.hero_image)?.hero_image) ?? "" };
      })
      .filter((r) => r.count > 0);
  });

/** Region name + its published destinations; null when the region has none. */
export const getRegionPlaces = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ country: code, region: code }).parse(input))
  .handler(async ({ data }): Promise<{ name: string; places: GeoPlace[] } | null> => {
    const [{ data: region }, { data: rows, error }] = await Promise.all([
      supabase.from("regions").select("name").eq("country_code", data.country).eq("slug", data.region).eq("status", "published").maybeSingle(),
      supabase.from("destinations").select("slug, name, hero_image, tagline, best_season").eq("country_code", data.country).eq("region_slug", data.region).eq("status", "published").order("name"),
    ]);
    if (error) throw error;
    if (!region || !rows?.length) return null;
    return {
      name: region.name,
      places: rows.map((d) => ({ slug: d.slug, name: d.name, heroImage: toCurrentOrigin(d.hero_image) ?? "", tagline: d.tagline, bestSeason: genuineSeason(d.best_season) })),
    };
  });

/** Country/region of a destination slug (fallback when the bundled map is stale). */
export const getDestinationGeo = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: code }).parse(input))
  .handler(async ({ data }): Promise<{ country: string; region: string } | null> => {
    const { data: row } = await supabase.from("destinations").select("country_code, region_slug").eq("slug", data.slug).eq("status", "published").maybeSingle();
    return row?.region_slug ? { country: row.country_code, region: row.region_slug } : null;
  });

/** Stored facts for a country or region hub (counts, typical stay, airports, drive, access, notable places) and regions.intro. */
export const getHubStats = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ country: code, region: code.optional(), locale: z.enum(["en", "de", "fr"]).default("en") }).parse(input))
  .handler(async ({ data }): Promise<{ stats: HubStats; intro: string | null }> => {
    // German/French hubs list only places with a published translation: count the same subset, with translated names.
    let translated: Map<string, string> | null = null;
    if (data.locale !== "en") {
      translated = new Map();
      for (let from = 0; ; from += 1000) {
        const { data: tr, error: trErr } = await supabase.from("content_translations").select("entity_id, name:fields->>name")
          .eq("entity_type", "destination").eq("locale", data.locale).eq("status", "published").range(from, from + 999);
        if (trErr) throw trErr;
        for (const t of tr ?? []) translated.set(t.entity_id, (t as { name?: string | null }).name || "");
        if (!tr || tr.length < 1000) break;
      }
    }
    let q = supabase.from("destinations")
      .select("slug,name,destination_type,trip_duration_days,nearest_airport_code,nearest_airport_name,drive_minutes,access_type,scenic_score")
      .eq("country_code", data.country).eq("status", "published");
    if (data.region) q = q.eq("region_slug", data.region);
    const [{ data: rows, error }, regionRow] = await Promise.all([
      q,
      data.region
        ? supabase.from("regions").select("intro").eq("country_code", data.country).eq("slug", data.region).eq("status", "published").maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    if (error) throw error;
    const stats = computeHubStats((rows ?? []).filter((r) => !translated || translated.has(r.slug)).map((r) => ({
      slug: r.slug, name: translated?.get(r.slug) || r.name, destinationType: r.destination_type, tripDurationDays: r.trip_duration_days,
      airportCode: r.nearest_airport_code, airportName: r.nearest_airport_name, driveMinutes: r.drive_minutes, accessType: r.access_type, scenicScore: r.scenic_score,
    })));
    const intro = (regionRow.data as { intro: string | null } | null)?.intro?.trim() || null;
    return { stats, intro };
  });
