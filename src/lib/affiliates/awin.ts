import type { AwinOffer } from "./types";
import { withViatorAffiliate } from "./viator";

// WildParkRoutes publisher account. Public — appears in every Awin link.
export const AWIN_PUBLISHER_ID = "3115962";

// Awin tracked deep link. Until a programme approves us, Awin still forwards
// the click to `ued`, so the button keeps working (just without commission).
export function buildAwinLink(offer: AwinOffer, clickref: string): string {
  // Historical Viator rows still carry rejected Awin programme metadata.
  if (offer.partner === "viator" && offer.externalUrl) return withViatorAffiliate(offer.externalUrl);
  if (!offer.externalUrl || !offer.networkMid) return offer.externalUrl ?? "";
  const params = new URLSearchParams({
    awinmid: String(offer.networkMid),
    awinaffid: AWIN_PUBLISHER_ID,
    clickref,
    ued: offer.externalUrl,
  });
  return `https://www.awin1.com/cread.php?${params.toString()}`;
}
