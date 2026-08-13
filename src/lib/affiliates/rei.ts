import type { AffiliateAdapter } from "./types";
import { withTrackingParams } from "./util";

const HOMEPAGE = "https://www.rei.com";

// No affiliate program approved yet — aff_id/sub_id param names are
// placeholders and should be swapped for REI's real partner-link spec
// (e.g. an Impact/CJ network format) once the program is live.
export const reiAdapter: AffiliateAdapter = {
  partner: "rei",
  buildDeepLink(offer, context) {
    const base = offer.externalUrl || HOMEPAGE;
    const affId = process.env.REI_AFF_ID;
    if (!affId) return base;
    return withTrackingParams(base, { aff_id: affId, sub_id: context.sessionId });
  },
};
