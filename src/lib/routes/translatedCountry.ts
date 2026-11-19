import type { CountryMapPlace } from "./countryMap";

/** Keep German country navigation within published German destinations. */
export function translatedCountryPlaces(places: CountryMapPlace[], translated: string[]): CountryMapPlace[] {
  const published = new Set(translated);
  return places.filter(place => published.has(place.slug));
}