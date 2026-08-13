import type { AffiliateAdapter } from "./types";
import { withTrackingParams } from "./util";

const HOMEPAGE = "https://www.hipcamp.com";

// No affiliate program approved yet — aff_id/sub_id param names are
// placeholders and should be swapped for Hipcamp's real partner-link
// spec once the program is live.
export const hipcampAdapter: AffiliateAdapter = {
  partner: "hipcamp",
  buildDeepLink(offer, context) {
    const base = offer.externalUrl || HOMEPAGE;
    const affId = process.env.HIPCAMP_AFF_ID;
    if (!affId) return base;
    return withTrackingParams(base, { aff_id: affId, sub_id: context.sessionId });
  },
};
