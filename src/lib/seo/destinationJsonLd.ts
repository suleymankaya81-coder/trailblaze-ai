import type { DestinationView, OfferView } from "@/lib/data/destinations.functions";

function offerToJsonLd(offer: OfferView): Record<string, unknown> {
  const node: Record<string, unknown> = {
    "@type": "Offer",
    name: offer.title,
  };
  if (offer.subcategory) node.category = offer.subcategory;
  if (offer.priceValue != null) {
    node.price = offer.priceValue;
    node.priceCurrency = "USD";
  }
  if (offer.externalUrl) {
    node.url = offer.externalUrl;
    node.availability = "https://schema.org/InStock";
  } else {
    node.availability = "https://schema.org/PreOrder";
  }
  const description = offer.whyRecommended ?? offer.description;
  if (description) node.description = description;
  return node;
}

// TouristDestination per schema.org, with a bolted-on `offers` array (stays,
// rentals, activities) — not a strict schema.org property on Place, but a
// widely tolerated pattern that both classic SEO and AI answer engines use
// to ground citations in the actual bookable offers on the page.
export function buildDestinationJsonLd(dest: DestinationView, pageUrl: string): Record<string, unknown> {
  const offers = [...dest.stays, ...dest.rentals, ...dest.activities].map(offerToJsonLd);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: dest.name,
    url: pageUrl,
  };
  if (dest.tagline) jsonLd.description = dest.tagline;
  if (dest.heroImage) jsonLd.image = dest.heroImage;
  if (dest.region) jsonLd.address = dest.region;
  if (offers.length > 0) jsonLd.offers = offers;

  return jsonLd;
}
