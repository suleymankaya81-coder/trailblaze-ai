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

import { DE_PATTERNS, DE_PHRASES } from "./phrases.de";
import { createElement, Fragment } from "react";
const PATTERNS: Partial<Record<Locale, [RegExp, string][]>> = { de: DE_PATTERNS };
const PHRASES: Partial<Record<Locale, Record<string, string>>> = { de: DE_PHRASES };

/** Translate a fixed English phrase; falls back to the English text. */
export function tp(locale: Locale, text: string): string {
  const dict = PHRASES[locale];
  if (!dict) return text;
  const hit = dict[text];
  if (hit) return hit;
  for (const [re, out] of PATTERNS[locale] ?? []) if (re.test(text)) return text.replace(re, out);
  return text;
}

export function useTp() {
  const locale = useLocale();
  return (text: string) => tp(locale, text);
}

/** Inline translated phrase: <T>English text</T>. */
export function T({ children }: { children: string }) {
  const locale = useLocale();
  return createElement(Fragment, null, tp(locale, children));
}
