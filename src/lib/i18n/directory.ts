import { destinationGeo } from "@/lib/routes/paths";

export const TRANSLATED_PAGE_SIZE = 24;

export function selectTranslatedPlaces<T extends { slug: string; name: string }>(all: T[], country: string, query: string, requestedPage: number) {
  const counts: Record<string, number> = {};
  for (const place of all) {
    const code = destinationGeo(place.slug)?.country;
    if (code) counts[code] = (counts[code] ?? 0) + 1;
  }
  const q = query.trim().toLocaleLowerCase("fr");
  const filtered = all.filter(p => (!country || destinationGeo(p.slug)?.country === country) && (!q || p.name.toLocaleLowerCase("fr").includes(q)));
  const pages = Math.max(1, Math.ceil(filtered.length / TRANSLATED_PAGE_SIZE));
  const page = Math.max(1, Math.min(requestedPage, pages));
  return { places: filtered.slice((page - 1) * TRANSLATED_PAGE_SIZE, page * TRANSLATED_PAGE_SIZE), total: filtered.length, counts, page, pages };
}