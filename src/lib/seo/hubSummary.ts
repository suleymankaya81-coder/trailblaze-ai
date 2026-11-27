// Answer-first text for hubs and list pages, composed only from stored facts (no AI, nothing per visit).
// Each sentence is left out when its fact is missing.
import { formatDriveShort } from "./flyDrive";

export type Locale3 = "en" | "de" | "fr";

/** One published place as hubs see it (stored columns only). */
export type HubPlaceRow = {
  slug: string;
  name: string;
  destinationType?: string | null;
  tripDurationDays?: string | null;
  airportCode?: string | null;
  airportName?: string | null;
  driveMinutes?: number | null;
  accessType?: string | null;
  scenicScore?: number | null;
};

export type HubStats = {
  places: number;
  types: { type: string; count: number }[];
  typicalStay: string | null;
  airports: { code: string; name: string | null; count: number }[];
  medianDriveMinutes: number | null;
  ferry: number;
  flyIn: number;
  notable: string[];
};

const TYPE_NAMES: Record<Locale3, Record<string, [string, string]>> = {
  en: { national_park: ["national park", "national parks"], national_monument: ["national monument", "national monuments"], gateway_city: ["gateway city", "gateway cities"], state_park: ["state park", "state parks"], nature_park: ["nature park", "nature parks"], scenic_region: ["scenic region", "scenic regions"], town: ["town", "towns"], city: ["city", "cities"], island: ["island", "islands"] },
  de: { national_park: ["Nationalpark", "Nationalparks"], national_monument: ["National Monument", "National Monuments"], gateway_city: ["Ausgangsstadt", "Ausgangsstädte"], state_park: ["State Park", "State Parks"], nature_park: ["Naturpark", "Naturparks"], scenic_region: ["Landschaftsregion", "Landschaftsregionen"], town: ["Ort", "Orte"], city: ["Stadt", "Städte"], island: ["Insel", "Inseln"] },
  fr: { national_park: ["parc national", "parcs nationaux"], national_monument: ["monument national", "monuments nationaux"], gateway_city: ["ville d'accès", "villes d'accès"], state_park: ["parc d'État", "parcs d'État"], nature_park: ["parc naturel", "parcs naturels"], scenic_region: ["région naturelle", "régions naturelles"], town: ["village", "villages"], city: ["ville", "villes"], island: ["île", "îles"] },
};

function mode<T>(values: T[]): T | null {
  const c = new Map<T, number>();
  for (const v of values) c.set(v, (c.get(v) ?? 0) + 1);
  let best: T | null = null, n = 0;
  for (const [v, k] of c) if (k > n) { best = v; n = k; }
  return best;
}

export function computeHubStats(rows: HubPlaceRow[]): HubStats {
  const types = new Map<string, number>();
  for (const r of rows) if (r.destinationType) types.set(r.destinationType, (types.get(r.destinationType) ?? 0) + 1);
  const airports = new Map<string, { code: string; name: string | null; count: number }>();
  for (const r of rows) if (r.airportCode) {
    const a = airports.get(r.airportCode) ?? { code: r.airportCode, name: r.airportName ?? null, count: 0 };
    a.count++; airports.set(r.airportCode, a);
  }
  const drives = rows.map((r) => r.driveMinutes).filter((m): m is number => typeof m === "number").sort((a, b) => a - b);
  const stays = rows.map((r) => r.tripDurationDays?.trim()).filter((s): s is string => !!s);
  const typical = mode(stays);
  return {
    places: rows.length,
    types: [...types].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)),
    // Only a clear majority is called "typical".
    typicalStay: typical && stays.filter((s) => s === typical).length * 2 >= stays.length && stays.length >= 2 ? typical : null,
    airports: [...airports.values()].sort((a, b) => b.count - a.count || a.code.localeCompare(b.code)).slice(0, 3),
    medianDriveMinutes: drives.length ? drives[Math.floor((drives.length - 1) / 2)] : null,
    ferry: rows.filter((r) => r.accessType === "ferry").length,
    flyIn: rows.filter((r) => r.accessType === "fly-in").length,
    notable: [...rows].filter((r) => r.scenicScore != null).sort((a, b) => (b.scenicScore! - a.scenicScore!) || a.name.localeCompare(b.name)).slice(0, 3).map((r) => r.name),
  };
}

