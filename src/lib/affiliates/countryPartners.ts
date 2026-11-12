import { airportRentalsLink, motorhomeRepublicLink } from "./webjet";

/** Country eligibility for vehicle, RV and campground partners plus local price formatting. */
export type CountryCode = "us" | "ca";
export type PartnerKind = "rv" | "car" | "campground";

interface CountryPartnerSet { currency: string; numberLocale: string; rv: string[]; car: string[]; campground: string[] }

export const COUNTRY_PARTNERS: Record<CountryCode, CountryPartnerSet> = {
  us: { currency: "USD", numberLocale: "en-US", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: ["roverpass", "campspot", "harvest_hosts"] },
  ca: { currency: "CAD", numberLocale: "en-CA", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
};

export const normalizeCountry = (code?: string | null): CountryCode => (code?.toLowerCase() === "ca" ? "ca" : "us");
export const isCountrySupported = (code?: string | null) => !!code && code.toLowerCase() in COUNTRY_PARTNERS;

export function partnersFor(country: string | null | undefined, kind: PartnerKind): string[] {
  if (!isCountrySupported(country)) return [];
  return COUNTRY_PARTNERS[normalizeCountry(country)][kind];
}

export const isPartnerAvailable = (partner: string, country: string | null | undefined, kind: PartnerKind) =>
  partnersFor(country, kind).includes(partner);

export function countryCurrency(country?: string | null, fallback = "USD"): string {
  return isCountrySupported(country) ? COUNTRY_PARTNERS[normalizeCountry(country)].currency : fallback;
}

export function formatCountryPrice(amount: number, country?: string | null, currency?: string | null): string {
  const c = normalizeCountry(country);
  return new Intl.NumberFormat(COUNTRY_PARTNERS[c].numberLocale, {
    style: "currency", currency: currency || COUNTRY_PARTNERS[c].currency, maximumFractionDigits: 0,
  }).format(amount);
}

/** RV link for a country: Canada uses Motorhome Republic's Canada search (US Black Friday deal stays US-only). */
export function rvLinkFor(country?: string | null, now = Date.now()): string | null {
  if (!isPartnerAvailable("motorhome_republic", country, "rv")) return null;
  return normalizeCountry(country) === "ca" ? motorhomeRepublicLink("/canada/", now) : motorhomeRepublicLink(undefined, now);
}

export function carLinkFor(country?: string | null): string | null {
  return isPartnerAvailable("airport_rentals", country, "car") ? airportRentalsLink() : null;
}
