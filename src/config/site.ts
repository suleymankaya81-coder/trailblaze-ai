/**
 * Single source of truth for the public site identity.
 * Change these values on migration day (e.g. to wildparkroutes.com); every
 * canonical, sitemap, RSS, hreflang, breadcrumb and JSON-LD URL follows.
 */
// Migration switch: set MIGRATED = true once wildparkroutes.com is connected and primary.
export const MIGRATED = false;
export const LEGACY_ORIGIN = "https://minialife.com";
export const NEW_ORIGIN = "https://wildparkroutes.com";
export const SITE_ORIGIN = MIGRATED ? NEW_ORIGIN : LEGACY_ORIGIN;
/** Hosts that permanently redirect to SITE_ORIGIN (same path). The authority domain also maps its old pages. */
export const AUTHORITY_HOSTS = ["world-national-parks.net", "www.world-national-parks.net"];
export const REDIRECT_HOSTS = [...AUTHORITY_HOSTS];
/** After migration the old domain only forwards pages that still exist; everything else gets 410 there and never reaches the new domain. */
export const LEGACY_HOSTS = MIGRATED ? ["minialife.com", "www.minialife.com"] : [];
export const SITE_DOMAIN = new URL(SITE_ORIGIN).host;
export const BRAND_NAME = "MiniaLife";
export const CONTACT_EMAIL = "info@minialife.com";

/** Absolute URL for a site path ("/destinations/zion" → "https://…/destinations/zion"). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
