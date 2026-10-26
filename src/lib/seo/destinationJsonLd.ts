import type { DestinationView } from "@/lib/data/destinations.functions";
import { commonsFilePage, parsePhotoCredit, toAbsoluteImageUrl, type ImageCredit } from "./imageCredit";

function imageObject(url: string, caption: string, credit: ImageCredit | null): Record<string, unknown> {
  const obj: Record<string, unknown> = { "@type": "ImageObject", contentUrl: url, url, caption, name: caption };
  if (credit) {
    obj.creator = { "@type": "Person", name: credit.creator };
    obj.creditText = `${credit.creator} / ${credit.license} via ${credit.source ?? "Wikimedia Commons"}`;
    if (credit.licenseUrl) obj.license = credit.licenseUrl;
    const page = credit.sourceUrl ?? commonsFilePage(url);
    if (page) obj.acquireLicensePage = page;
  }
  return obj;
}

export function buildDestinationImages(dest: Pick<DestinationView, "name" | "region" | "heroImage" | "gallery" | "photoCredit">): Record<string, unknown>[] {
  const credits = parsePhotoCredit(dest.photoCredit);
  const place = dest.region ? `${dest.name}, ${dest.region}` : dest.name;
  const seen = new Set<string>();
  const out: Record<string, unknown>[] = [];
  const add = (raw: string | undefined, caption: string, credit: ImageCredit | null) => {
    const url = toAbsoluteImageUrl(raw);
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(imageObject(url, caption, credit));
  };
  add(dest.heroImage, `${place} — scenery`, credits.hero);
  (dest.gallery ?? []).forEach((g, i) => add(g, `${place} — photo ${i + 2}`, credits.gallery[i] ?? null));
  return out;
}

import type { Faq } from "./flyDrive";

// Describe the visible guide, not unverified live inventory or a bookable tour.
export function buildDestinationJsonLd(dest: DestinationView, pageUrl: string, faqs: Faq[] = []): Record<string, unknown> {
  const destination: Record<string, unknown> = {
    "@type": "TouristDestination",
    "@id": `${pageUrl}#destination`,
    name: dest.name,
    url: pageUrl,
  };
  if (dest.tagline) destination.description = dest.tagline;
  const images = buildDestinationImages(dest);
  if (images.length) destination.image = images;
  if (dest.region) destination.address = dest.region;
  if (dest.lat != null && dest.lng != null)
    destination.geo = { "@type": "GeoCoordinates", latitude: dest.lat, longitude: dest.lng };
  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: `${dest.name} travel guide`,
    about: { "@id": `${pageUrl}#destination` },
    publisher: { "@type": "Organization", name: "MiniaLife", url: "https://minialife.com/" },
    inLanguage: "en",
  };
  const graph: Record<string, unknown>[] = [destination, webPage, {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "MiniaLife", item: "https://minialife.com/" },
      { "@type": "ListItem", position: 2, name: "Destinations", item: "https://minialife.com/destinations" },
      { "@type": "ListItem", position: 3, name: dest.name, item: pageUrl },
    ],
  }];
  const plan = dest.travelPlan;
  if (plan) {
    graph.push({
      "@type": "TouristTrip",
      "@id": `${pageUrl}#trip`,
      name: `${plan.days.length} days in ${dest.name}`,
      url: `${pageUrl}#flow`,
      description: `Suggested sightseeing itinerary for ${dest.name}; not a bookable guided tour.`,
      itinerary: {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: plan.days.reduce((count, day) => count + day.stops.length, 0),
        itemListElement: plan.days.flatMap((day, dayIndex) => day.stops.map((stop, stopIndex) => ({
          "@type": "ListItem",
          position: plan.days.slice(0, dayIndex).reduce((count, previous) => count + previous.stops.length, 0) + stopIndex + 1,
          name: `Day ${dayIndex + 1}: ${day.title}`,
          item: { "@type": "TouristAttraction", name: stop.name, description: stop.detail },
        }))),
      },
    });
  }
  // FAQPage mirrors the visible "Quick answers" section exactly.
  if (faqs.length)
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  return { "@context": "https://schema.org", "@graph": graph };
}
