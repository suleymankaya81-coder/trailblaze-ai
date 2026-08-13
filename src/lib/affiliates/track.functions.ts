import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { getAffiliateAdapter } from "@/lib/affiliates";

const InputSchema = z.object({
  offerId: z.string(),
  destinationSlug: z.string(),
  sessionId: z.string().optional(),
  referrerPage: z.string().optional(),
});

export const trackAndRedirect = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ redirectUrl: string }> => {
    const { data: offer, error: offerError } = await supabase
      .from("offers")
      .select("id, external_url, partner")
      .eq("id", data.offerId)
      .maybeSingle();

    if (offerError) throw offerError;
    if (!offer || !offer.external_url) {
      throw new Error("Offer is not bookable yet");
    }

    const sessionId = data.sessionId ?? crypto.randomUUID();

    const { error: insertError } = await supabase.from("click_events").insert({
      offer_id: offer.id,
      destination_slug: data.destinationSlug,
      session_id: sessionId,
      referrer_page: data.referrerPage ?? null,
    });
    // A tracking hiccup should never block the user's booking flow.
    if (insertError) console.error("[trackAndRedirect] click_events insert failed", insertError);

    const adapter = getAffiliateAdapter(offer.partner);
    const redirectUrl = adapter.buildDeepLink(
      { id: offer.id, externalUrl: offer.external_url, partner: offer.partner },
      { sessionId, destinationSlug: data.destinationSlug },
    );

    return { redirectUrl };
  });
