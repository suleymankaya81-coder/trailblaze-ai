import { tp, type Locale } from "@/lib/i18n";
import { isNonRoadDestination } from "@/lib/data/destinationAccess";

export type AnswerFacts = {
  slug: string;
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

/**
 * A 1–3 sentence direct answer for the top of a destination page, built only from stored fields
 * (tagline, best season, suggested stay, nearest airport and drive time). Missing data → that part
 * is left out; nothing is generated per visit.
 */
export function destinationShortAnswer(d: AnswerFacts, locale: Locale = "en"): string[] {
  const out: string[] = [];
  if (d.tagline?.trim()) out.push(sentence(d.tagline));
  const season = d.bestSeason?.trim() ? tp(locale, d.bestSeason.trim()) : null;
  const days = d.tripDurationDays?.trim() ? tp(locale, d.tripDurationDays.trim()) : null;
  if (season || days) {
    const t = {
      en: season && days ? `The best time to visit is ${season}, and this guide suggests ${days}.` : season ? `The best time to visit is ${season}.` : `This guide suggests ${days}.`,
      de: season && days ? `Die beste Reisezeit ist ${season}; dieser Reiseplan sieht ${days} vor.` : season ? `Die beste Reisezeit ist ${season}.` : `Dieser Reiseplan sieht ${days} vor.`,
      fr: season && days ? `La meilleure période pour y aller est ${season} ; ce guide prévoit ${days}.` : season ? `La meilleure période pour y aller est ${season}.` : `Ce guide prévoit ${days}.`,
    };
    out.push(t[locale]);
  }
  // Remote places (boat, flight or expedition access) get no road-trip airport sentence.
  if (d.airportCode && !isNonRoadDestination(d.slug, d.accessType ?? null)) {
    const airport = d.airportName ? `${d.airportName} (${d.airportCode})` : d.airportCode;
    const t = d.driveMinutes != null
      ? { en: `The closest arrival airport is ${airport}, about ${drive(d.driveMinutes)} away by car.`, de: `Der nächste Ankunftsflughafen ist ${airport}, etwa ${drive(d.driveMinutes)} mit dem Auto entfernt.`, fr: `L'aéroport d'arrivée le plus proche est ${airport}, à environ ${drive(d.driveMinutes)} en voiture.` }
      : { en: `The closest arrival airport is ${airport}.`, de: `Der nächste Ankunftsflughafen ist ${airport}.`, fr: `L'aéroport d'arrivée le plus proche est ${airport}.` };
    out.push(t[locale]);
  }
  return out.slice(0, 3);
}
