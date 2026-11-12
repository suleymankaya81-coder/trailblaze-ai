import { STATIC_TRANSLATED_PATHS } from "@/lib/seo/hreflang";
import { localizePath, type Locale } from "./locales";
import { canonicalPath } from "@/lib/routes/paths";

/** Page families that have a German route for every slug the English route serves. */
const SLUG_FAMILIES = ["destinations", "trip-builder", "road-trips", "corridors", "fly-and-drive", "no-reservation", "rv-camping"];

/** True when an English path has a version in another language (search guides and others do not). */
export function hasTranslatedPage(path: string): boolean {
  const clean = path.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if ((STATIC_TRANSLATED_PATHS as readonly string[]).includes(clean)) return true;
  const parts = clean.split("/").filter(Boolean);
  // Country, region and destination pages (/destinations/us[/utah[/zion]]) all have German versions; guides do not.
  if (parts[0] === "destinations") return parts.length >= 2 && parts.length <= 4;
  return parts.length === 2 && SLUG_FAMILIES.includes(parts[0]);
}

/** Fill "$param" segments: ("/destinations/$slug", {slug:"zion"}) → "/destinations/zion". */
export function fillParams(to: string, params?: Record<string, unknown>): string {
  return to.replace(/\$([A-Za-z0-9_]+)/g, (m, k) => (params && params[k] != null ? String(params[k]) : m));
}

/** Link target for the current language: canonical address, localized only when that page exists. */
export function localTarget(rawPath: string, locale: Locale): string | null {
  const path = rawPath.includes("$") ? rawPath : canonicalPath(rawPath);
  const moved = path !== rawPath ? path : null;
  if (locale === "en" || !path.startsWith("/") || path.startsWith(`/${locale}/`) || path === `/${locale}`) return moved;
  if (path.includes("$") || !hasTranslatedPage(path)) return moved;
  const [base, rest = ""] = path.split(/(?=[?#])/);
  return localizePath(base, locale) + rest;
}
