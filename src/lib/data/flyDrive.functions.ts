import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

export type FlyDriveSibling = { slug: string; name: string; driveMinutes: number | null; heroImage: string };

/** Other published destinations served by the same airport (for internal links). */
export const getAirportSiblings = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ airport: z.string().regex(/^[A-Z]{3}$/), exclude: z.string() }).parse(d))
  .handler(async ({ data }): Promise<FlyDriveSibling[]> => {
    const { data: rows, error } = await supabase
      .from("destinations")
      .select("slug, name, drive_minutes, hero_image")
      .eq("status", "published")
      .eq("nearest_airport_code", data.airport)
      .neq("slug", data.exclude)
      .order("drive_minutes")
      .limit(6);
    if (error) {
      console.error("[getAirportSiblings]", error);
      return [];
    }
    return (rows ?? []).map((r) => ({ slug: r.slug, name: r.name, driveMinutes: r.drive_minutes, heroImage: r.hero_image ?? "" }));
  });
