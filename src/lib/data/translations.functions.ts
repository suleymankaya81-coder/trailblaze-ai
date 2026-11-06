import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export type DestinationTranslation = {
  name: string; region?: string | null; tagline?: string | null; bestSeason?: string | null;
  permitHeadline?: string | null; permitNote?: string | null;
  metaTitle: string; metaDescription: string;
  days: { title: string; start: string; stops: { name: string; detail: string }[]; driving: string; note: string }[];
  intel: { title: string; text: string }[];
  arrival?: string | null; vehicle?: string | null; goldenHour?: string | null;
};

const localeSchema = z.enum(["de"]);

export const getDestinationTranslation = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().max(80), locale: localeSchema }).parse(d))
  .handler(async ({ data }): Promise<DestinationTranslation | null> => {
    const { data: row } = await supabase
      .from("content_translations").select("fields")
      .eq("entity_type", "destination").eq("entity_id", data.slug).eq("locale", data.locale).eq("status", "published")
      .maybeSingle();
    return (row?.fields as DestinationTranslation | undefined) ?? null;
  });

/** Locales (besides English) with a published translation for this place. */
export const getDestinationLocales = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().max(80) }).parse(d))
  .handler(async ({ data }): Promise<string[]> => {
    const { data: rows } = await supabase
      .from("content_translations").select("locale")
      .eq("entity_type", "destination").eq("entity_id", data.slug).eq("status", "published");
    return (rows ?? []).map((r) => r.locale);
  });

export type TranslatedPlace = { slug: string; name: string; tagline: string | null; heroImage: string; bestSeason: string | null };

export const listTranslatedDestinations = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ locale: localeSchema }).parse(d))
  .handler(async ({ data }): Promise<TranslatedPlace[]> => {
    const { data: rows } = await supabase
      .from("content_translations").select("entity_id, fields")
      .eq("entity_type", "destination").eq("locale", data.locale).eq("status", "published");
    if (!rows?.length) return [];
    const { data: dests } = await supabase
      .from("destinations").select("slug, hero_image").eq("status", "published")
      .in("slug", rows.map((r) => r.entity_id));
    const hero = Object.fromEntries((dests ?? []).map((d) => [d.slug, d.hero_image ?? ""]));
    return rows
      .filter((r) => hero[r.entity_id] !== undefined)
      .map((r) => {
        const f = r.fields as DestinationTranslation;
        return { slug: r.entity_id, name: f.name, tagline: f.tagline ?? null, heroImage: hero[r.entity_id], bestSeason: f.bestSeason ?? null };
      })
      .sort((a, b) => a.name.localeCompare(b.name, data.locale));
  });
