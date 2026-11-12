import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export type GeoPlace = { slug: string; name: string; heroImage: string; tagline: string | null; bestSeason: string | null };
export type GeoRegion = { slug: string; name: string; count: number; heroImage: string };

const code = z.string().regex(/^[a-z0-9-]{2,60}$/);

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
        return { slug: r.slug, name: r.name, count: inRegion.length, heroImage: inRegion.find((d) => d.hero_image)?.hero_image ?? "" };
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
      places: rows.map((d) => ({ slug: d.slug, name: d.name, heroImage: d.hero_image ?? "", tagline: d.tagline, bestSeason: d.best_season })),
    };
  });

/** Country/region of a destination slug (fallback when the bundled map is stale). */
export const getDestinationGeo = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: code }).parse(input))
  .handler(async ({ data }): Promise<{ country: string; region: string } | null> => {
    const { data: row } = await supabase.from("destinations").select("country_code, region_slug").eq("slug", data.slug).eq("status", "published").maybeSingle();
    return row?.region_slug ? { country: row.country_code, region: row.region_slug } : null;
  });
