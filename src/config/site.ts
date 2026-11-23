/**
 * Single source of truth for the public site identity.
 * Change these values on migration day (e.g. to wildparkroutes.com); every
 * canonical, sitemap, RSS, hreflang, breadcrumb and JSON-LD URL follows.
 */
// Migration switch: set MIGRATED = true once wildparkroutes.com is connected and primary.
export const MIGRATED = true;
export const LEGACY_ORIGIN = "https://minialife.com";
export const NEW_ORIGIN = "https://wildparkroutes.com";
export const SITE_ORIGIN = MIGRATED ? NEW_ORIGIN : LEGACY_ORIGIN;
/** Hosts that permanently redirect to SITE_ORIGIN (same path). The authority domain also maps its old pages. */
export const AUTHORITY_HOSTS = ["world-national-parks.net", "www.world-national-parks.net"];
export const REDIRECT_HOSTS: string[] = [];
/** After migration the old domain only forwards pages that still exist; everything else gets 410 there and never reaches the new domain. */
export const LEGACY_HOSTS = MIGRATED ? ["minialife.com", "www.minialife.com", ...AUTHORITY_HOSTS] : [];
export const SITE_DOMAIN = new URL(SITE_ORIGIN).host;
export const BRAND_NAME = "WildParkRoutes";
/**
 * Public contact address (Organization schema, contact and about pages).
 * PLACEHOLDER until the owner confirms the final address.
 */
export const CONTACT_EMAIL = "info@wildparkroutes.com";
/** Square brand logo (rendered from public/favicon.svg), at least 112×112 px as Google requires. */
export const LOGO_PATH = "/logo-512.png";
export const LOGO_SIZE = 512;
/**
 * Official profiles of WildParkRoutes for Organization.sameAs. List ONLY profiles that really exist
 * (confirmed by the owner); never add guessed profiles.
 */
export const ORGANIZATION_SAME_AS: readonly string[] = ["https://www.pinterest.com/minialife/"];

/** Absolute URL for a site path ("/destinations/zion" → "https://…/destinations/zion"). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Guide dates (seo_landing_pages.published_at/created_at/updated_at) are bulk timestamps today:
 * hundreds of guides share the same day from batch scripts, so they are not real content dates.
 * While false, guide pages show no "Last updated" line and their Article JSON-LD has no
 * datePublished/dateModified. Set to true only once those columns record real editorial changes.
 */
export const GUIDE_DATES_TRUSTED = false;
