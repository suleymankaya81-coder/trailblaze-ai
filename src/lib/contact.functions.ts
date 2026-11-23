import { createServerFn } from "@tanstack/react-start";

import { contactSchema } from "@/lib/contact";

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("contact_submissions")
      .insert({ name: data.name, email: data.email, message: data.message });
    if (error) {
      console.error("[submitContactMessage]", error);
      throw new Error("Could not send your message. Please try again.");
    }
    return { ok: true };
  });
