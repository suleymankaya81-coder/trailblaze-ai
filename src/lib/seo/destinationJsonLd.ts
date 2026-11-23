import { SITE_ORIGIN } from "@/config/site";
import { breadcrumbJsonLd, destinationCrumbs, type Crumb } from "./breadcrumbs";
import type { DestinationView } from "@/lib/data/destinations.functions";
import { isNonRoadDestination } from "@/lib/data/destinationAccess";
import { commonsFilePage, creditCreatorEntity, parsePhotoCredit, toAbsoluteImageUrl, type ImageCredit } from "./imageCredit";

function imageObject(url: string, caption: string, credit: ImageCredit | null, placeName?: string): Record<string, unknown> {
  const obj: Record<string, unknown> = { "@type": "ImageObject", contentUrl: url, url, caption, name: caption };
  if (credit) {
    // Person only for an individual's name; organisations and non-names are never emitted as Person.
    const creator = creditCreatorEntity(credit.creator, placeName);
    if (creator) obj.creator = creator;
    obj.creditText = `${credit.creator} / ${credit.license} via ${credit.source ?? "Wikimedia Commons"}`;
    if (credit.licenseUrl) obj.license = credit.licenseUrl;
    const page = credit.sourceUrl ?? commonsFilePage(url);
    if (page) obj.acquireLicensePage = page;
  }
  return obj;
}

type JsonLdLocale = "en" | "de" | "fr";
// Fixed JSON-LD wording per page language; place data itself comes translated from the page.
const WORDS: Record<JsonLdLocale, {
  scenery: string; photo: (n: number) => string; guide: (name: string) => string;
  days: (n: number, name: string) => string; stages: (name: string) => string;
  trip: (name: string) => string; expedition: (name: string) => string; day: string; stage: string;
}> = {
  en: { scenery: "scenery", photo: (n) => `photo ${n}`, guide: (x) => `${x} travel guide`, days: (n, x) => `${n} ${n === 1 ? "day" : "days"} in ${x}`, stages: (x) => `Expedition planning stages for ${x}`,
    trip: (x) => `Suggested sightseeing itinerary for ${x}; not a bookable guided tour.`, expedition: (x) => `Expedition preparation sequence for ${x}; not a three-day sightseeing circuit or bookable tour.`, day: "Day", stage: "Stage" },
  de: { scenery: "Landschaft", photo: (n) => `Foto ${n}`, guide: (x) => `${x}: Reiseführer`, days: (n, x) => `${n} ${n === 1 ? "Tag" : "Tage"} in ${x}`, stages: (x) => `Planungsetappen der Expedition: ${x}`,
    trip: (x) => `Vorgeschlagene Besichtigungsroute für ${x}; keine buchbare geführte Tour.`, expedition: (x) => `Vorbereitungsschritte einer Expedition: ${x}; keine dreitägige Rundreise und keine buchbare Tour.`, day: "Tag", stage: "Etappe" },
  fr: { scenery: "paysage", photo: (n) => `photo ${n}`, guide: (x) => `${x} : guide de voyage`, days: (n, x) => `${x} en ${n} ${n === 1 ? "jour" : "jours"}`, stages: (x) => `Étapes de préparation de l'expédition : ${x}`,
    trip: (x) => `Itinéraire de visite suggéré pour ${x} ; pas une visite guidée réservable.`, expedition: (x) => `Étapes de préparation d'une expédition : ${x} ; ni circuit de trois jours ni visite réservable.`, day: "Jour", stage: "Étape" },
};

export function buildDestinationImages(dest: Pick<DestinationView, "name" | "region" | "heroImage" | "gallery" | "photoCredit">, locale: JsonLdLocale = "en"): Record<string, unknown>[] {
  const w = WORDS[locale];
  const credits = parsePhotoCredit(dest.photoCredit);
  const place = dest.region ? `${dest.name}, ${dest.region}` : dest.name;
  const seen = new Set<string>();
  const out: Record<string, unknown>[] = [];
  const add = (raw: string | undefined, caption: string, credit: ImageCredit | null) => {
    const url = toAbsoluteImageUrl(raw);
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(imageObject(url, caption, credit, dest.name));
  };
  add(dest.heroImage, `${place} — ${w.scenery}`, credits.hero);
  (dest.gallery ?? []).forEach((g, i) => add(g, `${place} — ${w.photo(i + 2)}`, credits.gallery[i] ?? null));
  return out;
}

import type { Faq } from "./flyDrive";

// Describe the visible guide, not unverified live inventory or a bookable tour.
/**
 * opts.locale/crumbs: German and French place pages pass their language and localized breadcrumb
 * trail; `dest` is already overlaid with the stored translation, so names, tagline and stops match
 * the visible page.
 */
export function buildDestinationJsonLd(dest: DestinationView, pageUrl: string, faqs: Faq[] = [], opts: { locale?: JsonLdLocale; crumbs?: Crumb[] } = {}): Record<string, unknown> {
  const locale = opts.locale ?? "en";
  const w = WORDS[locale];
  const destination: Record<string, unknown> = {
    "@type": "TouristDestination",
    "@id": `${pageUrl}#destination`,
    name: dest.name,
    url: pageUrl,
  };
  if (dest.tagline) destination.description = dest.tagline;
  const images = buildDestinationImages(dest, locale);
  if (images.length) destination.image = images;
  if (dest.region) destination.address = dest.region;
  if (dest.lat != null && dest.lng != null)
    destination.geo = { "@type": "GeoCoordinates", latitude: dest.lat, longitude: dest.lng };
  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: w.guide(dest.name),
    about: { "@id": `${pageUrl}#destination` },
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    inLanguage: locale,
  };
  const graph: Record<string, unknown>[] = [destination, webPage, breadcrumbJsonLd(opts.crumbs ?? destinationCrumbs(dest))];
  const plan = dest.travelPlan;
  const nonRoad = isNonRoadDestination(dest.slug, dest.accessType);
  if (plan) {
    graph.push({
      "@type": "TouristTrip",
      "@id": `${pageUrl}#trip`,
      name: nonRoad ? w.stages(dest.name) : w.days(plan.days.length, dest.name),
      url: `${pageUrl}#flow`,
      description: nonRoad ? w.expedition(dest.name) : w.trip(dest.name),
      itinerary: {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: plan.days.reduce((count, day) => count + day.stops.length, 0),
        itemListElement: plan.days.flatMap((day, dayIndex) => day.stops.map((stop, stopIndex) => ({
          "@type": "ListItem",
          position: plan.days.slice(0, dayIndex).reduce((count, previous) => count + previous.stops.length, 0) + stopIndex + 1,
          name: `${nonRoad ? w.stage : w.day} ${dayIndex + 1}: ${day.title}`,
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
