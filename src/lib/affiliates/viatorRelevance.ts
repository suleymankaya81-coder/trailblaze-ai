import { placeWords as words, viatorPlaceTerms } from "./viatorPlaceIdentity";

// Spelling variants operators use for the same place (Catalan/Castilian, local/English).
const VARIANTS: Record<string, string> = { sierra: "serra", pirineos: "pyrenees", pireneus: "pyrenees", pirineus: "pyrenees", gorge: "gorges" };
const canon = (w: string) => VARIANTS[w] ?? w;
/** All distinctive terms within a short window, in any order ("Verdon Gorges", "Gorges du Verdon"). */
function hasTerms(value: string, terms: string[]): boolean {
  const tokens = words(value).map(canon);
  const want = terms.map(canon);
  const span = want.length + 2;
  return tokens.some((token, index) => want.includes(token) && want.every(term => tokens.slice(index, index + span).includes(term)));
}
const UK_GEO = ["uk", "britain", "british", "england", "scotland", "wales", "english", "scottish", "welsh", "london", "edinburgh", "glasgow", "manchester", "liverpool", "cardiff", "inverness", "oxford", "cornwall", "devon", "cumbria", "yorkshire", "highlands"];

function hasPhrase(value: string, terms: string[]): boolean {
  const tokens = words(value);
  return tokens.some((_, index) => terms.every((term, offset) => tokens[index + offset] === term));
}

/** Free-text search can return unrelated destinations; require a place-specific name in provider text. */
export function isPlaceExperienceRelevant(name: string, title: string, description = "", context?: { countryCode?: string | null; region?: string | null }): boolean {
  const terms = viatorPlaceTerms(name);
  if (!terms.length) return false;
  const text = new Set(words(`${title} ${description}`));
  // The word calanques also describes coves far outside the Marseille national park.
  if (words(name).join(" ") === "calanques national park" &&
    !["marseille", "cassis", "calanques national park"].some(anchor => hasPhrase(`${title} ${description}`, words(anchor)))) return false;
  // Same-name destinations abroad require affirmative Canadian geography.
  if (context?.countryCode === "ca") {
    const geography = [...words(context.region ?? "").filter(w => w.length > 2), "canada", "canadian"];
    if (!geography.some(term => text.has(term))) return false;
  }
  if (context?.countryCode === "gb") {
    const geography = [...words(context.region ?? "").filter(w => w.length > 2), ...UK_GEO];
    if (!geography.some(term => text.has(term))) return false;
  }
  return hasTerms(title, terms) || hasTerms(description, terms);
}

/** Fallback for places with no named listing: a gateway town or the place's distinctive area must be named, with the same country checks. */
export function isNearbyExperienceRelevant(title: string, description = "", context: { gateways?: string[] | null; area?: string | null; state?: string | null; countryCode?: string | null }): boolean {
  const text = new Set(words(`${title} ${description}`));
  const stateTerms = words(context.state ?? "").filter(w => w.length > 2 && w !== "and" && w !== "the");
  const geo = context.countryCode === "ca" ? (stateTerms.length ? stateTerms : ["canada", "canadian"])
    : context.countryCode === "gb" ? [...words(context.state ?? ""), ...UK_GEO, "ireland"]
    : null;
  if (geo && !geo.some((term) => text.has(term))) return false;
  const stateWords = new Set(words(context.state ?? ""));
  const has = (phrase: string, min: number) => {
    const terms = viatorPlaceTerms(phrase).filter((w) => !stateWords.has(w) && !DIRECTIONS.has(w));
    return terms.length >= min && (hasTerms(title, terms) || hasTerms(description, terms));
  };
  return (context.gateways ?? []).some((g) => has(g, 1)) || has(context.area ?? "", 2);
}
const DIRECTIONS = new Set("north south east west northern southern eastern western northeastern northwestern southeastern southwestern central upper lower greater".split(" "));
