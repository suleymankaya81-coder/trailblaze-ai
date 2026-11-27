// One rule for every place a stored best season can surface (pages, titles, meta, JSON-LD, FAQs, pins).
// Month and season words in the stored languages (English data; German and French translations).
const SEASON_WORD = new RegExp(
  "\\b(" + [
    "january|february|march|april|may|june|july|august|september|october|november|december",
    "jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec",
    "spring|summer|autumn|fall|winter|year-round|year round|all year",
    "januar|februar|märz|mai|juni|juli|oktober|dezember|frühling|frühjahr|sommer|herbst|ganzjährig",
    "janvier|février|mars|avril|juin|juillet|août|septembre|octobre|novembre|décembre|printemps|été|automne|hiver|toute l'année",
  ].join("|") + ")\\b",
  "iu",
);
// Stored "unknown" statements: "No verified visitor-season recommendation is available for X; consult…",
// "Check official seasonal information", "Evidence does not specify…", and their translations.
const NOT_A_SEASON = /(no verified|not specify|does not|check official|official seasonal|consult|contact local|keine verifizierte|überprüfen sie|konsultieren|aucune recommandation|consulte[rz]?|vérifi|recheck|verify)/iu;

/**
 * True only for a real season or month range ("Late June – September", "Spring and Fall", "summer",
 * "Year-round"). Sentences such as the stored "No verified visitor-season recommendation is
 * available for …; consult the park authority …" are not seasons and must never follow
 * "The best time to visit is".
 */
export function isSeasonText(value: string | null | undefined): boolean {
  const s = value?.trim();
  if (!s || s.length > 80) return false;
  if (NOT_A_SEASON.test(s) || /[;:]/.test(s) || /[.!?]\s*\S/.test(s)) return false;
  return SEASON_WORD.test(s);
}

/** The stored season when it is a genuine season or month range, otherwise null (omit the field). */
export function genuineSeason(value: string | null | undefined): string | null {
  return isSeasonText(value) ? value!.trim() : null;
}

/**
 * Stored "unknown fact" wording that must never reach rendered output, titles, meta or JSON-LD
 * (English data and the stored German/French translations). Used by tests.
 */
export const STORED_UNKNOWN_FACT = /(no verified visitor-season|check official seasonal|evidence does not specify|keine verifizierte empfehlung|überprüfen sie die offiziellen saison|aucune recommandation (vérifiée|de saison)|consulte[rz]? les informations saisonnières|reviewed sources do not establish|die geprüften quellen|les sources (examinées|vérifiées) ne)/i;
