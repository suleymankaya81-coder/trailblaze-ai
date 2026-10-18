// Pure helpers for the Phase B guide families:
//   /no-reservation/{destination}, /road-trips/{loop}, /rv-camping/{destination}
// Built only from stored destination data and the reviewed loops file — no AI per page.
import loops from "@/data/loops.json";
import { getDestinationAnswers } from "@/lib/data/destinationAnswers";
import { SITE, formatDriveShort, type Faq } from "@/lib/seo/flyDrive";

export type GuideDest = {
  slug: string;
  name: string;
  airportCode: string | null;
  airportName: string | null;
  driveMinutes: number | null;
  permitLevel: "high" | "moderate" | "none" | null;
  permitNote: string | null;
  permitHeadline: string | null;
  campingScore: number | null;
  bestSeason: string | null;
};

/** Pilot pages stay noindex and out of sitemaps until the design is approved. */
export const PILOT = {
  noReservation: ["yellowstone", "zion", "moab"],
  rvCamping: ["yellowstone", "zion", "moab"],
  loops: loops.map((l) => l.slug),
} as const;

export const RV_MIN_CAMPING_SCORE = 7;
/** Straight-line cap between consecutive loop stops (~5 h of driving). */
export const LOOP_MAX_LEG_MILES = 250;

export function reservationNote(d: GuideDest): string | null {
  return getDestinationAnswers(d.slug)?.reservation.note ?? d.permitNote ?? null;
}

/** Only destinations whose stored permit level says booking matters, with a real note. */
export function isNoReservationEligible(d: GuideDest): boolean {
  return (d.permitLevel === "high" || d.permitLevel === "moderate") && !!reservationNote(d);
}

export function isRvEligible(d: GuideDest): boolean {
  return (d.campingScore ?? 0) >= RV_MIN_CAMPING_SCORE && !!d.airportCode && !!d.airportName && d.driveMinutes != null;
}

export function noReservationFaqs(d: GuideDest): Faq[] {
  const note = reservationNote(d);
  if (!note) return [];
  const faqs: Faq[] = [
    { q: `Do I need a reservation to visit ${d.name}?`, a: note },
    {
      q: `What if I couldn't get a reservation for ${d.name}?`,
      a: `Check the official source for entry windows outside reserved hours and last-minute releases, plan your first day around the timing tips on this page, or switch a day to a nearby place that does not require an entry booking.`,
    },
  ];
  if (d.airportCode && d.driveMinutes != null)
    faqs.push({ q: `How far is ${d.name} from the airport?`, a: `${d.airportName} (${d.airportCode}) is about ${formatDriveShort(d.driveMinutes)} away by car, without stops.` });
  return faqs;
}

export function rvFaqs(d: GuideDest): Faq[] {
  if (!isRvEligible(d)) return [];
  const note = reservationNote(d);
  return [
    { q: `Can I take an RV to ${d.name}?`, a: `Yes, ${d.name} is a good fit for camping trips. Check vehicle length limits on park roads and campgrounds before you book, and plan fuel stops on remote stretches.` },
    { q: `Where do I pick up an RV for ${d.name}?`, a: `The nearest airport is ${d.airportName} (${d.airportCode}), about ${formatDriveShort(d.driveMinutes!)} away by car. Rental depots are usually in larger cities, so compare pick-up points before booking flights.` },
    { q: `Do campgrounds near ${d.name} need reservations?`, a: note ?? `Popular campgrounds fill early in peak season. Book park campgrounds on the official site and private RV parks through the partners on this page.` },
  ];
}

// ---------- Loops ----------
export type Loop = (typeof loops)[number];
export const LOOPS: Loop[] = loops;
export const getLoop = (slug: string) => LOOPS.find((l) => l.slug === slug) ?? null;

export function haversineMiles(a: [number, number], b: [number, number]): number {
  const R = 3958.8;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type LoopStop = { slug: string; name: string; lat: number; lng: number; heroImage: string; tripDurationDays: string | null; permitLevel: GuideDest["permitLevel"]; permitHeadline: string | null };

/** Valid only with 3+ stops, all coordinates present and no leg over the cap. */
export function validateLoop(stops: LoopStop[]): boolean {
  if (stops.length < 3) return false;
  for (let i = 1; i < stops.length; i++)
    if (haversineMiles([stops[i - 1].lng, stops[i - 1].lat], [stops[i].lng, stops[i].lat]) > LOOP_MAX_LEG_MILES) return false;
  return true;
}

/** Suggested days per stop: the lower bound of a stored "3–5 days" range, default 2. */
export function suggestedDays(raw: string | null): number {
  const n = raw?.match(/\d+/)?.[0];
  return n ? Math.max(1, Number(n)) : 2;
}

export function loopFaqs(loop: Loop, stops: LoopStop[]): Faq[] {
  const days = stops.reduce((s, x) => s + suggestedDays(x.tripDurationDays), 0);
  const booking = stops.filter((s) => s.permitLevel === "high" || s.permitLevel === "moderate").map((s) => s.name);
  return [
    { q: `How many days do I need for the ${loop.title}?`, a: `Plan about ${days} days to give each of the ${stops.length} stops its suggested minimum time, plus extra if you add rest days.` },
    { q: `Which order should I visit the stops in?`, a: `${stops.map((s) => s.name).join(", then ")}. The order keeps each leg as short as possible.` },
    {
      q: `Do any stops on this loop need reservations?`,
      a: booking.length ? `Check booking rules early for ${booking.join(", ")}. Each stop's guide links to the official source.` : `None of the stops is marked as needing an entry reservation, but campgrounds and lodges still fill early in peak season.`,
    },
  ];
}

// ---------- JSON-LD ----------
const breadcrumb = (items: [string, string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
});
const faqPage = (faqs: Faq[]) => ({
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export function destGuideJsonLd(opts: { name: string; slug: string; heroImage: string; faqs: Faq[]; url: string; label: string; title: string }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: opts.title, url: opts.url, about: { "@type": "TouristDestination", name: opts.name, url: `${SITE}/destinations/${opts.slug}` }, ...(opts.heroImage.startsWith("https://") ? { image: opts.heroImage } : {}) },
      breadcrumb([["Home", SITE], [opts.name, `${SITE}/destinations/${opts.slug}`], [opts.label, opts.url]]),
      faqPage(opts.faqs),
    ],
  };
}

export function loopJsonLd(loop: Loop, stops: LoopStop[], faqs: Faq[], url: string) {
  const img = stops[0]?.heroImage;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        name: loop.title,
        description: loop.intro,
        url,
        ...(img?.startsWith("https://") ? { image: img } : {}),
        itinerary: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: stops.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "TouristDestination", name: s.name, url: `${SITE}/destinations/${s.slug}` } })),
        },
      },
      breadcrumb([["Home", SITE], ["Road trips", `${SITE}/road-trips/${loop.slug}`], [loop.title, url]]),
      faqPage(faqs),
    ],
  };
}

export const jsonLdScript = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
