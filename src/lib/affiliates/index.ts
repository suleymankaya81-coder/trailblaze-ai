import type { AffiliateAdapter } from "./types";
import { hipcampAdapter } from "./hipcamp";
import { glampingHubAdapter } from "./glamping_hub";
import { arriveOutdoorsAdapter } from "./arrive_outdoors";
import { reiAdapter } from "./rei";
import { viatorAdapter } from "./viator";

export type { AffiliateAdapter, AffiliateContext, AffiliateOffer } from "./types";

const adapters: Record<string, AffiliateAdapter> = {
  hipcamp: hipcampAdapter,
  glamping_hub: glampingHubAdapter,
  arrive_outdoors: arriveOutdoorsAdapter,
  rei: reiAdapter,
  viator: viatorAdapter,
};

// Unknown/missing partner: pass the offer's own external_url through
// untouched rather than breaking the button.
const fallbackAdapter: AffiliateAdapter = {
  partner: "unknown",
  buildDeepLink(offer) {
    return offer.externalUrl ?? "";
  },
};

export function getAffiliateAdapter(partner: string | null): AffiliateAdapter {
  if (!partner) return fallbackAdapter;
  return adapters[partner] ?? fallbackAdapter;
}
