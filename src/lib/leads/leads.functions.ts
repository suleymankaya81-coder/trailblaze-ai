import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  destinationId: z.string().uuid(),
  sessionId: z.string().max(100).optional(),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0).optional(),
});

export const captureLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("email_leads")
      .upsert(
        { email: data.email, destination_id: data.destinationId, session_id: data.sessionId ?? null },
        { onConflict: "email,destination_id", ignoreDuplicates: true },
      );
    if (error && error.code !== "23505") {
      console.error("[captureLead]", error);
      throw new Error("Could not save your email. Please try again.");
    }
    return { ok: true };
  });
