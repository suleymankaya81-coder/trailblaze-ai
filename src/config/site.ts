/**
 * Single source of truth for the public site identity.
 * Change these values on migration day (e.g. to wildparkroutes.com); every
 * canonical, sitemap, RSS, hreflang, breadcrumb and JSON-LD URL follows.
 */
export const SITE_ORIGIN = "https://minialife.com";
export const SITE_DOMAIN = new URL(SITE_ORIGIN).host;
export const BRAND_NAME = "MiniaLife";
export const CONTACT_EMAIL = "info@minialife.com";

/** Absolute URL for a site path ("/destinations/zion" → "https://…/destinations/zion"). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
