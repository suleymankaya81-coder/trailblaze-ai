import { regionPath, type Locale } from "./paths";
import { mapsUrl } from "./dayRoute";

export type CountryMapPlace = { slug: string; name: string; region: string; lat: number; lng: number; access: string | null };

export function validMapCoordinate(lat: unknown, lng: unknown): boolean {
  return typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function countryMapLinks(country: string, place: CountryMapPlace, locale: Locale = "en") {
  return {
    destination: `${regionPath(country, place.region, locale)}/${place.slug}`,
    maps: validMapCoordinate(place.lat, place.lng) ? mapsUrl([{ name: place.name, lat: place.lat, lng: place.lng, query: place.name }]) : null,
  };
}