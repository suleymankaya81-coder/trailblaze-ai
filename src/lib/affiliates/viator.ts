import type { AffiliateAdapter } from "./types";
import { withTrackingParams } from "./util";

const HOMEPAGE = "https://www.viator.com";

// No affiliate program approved yet — aff_id/sub_id param names are
// placeholders and should be swapped for Viator's real partner-link spec
// (e.g. pid/mcid) once the program is live.
export const viatorAdapter: AffiliateAdapter = {
  partner: "viator",
  buildDeepLink(offer, context) {
    const base = offer.externalUrl || HOMEPAGE;
    const affId = process.env.VIATOR_AFF_ID;
    if (!affId) return base;
    return withTrackingParams(base, { aff_id: affId, sub_id: context.sessionId });
  },
};
