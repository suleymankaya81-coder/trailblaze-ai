import { ORGANIZATION_REF } from "./siteJsonLd";

export type GuideArticleInput = {
  headline: string;
  description: string;
  url: string;
  image?: string | null;
  sections: { heading: string }[];
  dateModified?: string | null;
};

/** Article JSON-LD for place guides (best time, itinerary, glamping, things to do). */
export function guideArticleJsonLd(g: GuideArticleInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.headline,
    description: g.description,
    ...(g.image ? { image: g.image } : {}),
    ...(g.dateModified ? { dateModified: g.dateModified } : {}),
    mainEntityOfPage: g.url,
    // The single site Organization (siteJsonLd), referenced by @id: no second, bare Organization.
    publisher: ORGANIZATION_REF,
    author: ORGANIZATION_REF,
    articleSection: g.sections.map((s) => s.heading),
  };
}
