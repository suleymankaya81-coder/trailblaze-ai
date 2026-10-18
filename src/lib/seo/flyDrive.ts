// Pure helpers for /fly-and-drive/{airport-city}-{iata}-{destination} pages.
// Built only from stored destination data — no AI generation per page.

export const FLY_DRIVE_PILOTS = ["yellowstone", "zion", "moab"] as const;
export const SITE = "https://minialife.com";

export type FlyDriveInput = {
  slug: string;
  name: string;
  airportCode: string | null;
  airportName: string | null;
  driveMinutes: number | null;
  driveMiles: number | null;
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** City part of the URL: a parenthetical city wins ("… (Knoxville)"), else the first word. */
export function airportCity(airportName: string): string {
  const paren = airportName.match(/\(([^)]+)\)/);
  const words = airportName.split(/[\s–-]+/);
  // "St. George" / "Ft. Myers": keep the abbreviation with the next word.
  const base = paren ? paren[1] : /\.$/.test(words[0]) ? `${words[0]} ${words[1] ?? ""}` : words[0];
  return slugify(base);
}

/** Canonical slug, or null when the data needed for a useful page is missing. */
export function flyDriveSlug(d: FlyDriveInput): string | null {
  if (!d.airportCode || !d.airportName || d.driveMinutes == null) return null;
  return `${airportCity(d.airportName)}-${d.airportCode.toLowerCase()}-${d.slug}`;
}

/** Extracts the destination slug from "{city}-{iata}-{destination}". */
export function parseFlyDriveSlug(raw: string): { iata: string; destinationSlug: string } | null {
  const m = raw.toLowerCase().match(/^(?:[a-z0-9]+-)*?([a-z]{3})-([a-z0-9-]+)$/);
  if (!m) return null;
  // Try every 3-letter segment from the left so city names with dashes still parse.
  const parts = raw.toLowerCase().split("-");
  for (let i = 1; i < parts.length - 1; i++) {
    if (/^[a-z]{3}$/.test(parts[i])) return { iata: parts[i], destinationSlug: parts.slice(i + 1).join("-") };
  }
  return null;
}

export function formatDriveShort(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
}

export type Faq = { q: string; a: string };

export function flyDriveFaqs(d: FlyDriveInput & { permitHeadline: string | null; permitLevel: string | null }): Faq[] {
  if (!d.airportCode || !d.airportName || d.driveMinutes == null) return [];
  const miles = d.driveMiles != null ? ` (about ${Math.round(d.driveMiles)} miles)` : "";
  const permit =
    d.permitLevel === "high"
      ? `Yes, plan ahead. ${d.permitHeadline ? `${d.permitHeadline}. ` : ""}Check the official park site before booking flights.`
      : d.permitLevel === "moderate"
        ? `Usually no entry permit, but campsites and stays near ${d.name} fill early in peak season.`
        : `Usually not. Booking your first night a little ahead is still the safest move.`;
  return [
    { q: `What is the closest airport to ${d.name}?`, a: `${d.airportName} (${d.airportCode}) is the nearest commercial airport we route from.` },
    { q: `How long is the drive from ${d.airportCode} to ${d.name}?`, a: `Roughly ${formatDriveShort(d.driveMinutes)}${miles} by car, without stops. Times are estimates.` },
    { q: `Do I need a reservation to visit ${d.name}?`, a: permit },
  ];
}

export function flyDriveJsonLd(d: FlyDriveInput & { heroImage: string; faqs: Faq[] }, url: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        name: `Fly into ${d.airportCode}, drive to ${d.name}`,
        url,
        ...(d.heroImage.startsWith("https://") ? { image: d.heroImage } : {}),
        itinerary: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: [
            { "@type": "ListItem", position: 1, item: { "@type": "Airport", name: d.airportName, iataCode: d.airportCode } },
            { "@type": "ListItem", position: 2, item: { "@type": "TouristDestination", name: d.name, url: `${SITE}/destinations/${d.slug}` } },
          ],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: d.name, item: `${SITE}/destinations/${d.slug}` },
          { "@type": "ListItem", position: 3, name: "Fly & Drive", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: d.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}
