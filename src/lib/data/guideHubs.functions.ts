import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { flyDriveSlug } from "@/lib/seo/flyDrive";
import { isNoReservationEligible, isRvEligible, type GuideDest } from "@/lib/seo/guides";

export type HubFamily = "fly-and-drive" | "no-reservation" | "rv-camping";
export type HubEntry = { slug: string; name: string; state: string; heroImage: string; airportCode: string | null; driveMinutes: number | null };

/** Every published destination eligible for a guide family, using the same rules as the guide pages and sitemaps. */
export const getHubEntries = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ family: z.enum(["fly-and-drive", "no-reservation", "rv-camping"]) }).parse(d))
  .handler(async ({ data }): Promise<HubEntry[]> => {
    const rows: any[] = [];
    for (let from = 0; ; from += 1000) {
      const { data: page, error } = await supabase
        .from("destinations")
        .select("slug,name,state,hero_image,nearest_airport_code,nearest_airport_name,drive_minutes,drive_miles,permit_level,permit_note,permit_headline,camping_score,best_season")
        .eq("status", "published")
        .order("name")
        .range(from, from + 999);
      if (error) throw new Error("Could not load guides");
      rows.push(...(page ?? []));
      if (!page || page.length < 1000) break;
    }
    const out: HubEntry[] = [];
    for (const d of rows) {
      const g: GuideDest = { slug: d.slug, name: d.name, airportCode: d.nearest_airport_code, airportName: d.nearest_airport_name, driveMinutes: d.drive_minutes, permitLevel: d.permit_level, permitNote: d.permit_note, permitHeadline: d.permit_headline, campingScore: d.camping_score, bestSeason: d.best_season };
      let slug: string | null = d.slug;
      if (data.family === "fly-and-drive") slug = flyDriveSlug({ ...g, driveMiles: d.drive_miles });
      else if (data.family === "no-reservation" && !isNoReservationEligible(g)) slug = null;
      else if (data.family === "rv-camping" && !isRvEligible(g)) slug = null;
      if (slug) out.push({ slug, name: d.name, state: d.state ?? "", heroImage: d.hero_image ?? "", airportCode: d.nearest_airport_code, driveMinutes: d.drive_minutes });
    }
    return out;
  });
