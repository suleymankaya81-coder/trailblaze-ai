import type { AffiliateAdapter } from "./types";
import { withTrackingParams } from "./util";

const HOMEPAGE = "https://glampinghub.com";

// No affiliate program approved yet — aff_id/sub_id param names are
// placeholders and should be swapped for Glamping Hub's real partner-link
// spec once the program is live.
export const glampingHubAdapter: AffiliateAdapter = {
  partner: "glamping_hub",
  buildDeepLink(offer, context) {
    const base = offer.externalUrl || HOMEPAGE;
    const affId = process.env.GLAMPING_HUB_AFF_ID;
    if (!affId) return base;
    return withTrackingParams(base, { aff_id: affId, sub_id: context.sessionId });
  },
};
