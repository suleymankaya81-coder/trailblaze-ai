// Central language registry. Adding a language = one entry here + a dictionary
// file in ./dict + a one-time content translation run.
export const DEFAULT_LOCALE = "en" as const;

export const LOCALES = [
  { code: "en", label: "English", short: "EN", hreflang: "en", prefix: "" },
  { code: "de", label: "Deutsch", short: "DE", hreflang: "de", prefix: "/de" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const LOCALE_CODES = LOCALES.map((l) => l.code) as Locale[];

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALE_CODES as string[]).includes(value);
}

/** Locale from a URL path: "/de/..." → "de", everything else → "en". */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/")[1];
  return isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE;
}

/** "/destinations/zion" + "de" → "/de/destinations/zion". English paths stay unprefixed. */
export function localizePath(path: string, locale: Locale): string {
  const prefix = LOCALES.find((l) => l.code === locale)?.prefix ?? "";
  if (!prefix) return path;
  return path === "/" ? prefix : `${prefix}${path}`;
}

/** Inverse of localizePath: "/de/destinations" → "/destinations". */
export function stripLocale(pathname: string): string {
  const loc = localeFromPath(pathname);
  if (loc === DEFAULT_LOCALE) return pathname;
  const rest = pathname.slice(loc.length + 1);
  return rest === "" ? "/" : rest;
}
