import type { TravelPlan } from "@/lib/data/travelPlan";

/**
 * Stored text often states what the sources did NOT establish ("The reviewed sources do not establish
 * current parking conditions for X. Check the official visitor information before departure.").
 * Pages show stored facts only: such sentences are dropped, and a text left with nothing but generic
 * advice is dropped entirely. English data plus the stored German and French translations.
 */
// \b is ASCII-only in JavaScript, so word boundaries become \p{L} lookarounds (ü, é, …).
const UNKNOWN = new RegExp(
  [
    // English
    "\\b(do|does|did) not (establish|specify|contain|confirm)\\b",
    "\\bnot (verified|specified|established|confirmed)\\b",
    "^no verified\\b",
    "\\bare separate checks\\b",
    // German
    "\\b(überprüften|geprüften) quellen\\b",
    "\\bquellenauszüge\\b",
    "\\bnicht (überprüft|belegt|bestätigt|verifiziert)\\b",
    "\\bseparate überprüfungen\\b",
    "^keine verifizierte\\b",
    // French
    "\\bn'établissent pas\\b",
    "\\bne précisent pas\\b",
    "\\bne (sont|soient) pas vérifiés?\\b",
    "\\bdoivent être vérifiés séparément\\b",
    "\\bsources (consultées|examinées)\\b",
    "^aucune recommandation\\b",
  ].map((re) => re.replace(/^\\b/, "(?<!\\p{L})").replace(/\\b$/, "(?!\\p{L})").replace(/\\b/g, "(?<![\\p{L}])")).join("|"),
  "iu",
);
// Generic "check elsewhere" sentences with no place-specific content (kept only next to a real fact).
// Specific instructions such as "Check recreation.gov for timed-entry dates" are not generic and stay.
const ADVICE = /^(check|verify|confirm|consult|recheck|überprüfen|prüfen|vérifiez|consultez|consulter)(?!\p{L}).*(official|visitor information|local information|current conditions|before (departure|travel|you go)|offiziellen|vor der abreise|officielles|avant (le|votre) départ)(?!\p{L})/iu;
// The stored default reservation headline (and its translations) says nothing about the place.
const GENERIC_HEADLINE = /^(check visitor access before departure|überprüfen sie den besucherzugang vor der abreise|vérifiez l'accès des visiteurs avant le départ)\.?$/iu;

/** A stored reservation headline, or null when it is the generic default or an unknown-fact line. */
export function knownHeadline(text: string | null | undefined): string | null {
  const t = text?.trim();
  if (!t || GENERIC_HEADLINE.test(t) || isUnknownFactSentence(t)) return null;
  return t;
}

const sentences = (text: string) => text.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜÉÈÀÂÎÔÛÇÅØ«"“(0-9])/u).map((s) => s.trim()).filter(Boolean);

export function isUnknownFactSentence(s: string): boolean {
  return UNKNOWN.test(s.trim());
}

/** The text without "not established / not verified" sentences; null when no stored fact remains. */
export function knownFactsOnly(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  const kept = sentences(text).filter((s) => !isUnknownFactSentence(s));
  if (!kept.length || kept.every((s) => ADVICE.test(s))) return null;
  return kept.join(" ");
}

/**
 * The travel plan as pages show it: unknown-fact fields become "" and components skip empty text
 * (including intel cards). Stops, coordinates, markers and sources stay.
 */
export function cleanTravelPlan(plan: TravelPlan | null): TravelPlan | null {
  if (!plan) return plan;
  const keep = (s: string) => knownFactsOnly(s) ?? "";
  return {
    ...plan,
    arrival: keep(plan.arrival),
    vehicle: keep(plan.vehicle),
    goldenHour: keep(plan.goldenHour),
    // Same length and order as stored, so German/French overlays still match by index; empty cards are skipped when rendered.
    intel: plan.intel.map((i) => ({ ...i, text: keep(i.text) })),
    days: plan.days.map((d) => ({ ...d, driving: keep(d.driving), note: keep(d.note) })),
  };
}
