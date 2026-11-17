import { airportRentalsLink, motorhomeRepublicLink } from "./webjet";

/** Country eligibility for vehicle, RV and campground partners plus local price formatting. */
export type CountryCode = "us" | "ca" | "gb" | "de" | "at" | "ch" | "it" | "es" | "fr" | "pt" | "gr";
export type PartnerKind = "rv" | "car" | "campground";

interface CountryPartnerSet { currency: string; numberLocale: string; rv: string[]; car: string[]; campground: string[] }

export const COUNTRY_PARTNERS: Record<CountryCode, CountryPartnerSet> = {
  us: { currency: "USD", numberLocale: "en-US", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: ["roverpass", "campspot", "harvest_hosts"] },
  ca: { currency: "CAD", numberLocale: "en-CA", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  gb: { currency: "GBP", numberLocale: "en-GB", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  de: { currency: "EUR", numberLocale: "de-DE", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  at: { currency: "EUR", numberLocale: "de-AT", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  ch: { currency: "CHF", numberLocale: "de-CH", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  it: { currency: "EUR", numberLocale: "it-IT", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  es: { currency: "EUR", numberLocale: "es-ES", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  fr: { currency: "EUR", numberLocale: "fr-FR", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  pt: { currency: "EUR", numberLocale: "pt-PT", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  gr: { currency: "EUR", numberLocale: "el-GR", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
};

export function normalizeCountry(code?: string | null): CountryCode {
  const c = code?.toLowerCase();
  return c && c in COUNTRY_PARTNERS ? (c as CountryCode) : "us";
}
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
  const c = normalizeCountry(country);
  if (c === "ca") return motorhomeRepublicLink("/canada/", now);
  if (c === "gb") return motorhomeRepublicLink("/united-kingdom/", now);
  if (c === "de") return motorhomeRepublicLink("/germany/", now);
  if (c === "at") return motorhomeRepublicLink("/austria/", now);
  if (c === "ch") return motorhomeRepublicLink("/switzerland/", now);
  if (c === "it") return motorhomeRepublicLink("/italy/", now);
  if (c === "es") return motorhomeRepublicLink("/spain/", now);
  // NOTE: these three path segments are unverified guesses by analogy with /italy/ and /spain/ — confirm against
  // the live Motorhome Republic site before relying on them; see owner checklist in the fr/pt/gr report.
  if (c === "fr") return motorhomeRepublicLink("/france/", now);
  if (c === "pt") return motorhomeRepublicLink("/portugal/", now);
  if (c === "gr") return motorhomeRepublicLink("/greece/", now);
  return motorhomeRepublicLink(undefined, now);
}

export function carLinkFor(country?: string | null): string | null {
  return isPartnerAvailable("airport_rentals", country, "car") ? airportRentalsLink() : null;
}
