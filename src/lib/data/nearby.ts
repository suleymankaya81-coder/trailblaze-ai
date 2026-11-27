import nearby from "@/data/nearby.json";

const NEARBY = nearby as unknown as Record<string, [string, number][]>;

/**
 * The (up to) 6 nearest places from stored coordinates: same country first, then other countries
 * within 150 km (built by scripts/content-pipeline/build-nearby.py). Server-side only: import it from
 * server functions/loaders, never from components, so the table is not shipped to the browser.
 */
export function nearbyPlaces(slug: string): { slug: string; km: number }[] {
  return (NEARBY[slug] ?? []).map(([s, km]) => ({ slug: s, km }));
}
