import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

/** Destination slugs with a published translation in the given locale. */
export const getTranslatedDestinationSlugs = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ locale: z.enum(["de"]) }).parse(input))
  .handler(async ({ data }): Promise<string[]> => {
    const out: string[] = [];
    for (let from = 0; ; from += 1000) {
      const { data: rows, error } = await supabase.from("content_translations").select("entity_id")
        .eq("entity_type", "destination").eq("locale", data.locale).eq("status", "published").range(from, from + 999);
      if (error) throw error;
      out.push(...(rows ?? []).map((r) => r.entity_id));
      if (!rows || rows.length < 1000) break;
    }
    return out;
  });
