import { BRAND_NAME, CONTACT_EMAIL, LOGO_PATH, LOGO_SIZE, ORGANIZATION_SAME_AS, SITE_ORIGIN } from "@/config/site";

/** The one Organization node; every Article publisher/author points here by @id. */
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
export const ORGANIZATION_REF = { "@id": ORGANIZATION_ID } as const;

export function organizationJsonLd(): Record<string, unknown> {
  const logo = `${SITE_ORIGIN}${LOGO_PATH}`;
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: BRAND_NAME,
    url: `${SITE_ORIGIN}/`,
    logo: { "@type": "ImageObject", "@id": `${SITE_ORIGIN}/#logo`, url: logo, contentUrl: logo, width: LOGO_SIZE, height: LOGO_SIZE, caption: BRAND_NAME },
    image: { "@id": `${SITE_ORIGIN}/#logo` },
    email: CONTACT_EMAIL,
    // Only real, configured profiles; never invented.
    ...(ORGANIZATION_SAME_AS.length ? { sameAs: [...ORGANIZATION_SAME_AS] } : {}),
  };
}

/** Site-wide Organization + WebSite schema; follows the brand/origin in config/site.ts. */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      { "@type": "WebSite", "@id": `${SITE_ORIGIN}/#website`, name: BRAND_NAME, url: `${SITE_ORIGIN}/`, publisher: ORGANIZATION_REF, inLanguage: ["en", "de", "fr"],
        potentialAction: { "@type": "SearchAction", target: `${SITE_ORIGIN}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } },
    ],
  };
}
