export type AffiliateOffer = {
  id: string;
  externalUrl: string | null;
  partner: string | null;
};

export type AffiliateContext = {
  sessionId: string;
  destinationSlug: string;
};

export interface AffiliateAdapter {
  partner: string;
  buildDeepLink(offer: AffiliateOffer, context: AffiliateContext): string;
}
