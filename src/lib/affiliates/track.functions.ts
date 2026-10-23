import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { getAffiliateAdapter } from "@/lib/affiliates";
import { buildAwinLink } from "@/lib/affiliates/awin";
import { withWebjetAffiliate } from "@/lib/affiliates/webjet";
import { isBotUserAgent, hasAfsrcParam } from "@/lib/affiliates/compliance";

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
      .select("id, external_url, partner, network, network_mid")
      .eq("id", data.offerId)
      .maybeSingle();

    if (offerError) throw offerError;
    if (!offer || !offer.external_url) {
      throw new Error("Offer is not bookable yet");
    }

    // Affiliate best practice: links already carrying afsrc=1 belong to another
    // affiliate — pass them through untouched, never re-affiliate them.
    if (hasAfsrcParam(offer.external_url)) {
      return { redirectUrl: offer.external_url };
    }

    const sessionId = data.sessionId ?? crypto.randomUUID();

    // Bot click filter: automated traffic must never be recorded as a
    // Reader click.
    const userAgent = getRequestHeader("user-agent") ?? "";
    const isBot = isBotUserAgent(userAgent);

    if (!isBot) {
      const { error: insertError } = await supabase.from("click_events").insert({
        offer_id: offer.id,
        destination_slug: data.destinationSlug,
        session_id: sessionId,
        referrer_page: data.referrerPage ?? null,
      });
      // A tracking hiccup should never block the user's booking flow.
      if (insertError) console.error("[trackAndRedirect] click_events insert failed", insertError);
    }

    if (offer.network === "awin") {
      return {
        redirectUrl: buildAwinLink(
          { id: offer.id, externalUrl: offer.external_url, partner: offer.partner, networkMid: offer.network_mid },
          sessionId,
        ),
      };
    }

    if (offer.partner === "motorhome_republic") {
      return { redirectUrl: withWebjetAffiliate(offer.external_url) };
    }
    // REI is a plain, non-affiliate link until a real partnership exists.
    if (offer.partner === "rei") {
      return { redirectUrl: offer.external_url };
    }

    const adapter = getAffiliateAdapter(offer.partner);
    const redirectUrl = adapter.buildDeepLink(
      { id: offer.id, externalUrl: offer.external_url, partner: offer.partner },
      { sessionId, destinationSlug: data.destinationSlug },
    );

    return { redirectUrl };
  });
