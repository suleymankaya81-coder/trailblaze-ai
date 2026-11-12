import { BRAND_NAME, CONTACT_EMAIL, SITE_ORIGIN } from "@/config/site";

/** Site-wide Organization + WebSite schema; follows the brand/origin in config/site.ts. */
export function siteJsonLd() {
  const org = `${SITE_ORIGIN}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": org, name: BRAND_NAME, url: `${SITE_ORIGIN}/`, logo: `${SITE_ORIGIN}/favicon.png`, email: CONTACT_EMAIL },
      { "@type": "WebSite", "@id": `${SITE_ORIGIN}/#website`, name: BRAND_NAME, url: `${SITE_ORIGIN}/`, publisher: { "@id": org }, inLanguage: ["en", "de"],
        potentialAction: { "@type": "SearchAction", target: `${SITE_ORIGIN}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } },
    ],
  };
}
