import { LEGACY_ORIGIN, SITE_ORIGIN } from "@/config/site";

const LEGACY = new Set([new URL(LEGACY_ORIGIN).host, `www.${new URL(LEGACY_ORIGIN).host}`]);

/**
 * Stored URLs written before the domain move (e.g. hero_image =
 * "https://minialife.com/__l5e/assets-v1/…") point at the old domain. The same assets are served on
 * the current origin, so rewrite the host to SITE_ORIGIN; every other URL is returned unchanged.
 */
export function toCurrentOrigin<T extends string | null | undefined>(url: T): T {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!LEGACY.has(u.host)) return url;
    return `${SITE_ORIGIN}${u.pathname}${u.search}${u.hash}` as T;
  } catch {
    return url;
  }
}
