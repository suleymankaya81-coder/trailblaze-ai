import { tp, type Locale } from "@/lib/i18n";
import { isFerryDestination, isNonRoadDestination } from "@/lib/data/destinationAccess";

export type AnswerFacts = {
  slug: string;
  /** Used for a location sentence when there is no tagline. */
  name?: string | null;
  region?: string | null;
  tagline: string | null;
  bestSeason: string | null;
  tripDurationDays: string | null;
  airportCode: string | null;
  airportName: string | null;
  driveMinutes: number | null;
  accessType?: string | null;
};

const drive = (mins: number) => {
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
};
const sentence = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);

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

/**
 * A 1–3 sentence direct answer for the top of a destination page, built only from stored fields
 * (tagline or region, best season, suggested stay, nearest airport and drive time, access type).
 * Missing or non-season data → that part is left out; nothing is generated per visit.
 */
export function destinationShortAnswer(d: AnswerFacts, locale: Locale = "en"): string[] {
  const out: string[] = [];
  if (d.tagline?.trim()) out.push(sentence(d.tagline));
  else if (d.name?.trim() && d.region?.trim()) {
    const name = d.name.trim(), region = d.region.trim();
    out.push({ en: `${name} is in ${region}.`, de: `${name} liegt in ${region}.`, fr: `${name} se situe dans la région suivante : ${region}.` }[locale]);
  }
  // Only a real season/month range is quoted; stored "no verified recommendation" sentences are left out.
  const season = isSeasonText(d.bestSeason) ? tp(locale, d.bestSeason!.trim()) : null;
  const days = d.tripDurationDays?.trim() ? tp(locale, d.tripDurationDays.trim()) : null;
  if (season || days) {
    const t = {
      en: season && days ? `The best time to visit is ${season}, and this guide suggests ${days}.` : season ? `The best time to visit is ${season}.` : `This guide suggests ${days}.`,
      de: season && days ? `Die beste Reisezeit ist ${season}; dieser Reiseplan sieht ${days} vor.` : season ? `Die beste Reisezeit ist ${season}.` : `Dieser Reiseplan sieht ${days} vor.`,
      fr: season && days ? `La meilleure période pour y aller est ${season} ; ce guide prévoit ${days}.` : season ? `La meilleure période pour y aller est ${season}.` : `Ce guide prévoit ${days}.`,
    };
    out.push(t[locale]);
  }
  // Remote places (boat, flight or expedition access) get an access sentence instead of a road-trip airport sentence.
  const nonRoad = isNonRoadDestination(d.slug, d.accessType ?? null);
  if (nonRoad) {
    const ferry = isFerryDestination(d.slug, d.accessType ?? null);
    out.push(ferry
      ? { en: "It is reached by scheduled boat, not by road.", de: "Die Anreise erfolgt mit dem Linienschiff, nicht über die Straße.", fr: "On s'y rend en bateau de ligne, pas par la route." }[locale]
      : { en: "It is reached by flight or as an expedition, not by road.", de: "Die Anreise erfolgt per Flug oder als Expedition, nicht über die Straße.", fr: "On s'y rend en avion ou en expédition, pas par la route." }[locale]);
  } else if (d.airportCode) {
    const airport = d.airportName ? `${d.airportName} (${d.airportCode})` : d.airportCode;
    const t = d.driveMinutes != null
      ? { en: `The closest arrival airport is ${airport}, about ${drive(d.driveMinutes)} away by car.`, de: `Der nächste Ankunftsflughafen ist ${airport}, etwa ${drive(d.driveMinutes)} mit dem Auto entfernt.`, fr: `L'aéroport d'arrivée le plus proche est ${airport}, à environ ${drive(d.driveMinutes)} en voiture.` }
      : { en: `The closest arrival airport is ${airport}.`, de: `Der nächste Ankunftsflughafen ist ${airport}.`, fr: `L'aéroport d'arrivée le plus proche est ${airport}.` };
    out.push(t[locale]);
  }
  return out.slice(0, 3);
}
