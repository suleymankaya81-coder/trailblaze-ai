import type { DestinationView } from "@/lib/data/destinations.functions";
import type { DestinationTranslation } from "@/lib/data/translations.functions";

/** Overlay stored translated text onto the full English page data; layout, photos and partners stay identical. */
export function translateDest(dest: DestinationView, tr: DestinationTranslation): DestinationView {
  const plan = dest.travelPlan;
  const travelPlan = plan && tr.days.length === plan.days.length && tr.intel.length === plan.intel.length
    ? {
        ...plan,
        days: plan.days.map((d, i) => ({ ...d, ...tr.days[i], stops: d.stops.map((s, j) => ({ ...s, ...(tr.days[i].stops[j] ?? {}), routingName: s.name })) })),
        intel: plan.intel.map((x, i) => ({ ...x, title: tr.intel[i].title, text: tr.intel[i].text })),
        arrival: tr.arrival ?? plan.arrival,
        vehicle: tr.vehicle ?? plan.vehicle,
        goldenHour: tr.goldenHour ?? plan.goldenHour,
      }
    : plan;
  return {
    ...dest,
    name: tr.name || dest.name,
    region: tr.region ?? dest.region,
    tagline: tr.tagline ?? dest.tagline,
    bestSeason: tr.bestSeason ?? dest.bestSeason,
    permitHeadline: tr.permitHeadline ?? dest.permitHeadline,
    permitNote: tr.permitNote ?? dest.permitNote,
    travelPlan,
  } as DestinationView;
}