const list = (items: string[], locale: Locale3) => {
  const and = { en: "and", de: "und", fr: "et" }[locale];
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
};

/**
 * 1–4 sentences answering "what is there and how do I get there" for a country or region hub.
 * A stored regions.intro, when present, leads.
 */
export function hubLead(name: string, s: HubStats, locale: Locale3 = "en", storedIntro?: string | null): string[] {
  const out: string[] = [];
  if (storedIntro?.trim()) out.push(storedIntro.trim());
  const notable = s.notable.length ? list(s.notable, locale) : null;
  out.push({
    en: `${name} has ${s.places} ${s.places === 1 ? "destination" : "destinations"} with a trip plan on WildParkRoutes${notable ? `, including ${notable}` : ""}.`,
    de: `${name} hat ${s.places} ${s.places === 1 ? "Reiseziel" : "Reiseziele"} mit Reiseplan auf WildParkRoutes${notable ? `, darunter ${notable}` : ""}.`,
    fr: `${name} compte ${s.places} ${s.places === 1 ? "destination" : "destinations"} avec un plan de voyage sur WildParkRoutes${notable ? `, dont ${notable}` : ""}.`,
  }[locale]);
  if (s.typicalStay) out.push({ en: `Most plans here suggest ${s.typicalStay}.`, de: `Die meisten Reisepläne hier sehen ${s.typicalStay} vor.`, fr: `La plupart des plans suggèrent ${s.typicalStay}.` }[locale]);
  if (s.airports.length) {
    const codes = list(s.airports.map((a) => a.code), locale);
    const drive = s.medianDriveMinutes != null ? formatDriveShort(s.medianDriveMinutes) : null;
    out.push({
      en: `The most common arrival ${s.airports.length === 1 ? "airport is" : "airports are"} ${codes}${drive ? `; the typical airport-to-destination drive is about ${drive}` : ""}.`,
      de: `${s.airports.length === 1 ? "Der häufigste Ankunftsflughafen ist" : "Die häufigsten Ankunftsflughäfen sind"} ${codes}${drive ? `; die typische Fahrt vom Flughafen dauert etwa ${drive}` : ""}.`,
      fr: `${s.airports.length === 1 ? "L'aéroport d'arrivée le plus fréquent est" : "Les aéroports d'arrivée les plus fréquents sont"} ${codes}${drive ? ` ; le trajet type depuis l'aéroport dure environ ${drive}` : ""}.`,
    }[locale]);
  }
  return out;
}

/** "At a glance" facts for hubs (label/value pairs, omitted when unknown). */
export function hubFacts(s: HubStats, locale: Locale3 = "en"): { label: string; value: string }[] {
  const L = {
    en: { places: "Destinations", types: "Types", stay: "Typical stay", airports: "Main arrival airports", drive: "Typical airport drive", access: "Not reached by road" },
    de: { places: "Reiseziele", types: "Arten", stay: "Typische Aufenthaltsdauer", airports: "Wichtigste Ankunftsflughäfen", drive: "Typische Fahrt vom Flughafen", access: "Nicht über die Straße erreichbar" },
    fr: { places: "Destinations", types: "Types", stay: "Séjour type", airports: "Principaux aéroports d'arrivée", drive: "Trajet type depuis l'aéroport", access: "Non accessibles par la route" },
  }[locale];
  const out = [{ label: L.places, value: String(s.places) }];
  const types = s.types.filter((t) => TYPE_NAMES[locale][t.type]).slice(0, 3).map((t) => `${t.count} ${TYPE_NAMES[locale][t.type][t.count === 1 ? 0 : 1]}`);
  if (types.length) out.push({ label: L.types, value: types.join(", ") });
  if (s.typicalStay) out.push({ label: L.stay, value: s.typicalStay });
  if (s.airports.length) out.push({ label: L.airports, value: s.airports.map((a) => (a.name ? `${a.name} (${a.code})` : a.code)).join(", ") });
  if (s.medianDriveMinutes != null) out.push({ label: L.drive, value: formatDriveShort(s.medianDriveMinutes) });
  const remote = [s.ferry ? { en: `${s.ferry} by boat`, de: `${s.ferry} per Schiff`, fr: `${s.ferry} en bateau` }[locale] : null, s.flyIn ? { en: `${s.flyIn} by flight or expedition`, de: `${s.flyIn} per Flug oder Expedition`, fr: `${s.flyIn} en avion ou en expédition` }[locale] : null].filter(Boolean);
  if (remote.length) out.push({ label: L.access, value: remote.join(", ") });
  return out;
}

