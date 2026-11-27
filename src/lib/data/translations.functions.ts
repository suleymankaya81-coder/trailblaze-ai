import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { collectPages } from "./pagination";
import { toCurrentOrigin } from "@/lib/seo/originUrl";

export type DestinationTranslation = {
  name: string; region?: string | null; tagline?: string | null; bestSeason?: string | null;
  permitHeadline?: string | null; permitNote?: string | null;
  metaTitle: string; metaDescription: string;
  days: { title: string; start: string; stops: { name: string; detail: string }[]; driving: string; note: string }[];
  intel: { title: string; text: string }[];
  arrival?: string | null; vehicle?: string | null; goldenHour?: string | null;
};

const localeSchema = z.enum(["de", "fr"]);

export const getDestinationTranslation = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().max(100), locale: localeSchema }).parse(d))
  .handler(async ({ data }): Promise<DestinationTranslation | null> => {
    const { data: row, error } = await supabase
      .from("content_translations").select("fields")
      .eq("entity_type", "destination").eq("entity_id", data.slug).eq("locale", data.locale).eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return (row?.fields as DestinationTranslation | undefined) ?? null;
  });

/** Locales (besides English) with a published translation for this place. */
export const getDestinationLocales = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().max(100) }).parse(d))
  .handler(async ({ data }): Promise<string[]> => {
    const { data: rows, error } = await supabase
      .from("content_translations").select("locale")
      .eq("entity_type", "destination").eq("entity_id", data.slug).eq("status", "published");
    if (error) throw error;
    return (rows ?? []).map((r) => r.locale);
  });

export type TranslatedPlace = { slug: string; name: string; tagline: string | null; heroImage: string; bestSeason: string | null };

export const listTranslatedDestinations = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ locale: localeSchema }).parse(d))
  .handler(async ({ data }): Promise<TranslatedPlace[]> => {
    const rows = await collectPages(async (from, to) => {
      const { data: page, error } = await supabase.from("content_translations").select("entity_id, fields")
        .eq("entity_type", "destination").eq("locale", data.locale).eq("status", "published")
        .order("entity_id").range(from, to);
      if (error) throw error;
      return page ?? [];
    });
    if (!rows.length) return [];
    const dests = await collectPages(async (from, to) => {
      const { data: page, error } = await supabase.from("destinations").select("slug, hero_image")
        .eq("status", "published").order("slug").range(from, to);
      if (error) throw error;
      return page ?? [];
    });
    const hero = Object.fromEntries((dests ?? []).map((d) => [d.slug, toCurrentOrigin(d.hero_image) ?? ""]));
    return rows
      .filter((r) => hero[r.entity_id] !== undefined)
      .map((r) => {
        const f = r.fields as DestinationTranslation;
        return { slug: r.entity_id, name: f.name, tagline: f.tagline ?? null, heroImage: hero[r.entity_id], bestSeason: f.bestSeason ?? null };
      })
      .sort((a, b) => a.name.localeCompare(b.name, data.locale));
  });
