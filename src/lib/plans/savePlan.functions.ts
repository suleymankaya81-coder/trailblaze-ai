import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

const InputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  destinationSlug: z.string().min(1),
});

export const saveTripPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { error } = await supabase.rpc("save_trip_plan", {
      p_email: data.email,
      p_destination_slug: data.destinationSlug,
    });

    if (error) {
      console.error("[saveTripPlan] save_trip_plan RPC failed", error);
      throw new Error("Could not save this plan. Please try again.");
    }

    return { ok: true };
  });
