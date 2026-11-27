import type { DestinationView } from "@/lib/data/destinations.functions";
import type { DestinationTranslation } from "@/lib/data/translations.functions";
import type { TravelPlan } from "@/lib/data/travelPlan";
import { genuineSeason } from "@/lib/seo/season";
import { cleanTravelPlan, knownFactsOnly, knownHeadline } from "@/lib/seo/unknownFacts";

/** Translations may replace prose, never navigation, coordinates or source identities. */
export function translatePlan(plan: TravelPlan | null, tr: DestinationTranslation): TravelPlan | null {
  if (!plan || tr.days.length !== plan.days.length || tr.intel.length !== plan.intel.length || plan.days.some((d, i) => tr.days[i]?.stops.length !== d.stops.length)) return plan;
  return {
    ...plan,
    days: plan.days.map((day, i) => {
      const text = tr.days[i];
      if (!text) return day;
      return { ...day, title: text.title, start: text.start, driving: text.driving, note: text.note,
        stops: day.stops.map((stop, j) => ({ ...stop, name: text.stops[j]?.name ?? stop.name, detail: text.stops[j]?.detail ?? stop.detail, routingName: stop.routingName ?? stop.name })) };
    }),
    intel: plan.intel.map((note, i) => ({ ...note, title: tr.intel[i]?.title ?? note.title, text: tr.intel[i]?.text ?? note.text })),
    arrival: tr.arrival ?? plan.arrival,
    vehicle: tr.vehicle ?? plan.vehicle,
    goldenHour: tr.goldenHour ?? plan.goldenHour,
  };
}

/** Overlay stored translated text onto the full English page data; layout, photos and partners stay identical. */
export function translateDest(dest: DestinationView, tr: DestinationTranslation): DestinationView {
  // Translations of unknown-fact wording are cleaned the same way as the English text.
  const travelPlan = cleanTravelPlan(translatePlan(dest.travelPlan, tr));
  return {
    ...dest,
    name: tr.name || dest.name,
    region: tr.region ?? dest.region,
    tagline: tr.tagline ?? dest.tagline,
    // A stored translation of "no verified season" is not a season either: omit it.
    bestSeason: tr.bestSeason != null ? genuineSeason(tr.bestSeason) : genuineSeason(dest.bestSeason),
    permitHeadline: tr.permitHeadline != null ? knownHeadline(tr.permitHeadline) : dest.permitHeadline,
    permitNote: tr.permitNote != null ? knownFactsOnly(tr.permitNote) : dest.permitNote,
    travelPlan,
  } as DestinationView;
}

