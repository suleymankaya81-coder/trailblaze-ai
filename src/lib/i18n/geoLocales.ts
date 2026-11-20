import { getTranslatedDestinationSlugs } from "@/lib/data/geo.de.functions";
import type { Locale } from "./locales";

const TRANSLATED: Exclude<Locale, "en">[] = ["de", "fr"];

/** Languages in which a country/region directory has at least one published place (English always). */
export async function directoryLocales(slugs: string[]): Promise<Locale[]> {
  const wanted = new Set(slugs);
  const lists = await Promise.all(TRANSLATED.map((locale) => getTranslatedDestinationSlugs({ data: { locale } }).catch(() => [] as string[])));
  return ["en", ...TRANSLATED.filter((_, i) => lists[i].some((s) => wanted.has(s)))];
}
