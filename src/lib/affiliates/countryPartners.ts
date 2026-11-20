import { airportRentalsLink, motorhomeRepublicLink } from "./webjet";

/** Country eligibility for vehicle, RV and campground partners plus local price formatting. */
export type CountryCode = "us" | "ca" | "gb" | "de" | "at" | "ch" | "it" | "es" | "fr" | "pt" | "gr" | "no" | "is" | "se" | "fi" | "dk" | "nl" | "nz";
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
  no: { currency: "NOK", numberLocale: "nb-NO", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  is: { currency: "ISK", numberLocale: "is-IS", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  se: { currency: "SEK", numberLocale: "sv-SE", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  fi: { currency: "EUR", numberLocale: "fi-FI", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  dk: { currency: "DKK", numberLocale: "da-DK", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  nl: { currency: "EUR", numberLocale: "nl-NL", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
  nz: { currency: "NZD", numberLocale: "en-NZ", rv: ["motorhome_republic"], car: ["airport_rentals"], campground: [] },
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
  // Nordic segments follow the same unverified country-name pattern; confirm on the live provider site.
  if (c === "no") return motorhomeRepublicLink("/norway/", now);
  if (c === "is") return motorhomeRepublicLink("/iceland/", now);
  if (c === "se") return motorhomeRepublicLink("/sweden/", now);
  if (c === "fi") return motorhomeRepublicLink("/finland/", now);
  if (c === "dk") return motorhomeRepublicLink("/denmark/", now);
  if (c === "nl") return motorhomeRepublicLink(undefined, now);
  if (c === "nz") return motorhomeRepublicLink("/new-zealand-motorhome-rental", now);
  return motorhomeRepublicLink(undefined, now);
}

export function carLinkFor(country?: string | null): string | null {
  return isPartnerAvailable("airport_rentals", country, "car") ? airportRentalsLink() : null;
}
