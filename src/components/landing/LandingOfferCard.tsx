import { useServerFn } from "@tanstack/react-start";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import type { OfferView } from "@/lib/data/destinations.functions";
import { trackAndRedirect } from "@/lib/affiliates/track.functions";
import { getOrCreateSessionId } from "@/lib/affiliates/session";
import { outboundLinkTitle, partnerLabel } from "@/lib/affiliates/compliance";

export function LandingOfferCard({ offer, destinationSlug, destinationHero }: { offer: OfferView; destinationSlug: string; destinationHero: string }) {
  const track = useServerFn(trackAndRedirect);
  const [pending, setPending] = useState(false);
  const label = partnerLabel(offer.partner);

  const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pending || !offer.externalUrl) return;
    const fallback = offer.externalUrl;
    setPending(true);
    const tab = window.open("", "_blank");
    try {
      const { redirectUrl } = await track({
        data: {
          offerId: offer.id,
          destinationSlug,
          sessionId: getOrCreateSessionId(),
          referrerPage: window.location.pathname,
        },
      });
      if (tab) tab.location.href = redirectUrl;
    } catch {
      if (tab) tab.location.href = fallback;
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {offer.image && offer.image !== destinationHero && (
        <img src={offer.image} alt={offer.title} loading="lazy" className="h-36 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-foreground">{offer.title}</h3>
        {offer.whyRecommended && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{offer.whyRecommended}</p>
        )}
        {offer.priceDisplay && (
          <p className="text-sm font-semibold text-foreground">
            {offer.priceDisplay} <span className="font-normal text-muted-foreground">(estimate)</span>
          </p>
        )}
        {offer.externalUrl && (
          <div className="mt-auto pt-2">
            <a
              href={offer.externalUrl}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              title={outboundLinkTitle(offer.partner, offer.externalUrl)}
              onClick={onClick}
              className="inline-flex items-center gap-1.5 rounded-full bg-copper px-4 py-2 text-xs font-semibold text-off-white hover:bg-copper/90"
            >
              Check availability <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {label ? `Partner link · ${label}` : "Partner link"}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
