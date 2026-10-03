import { useServerFn } from "@tanstack/react-start";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import type { OfferView } from "@/lib/data/destinations.functions";
import type { Photo } from "@/lib/data/destinationCardPhotos";
import { trackAndRedirect } from "@/lib/affiliates/track.functions";
import { getOrCreateSessionId } from "@/lib/affiliates/session";
import { outboundLinkTitle, partnerLabel } from "@/lib/affiliates/compliance";

function useOfferClick(offer: OfferView, destinationSlug: string) {
  const track = useServerFn(trackAndRedirect);
  const [pending, setPending] = useState(false);
  const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pending || !offer.externalUrl) return;
    const fallback = offer.externalUrl;
    setPending(true);
    const tab = window.open("", "_blank");
    try {
      const { redirectUrl } = await track({
        data: { offerId: offer.id, destinationSlug, sessionId: getOrCreateSessionId(), referrerPage: window.location.pathname },
      });
      if (tab) tab.location.href = redirectUrl;
    } catch {
      if (tab) tab.location.href = fallback;
    } finally {
      setPending(false);
    }
  };
  return onClick;
}

function linkMeta(offer: OfferView) {
  const label = partnerLabel(offer.partner);
  const direct = offer.partner === "rvshare" || offer.partner === "rei";
  return {
    rel: direct ? "nofollow noopener noreferrer" : "sponsored nofollow noopener noreferrer",
    note: direct ? `Direct link · ${label ?? "external"}` : label ? `Partner link · ${label}` : "Partner link",
  };
}

// Compact "decide now" row embedded inside a guide section.
export function InlineOfferCta({ offer, destinationSlug, photo, lead }: { offer: OfferView; destinationSlug: string; photo?: Photo; lead: string }) {
  const onClick = useOfferClick(offer, destinationSlug);
  const m = linkMeta(offer);
  if (!offer.externalUrl) return null;
  return (
    <div className="flex items-center gap-4">
      {photo && <img src={photo.url} alt={`${photo.subject}, illustrative photo`} loading="lazy" className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-deep">{lead}</p>
        <p className="truncate text-sm font-semibold text-foreground">{offer.title}</p>
        <p className="text-[10px] text-muted-foreground">{offer.priceDisplay ? `${offer.priceDisplay} (estimate) · ` : ""}{m.note}</p>
      </div>
      <a href={offer.externalUrl} target="_blank" rel={m.rel} title={outboundLinkTitle(offer.partner, offer.externalUrl)} onClick={onClick}
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-copper px-3.5 py-2 text-xs font-semibold text-off-white hover:bg-copper/90">
        Check <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

export function LandingOfferCard({ offer, destinationSlug, photo }: { offer: OfferView; destinationSlug: string; photo?: Photo }) {
  const onClick = useOfferClick(offer, destinationSlug);
  const m = linkMeta(offer);
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {photo && (
        <div className="relative aspect-[4/3]">
          <img src={photo.url} alt={`${photo.subject}, illustrative photo`} loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute bottom-1.5 right-1.5 rounded bg-ink/60 px-1.5 py-0.5 text-[9px] text-off-white">
            Illustrative · <a href={photo.source} target="_blank" rel="noopener noreferrer" className="underline">{photo.credit}</a>
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-foreground">{offer.title}</h3>
        {offer.whyRecommended && <p className="line-clamp-3 text-sm text-muted-foreground">{offer.whyRecommended}</p>}
        {offer.priceDisplay && (
          <p className="text-sm font-semibold text-foreground">
            {offer.priceDisplay} <span className="font-normal text-muted-foreground">(estimate)</span>
          </p>
        )}
        {offer.externalUrl && (
          <div className="mt-auto pt-2">
            <a href={offer.externalUrl} target="_blank" rel={m.rel} title={outboundLinkTitle(offer.partner, offer.externalUrl)} onClick={onClick}
              className="inline-flex items-center gap-1.5 rounded-full bg-copper px-4 py-2 text-xs font-semibold text-off-white hover:bg-copper/90">
              Check availability <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <p className="mt-1 text-[10px] text-muted-foreground">{m.note}</p>
          </div>
        )}
      </div>
    </article>
  );
}
