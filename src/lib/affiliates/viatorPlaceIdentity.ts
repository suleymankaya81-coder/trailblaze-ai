import { COUNTRIES } from "@/lib/routes/paths";

export const placeWords = (value: string): string[] => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[æœøłđðþß]/g, c => ({ æ: "ae", œ: "oe", ø: "o", ł: "l", đ: "d", ð: "d", þ: "th", ß: "ss" })[c] ?? c).match(/[a-z0-9]+/g) ?? [];
const ADMIN = new Set("national park parks country landscape aonb state wilderness area recreation preserve monument scenic region city town the and of usa united states regional natural nature reserve reserves protected protection parco parque parc naturale nacional nazionale naturpark naturparken natuurpark nationalpark nationalparks parc naturel regionaler natuurreservaat reserva biosphere biosfera biosphare provincial conservation delle della dell di des du de".split(" "));
const GEOGRAPHIC = new Set("forest forests trail river lake lakes beach beaches coast coastal valley mountain mountains island islands".split(" "));

// Explicit geographic equivalents only; never accept any single word of a multiword place.
const ALIASES: Record<string, string> = {
  "alto garda bresciano regional park": "Lake Garda",
  "parco regionale dell alto garda bresciano": "Lake Garda",
};
export function viatorPlaceName(name: string): string {
  return ALIASES[placeWords(name).join(" ")] ?? name;
}
export function isViatorAreaAlias(name: string): boolean {
  return ALIASES[placeWords(name).join(" ")] !== undefined;
}
export function viatorPlaceTerms(name: string): string[] {
  // These names have no distinctive non-administrative term. Their full name is essential.
  const normalized = placeWords(name).join(" ");
  if (normalized === "swiss national park" || normalized === "archipelago national park") return placeWords(name);
  const terms = placeWords(viatorPlaceName(name)).filter(w => w.length > 2 && !ADMIN.has(w));
  return terms.some(w => !GEOGRAPHIC.has(w)) ? terms : [];
}
export function viatorCountryName(code: string): string {
  return code.toLowerCase() === "us" ? "USA" : COUNTRIES[code.toLowerCase()]?.name ?? "";
}
export function viatorPlaceQuery(name: string, country: string): string {
  const identity = viatorPlaceName(name);
  const tokens = placeWords(identity);
  const query = tokens.some(w => ADMIN.has(w)) ? viatorPlaceTerms(identity).join(" ") : identity;
  return [query || identity, viatorCountryName(country)].filter(Boolean).join(" ");
}

// One-time invalidation of results produced by the old international matching rules.
export const VIATOR_CACHE_REVIEWED_AFTER = Date.parse("2026-11-21T13:15:00Z");
export function isViatorPlaceCacheFresh(fetchedAt: string, now = Date.now()): boolean {
  const fetched = Date.parse(fetchedAt);
  return fetched >= VIATOR_CACHE_REVIEWED_AFTER && fetched <= now && now - fetched < 24 * 60 * 60 * 1000;
}