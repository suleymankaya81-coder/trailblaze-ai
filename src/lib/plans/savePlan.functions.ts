import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  destinationSlug: z.string().min(1),
});

export const saveTripPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    // The RPC is SECURITY DEFINER and only executable by the service role,
    // so it runs through the trusted server-side client (never the browser).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // The save_trip_plan function isn't in the generated types yet, so the
    // client is widened here rather than hand-editing the generated file.
    const { error } = await (
      supabaseAdmin.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ error: unknown }>
    )("save_trip_plan", {
      p_email: data.email,
      p_destination_slug: data.destinationSlug,
    });

    if (error) {
      console.error("[saveTripPlan] save_trip_plan RPC failed", error);
      throw new Error("Could not save this plan. Please try again.");
    }

    return { ok: true };
  });
