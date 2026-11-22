import { ORGANIZATION_REF } from "./siteJsonLd";

export type GuideArticleInput = {
  headline: string;
  description: string;
  url: string;
  image?: string | null;
  sections: { heading: string }[];
  /** Database dates only (seo_landing_pages.published_at/created_at/updated_at); never invented. */
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  /** The place the guide is about (its destination page). */
  place?: { name: string; url: string } | null;
};

/** A parseable timestamp as ISO 8601, or null (unknown dates are omitted, never guessed). */
export function realDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

/** Published = published_at, else the row's created_at; modified = updated_at, never earlier than published. */
export function guideDates(g: Pick<GuideArticleInput, "publishedAt" | "createdAt" | "updatedAt">): { datePublished: string | null; dateModified: string | null } {
  const datePublished = realDate(g.publishedAt) ?? realDate(g.createdAt);
  let dateModified = realDate(g.updatedAt);
  if (dateModified && datePublished && dateModified < datePublished) dateModified = datePublished;
  return { datePublished, dateModified };
}

/** "November 22, 2026" — fixed locale and UTC so server and browser render the same text. */
export function formatUpdated(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

/** Article JSON-LD for place guides (best time, itinerary, glamping, things to do). */
export function guideArticleJsonLd(g: GuideArticleInput): Record<string, unknown> {
  const { datePublished, dateModified } = guideDates(g);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.headline,
    description: g.description,
    ...(g.image ? { image: g.image } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    mainEntityOfPage: g.url,
    // The single site Organization (siteJsonLd), referenced by @id: no second, bare Organization.
    publisher: ORGANIZATION_REF,
    author: ORGANIZATION_REF,
    ...(g.place
      ? { about: { "@type": "TouristDestination", "@id": `${g.place.url}#destination`, name: g.place.name, url: g.place.url } }
      : {}),
    articleSection: g.sections.map((s) => s.heading),
  };
}
