import type { AffiliateAdapter } from "./types";
import { withTrackingParams } from "./util";

const HOMEPAGE = "https://arriveoutdoors.com";

// No affiliate program approved yet — aff_id/sub_id param names are
// placeholders and should be swapped for Arrive Outdoors' real partner-link
// spec once the program is live.
export const arriveOutdoorsAdapter: AffiliateAdapter = {
  partner: "arrive_outdoors",
  buildDeepLink(offer, context) {
    const base = offer.externalUrl || HOMEPAGE;
    const affId = process.env.ARRIVE_OUTDOORS_AFF_ID;
    if (!affId) return base;
    return withTrackingParams(base, { aff_id: affId, sub_id: context.sessionId });
  },
};
