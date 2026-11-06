import { DEFAULT_LOCALE, LOCALES, localizePath, type Locale } from "@/lib/i18n/locales";

const BASE = "https://minialife.com";
const abs = (p: string) => (p === "/" ? `${BASE}/` : `${BASE}${p}`);

/**
 * hreflang links for one page. `path` is the English path; `available` lists
 * locales with a published version. Returns nothing unless 2+ versions exist,
 * so untranslated pages never advertise a missing German URL.
 */
export function hreflangLinks(path: string, available: Locale[]) {
  const langs = LOCALES.filter((l) => available.includes(l.code));
  if (langs.length < 2) return [];
  return [
    ...langs.map((l) => ({ rel: "alternate", hrefLang: l.hreflang, href: abs(localizePath(path, l.code)) })),
    { rel: "alternate", hrefLang: "x-default", href: abs(localizePath(path, DEFAULT_LOCALE)) },
  ];
}

/** Pages whose German version always exists (interface-only translation). */
export const STATIC_TRANSLATED_PATHS = ["/", "/destinations", "/road-trips", "/about", "/trip-guides", "/gear", "/fly-and-drive", "/no-reservation", "/rv-camping", "/corridors"] as const;