/** Lead for the guide-family list pages (Fly & Drive, No reservation, RV & camping). */
export function familyLead(family: "fly-and-drive" | "no-reservation" | "rv-camping", entries: { countryCode: string; airportCode: string | null; driveMinutes: number | null }[], locale: Locale3 = "en"): string[] {
  if (!entries.length) return [];
  const countries = new Set(entries.map((e) => e.countryCode)).size;
  const n = entries.length;
  const what = {
    "fly-and-drive": { en: `${n} fly-and-drive guides`, de: `${n} Fly-&-Drive-Ratgeber`, fr: `${n} guides avion + voiture` },
    "no-reservation": { en: `${n} guides for places where booking matters`, de: `${n} Ratgeber für Orte, an denen eine Reservierung zählt`, fr: `${n} guides pour les lieux où la réservation compte` },
    "rv-camping": { en: `${n} RV and camping guides`, de: `${n} Wohnmobil- und Camping-Ratgeber`, fr: `${n} guides camping-car et camping` },
  }[family][locale];
  const out = [{ en: `There are ${what} in ${countries} ${countries === 1 ? "country" : "countries"}.`, de: `Es gibt ${what} in ${countries} ${countries === 1 ? "Land" : "Ländern"}.`, fr: `Il y a ${what} dans ${countries} pays.` }[locale]];
  const s = computeHubStats(entries.map((e, i) => ({ slug: String(i), name: "", airportCode: e.airportCode, driveMinutes: e.driveMinutes })));
  if (s.airports.length) {
    const codes = list(s.airports.map((a) => a.code), locale);
    const drive = s.medianDriveMinutes != null ? formatDriveShort(s.medianDriveMinutes) : null;
    out.push({
      en: `The most frequent arrival airports are ${codes}${drive ? `, and the median airport drive is ${drive}` : ""}.`,
      de: `Die häufigsten Ankunftsflughäfen sind ${codes}${drive ? `; die mittlere Fahrt vom Flughafen dauert ${drive}` : ""}.`,
      fr: `Les aéroports d'arrivée les plus fréquents sont ${codes}${drive ? ` ; le trajet médian depuis l'aéroport est de ${drive}` : ""}.`,
    }[locale]);
  }
  return out;
}

/** Lead for the road-trip list pages, from the reviewed loops/corridors data. */
export function routesLead(kind: "loops" | "corridors", routes: { stops: string[]; region?: string; idealDays?: string }[], locale: Locale3 = "en"): string[] {
  if (!routes.length) return [];
  const n = routes.length;
  const stops = routes.reduce((a, r) => a + r.stops.length, 0);
  const regions = [...new Set(routes.map((r) => r.region).filter((x): x is string => !!x))];
  const first = kind === "loops"
    ? { en: `There are ${n} self-drive loops linking ${stops} stops`, de: `Es gibt ${n} Rundreisen mit dem Auto und insgesamt ${stops} Stopps`, fr: `Il y a ${n} boucles en voiture reliant ${stops} étapes` }[locale]
    : { en: `There are ${n} road trips that start and end at the same arrival airport, with ${stops} stops in total`, de: `Es gibt ${n} Roadtrips, die am selben Ankunftsflughafen beginnen und enden, mit insgesamt ${stops} Stopps`, fr: `Il y a ${n} road trips qui partent et reviennent au même aéroport d'arrivée, avec ${stops} étapes au total` }[locale];
  const where = regions.length ? { en: ` across ${list(regions.slice(0, 6), locale)}`, de: ` in ${list(regions.slice(0, 6), locale)}`, fr: ` dans ${list(regions.slice(0, 6), locale)}` }[locale] : "";
  return [`${first}${where}.`];
}
