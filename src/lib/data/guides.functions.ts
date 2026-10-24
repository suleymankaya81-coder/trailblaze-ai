import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import type { LoopStop } from "@/lib/seo/guides";

const slugs = z.object({ slugs: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1).max(12) });

export type GuideAlt = { slug: string; name: string; heroImage: string; permitLevel: "high" | "moderate" | "none" | null };

/** Published destinations by slug (used for no-booking alternatives). */
export const getGuideAlternatives = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => slugs.parse(d))
  .handler(async ({ data }): Promise<GuideAlt[]> => {
    const { data: rows, error } = await supabase
      .from("destinations")
      .select("slug, name, hero_image, permit_level")
      .eq("status", "published")
      .in("slug", data.slugs);
    if (error) {
      console.error("[getGuideAlternatives]", error);
      return [];
    }
    return (rows ?? []).map((r) => ({ slug: r.slug, name: r.name, heroImage: r.hero_image ?? "", permitLevel: (r.permit_level as GuideAlt["permitLevel"]) ?? null }));
  });

/** Loop stops in the order given; missing or unpublished stops are dropped. */
export const getLoopStops = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => slugs.parse(d))
  .handler(async ({ data }): Promise<LoopStop[]> => {
    const { data: rows, error } = await supabase
      .from("destinations")
      .select("slug, name, lat, lng, hero_image, trip_duration_days, permit_level, permit_headline, nearest_airport_code, nearest_airport_name")
      .eq("status", "published")
      .in("slug", data.slugs);
    if (error) throw new Error("Could not load loop stops");
    const bySlug = new Map((rows ?? []).map((r) => [r.slug, r]));
    return data.slugs.flatMap((s) => {
      const r = bySlug.get(s);
      if (!r || r.lat == null || r.lng == null) return [];
      return [{
        slug: r.slug, name: r.name, lat: r.lat, lng: r.lng, heroImage: r.hero_image ?? "",
        tripDurationDays: r.trip_duration_days, permitLevel: (r.permit_level as LoopStop["permitLevel"]) ?? null, permitHeadline: r.permit_headline,
        airportCode: r.nearest_airport_code ?? null, airportName: r.nearest_airport_name ?? null,
      }];
    });
  });
