import { useRouterState } from "@tanstack/react-router";
import { en, type DictKey } from "./dict/en";
import { de } from "./dict/de";
import { localeFromPath, type Locale } from "./locales";

export * from "./locales";
export type { DictKey } from "./dict/en";

const DICTS: Record<Locale, Partial<Record<DictKey, string>>> = { en, de };

/** SSR-safe lookup; usable in head(). Falls back to English for missing keys. */
export function t(locale: Locale, key: DictKey): string {
  return DICTS[locale]?.[key] ?? en[key];
}

export function useLocale(): Locale {
  return useRouterState({ select: (s) => localeFromPath(s.location.pathname) });
}

export function useT() {
  const locale = useLocale();
  return (key: DictKey) => t(locale, key);
}
