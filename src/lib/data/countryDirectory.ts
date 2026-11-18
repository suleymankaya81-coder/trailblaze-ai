import geo from "@/data/destination-geo.json";
import { COUNTRIES } from "@/lib/routes/paths";

/** Browser-safe country directory: flags, continents and published counts from the stored geo index. */
export type Continent = "north-america" | "europe";
export const CONTINENTS: { key: Continent; label: string }[] = [
  { key: "europe", label: "Europe" },
  { key: "north-america", label: "North America" },
];

const META: Record<string, { flag: string; continent: Continent }> = {
  us: { flag: "🇺🇸", continent: "north-america" },
  ca: { flag: "🇨🇦", continent: "north-america" },
  gb: { flag: "🇬🇧", continent: "europe" },
  de: { flag: "🇩🇪", continent: "europe" },
  at: { flag: "🇦🇹", continent: "europe" },
  ch: { flag: "🇨🇭", continent: "europe" },
  it: { flag: "🇮🇹", continent: "europe" },
  es: { flag: "🇪🇸", continent: "europe" },
  fr: { flag: "🇫🇷", continent: "europe" },
  pt: { flag: "🇵🇹", continent: "europe" },
  gr: { flag: "🇬🇷", continent: "europe" },
  no: { flag: "🇳🇴", continent: "europe" },
  is: { flag: "🇮🇸", continent: "europe" },
  se: { flag: "🇸🇪", continent: "europe" },
  fi: { flag: "🇫🇮", continent: "europe" },
  dk: { flag: "🇩🇰", continent: "europe" },
  nl: { flag: "🇳🇱", continent: "europe" },
  be: { flag: "🇧🇪", continent: "europe" },
  ie: { flag: "🇮🇪", continent: "europe" },
};

export interface CountryEntry { code: string; name: string; nameDe: string; flag: string; continent: Continent; places: number; regions: number }

function build(): CountryEntry[] {
  const places = new Map<string, number>();
  const regions = new Map<string, Set<string>>();
  for (const v of Object.values(geo as Record<string, string>)) {
    const [c, r] = v.split("/");
    places.set(c, (places.get(c) ?? 0) + 1);
    if (!regions.has(c)) regions.set(c, new Set());
    regions.get(c)?.add(r);
  }
  return Object.entries(COUNTRIES)
    .filter(([code]) => (places.get(code) ?? 0) > 0 && META[code])
    .map(([code, n]) => ({ code, name: n.name, nameDe: n.nameDe, ...META[code], places: places.get(code) ?? 0, regions: regions.get(code)?.size ?? 0 }))
    .sort((a, b) => b.places - a.places);
}

export const COUNTRY_DIRECTORY: CountryEntry[] = build();
export const TOTAL_PLACES = COUNTRY_DIRECTORY.reduce((s, c) => s + c.places, 0);
export const countryEntry = (code?: string | null) => COUNTRY_DIRECTORY.find((c) => c.code === code?.toLowerCase());
export const countryFlag = (code?: string | null) => countryEntry(code)?.flag ?? "";
export const countryLabel = (code: string | null | undefined, locale: "en" | "de" = "en") => {
  const e = countryEntry(code);
  return e ? (locale === "de" ? e.nameDe : e.name) : "";
};
