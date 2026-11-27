// Answer-first blocks for the guide families, composed only from stored facts (no AI, no per-visit work).
// Sentences whose facts are missing are left out; stored "unknown" wording never appears (it is filtered upstream).
import { formatDriveShort } from "./flyDrive";
import { knownFactsOnly } from "./unknownFacts";

type L = "en" | "de";
type Place = {
  name: string;
  airportCode: string | null;
  airportName?: string | null;
  driveMinutes: number | null;
  driveMiles?: number | null;
  permitLevel?: string | null;
  campingScore?: number | null;
  tripDurationDays?: string | null;
};

const firstSentence = (s: string | null | undefined) => {
  const t = knownFactsOnly(s);
  return t ? (t.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? t) : null;
};
const airport = (d: Place) => (d.airportName ? `${d.airportName} (${d.airportCode})` : d.airportCode);

/** "Do you need a reservation for X?" answered from the stored permit level and the stored/reviewed note. */
export function noReservationAnswer(d: Place, note: string | null, locale: L = "en"): string[] {
  const out: string[] = [];
  const demand = d.permitLevel === "high" ? { en: "high", de: "hoch" } : d.permitLevel === "moderate" ? { en: "moderate", de: "mittel" } : null;
  if (demand) out.push({ en: `Booking demand at ${d.name} is ${demand.en}.`, de: `Die Buchungsnachfrage in ${d.name} ist ${demand.de}.` }[locale]);
  const n = firstSentence(note);
  if (n) out.push(n);
  return out;
}

/** "What is the closest airport to X?" */
export function flyDriveAnswer(d: Place, locale: L = "en"): string[] {
  if (!d.airportCode) return [];
  const drive = d.driveMinutes != null ? formatDriveShort(d.driveMinutes) : null;
  const miles = d.driveMiles != null ? `${Math.round(d.driveMiles)} mi / ${Math.round(d.driveMiles * 1.609)} km` : null;
  return [{
    en: `The closest airport to ${d.name} is ${airport(d)}${drive ? `, about ${drive} away by car${miles ? ` (${miles})` : ""}` : ""}.`,
    de: `Der nächste Flughafen bei ${d.name} ist ${airport(d)}${drive ? `, etwa ${drive} mit dem Auto entfernt${miles ? ` (${miles})` : ""}` : ""}.`,
  }[locale]];
}

/** "Can I visit X by RV, and where do I start?" */
export function rvAnswer(d: Place, locale: L = "en"): string[] {
  const out: string[] = [];
  const drive = d.driveMinutes != null ? formatDriveShort(d.driveMinutes) : null;
  if (d.airportCode) out.push({
    en: `For an RV or campervan trip to ${d.name}, pick up near ${airport(d)}${drive ? `; the drive to ${d.name} is about ${drive}` : ""}.`,
    de: `Für eine Reise mit Wohnmobil oder Camper nach ${d.name} bietet sich die Abholung bei ${airport(d)} an${drive ? `; die Fahrt nach ${d.name} dauert etwa ${drive}` : ""}.`,
  }[locale]);
  if (d.campingScore != null) out.push({ en: `Its camping score on WildParkRoutes is ${d.campingScore}/10.`, de: `Der Camping-Wert auf WildParkRoutes liegt bei ${d.campingScore}/10.` }[locale]);
  if (d.tripDurationDays) out.push({ en: `Plan ${d.tripDurationDays}.`, de: `Planen Sie ${d.tripDurationDays} ein.` }[locale]);
  return out;
}

/** "How long is this loop and where does it go?" */
export function loopAnswer(stops: { name: string }[], days: number, gateway: string | null, locale: L = "en"): string[] {
  if (stops.length < 2) return [];
  const first = stops[0].name, last = stops[stops.length - 1].name;
  return [{
    en: `This loop links ${stops.length} stops, from ${first} to ${last}, over about ${days} days${gateway ? `; the nearest arrival airport is ${gateway}` : ""}.`,
    de: `Diese Rundreise verbindet ${stops.length} Stopps von ${first} bis ${last} in etwa ${days} Tagen${gateway ? `; der nächste Ankunftsflughafen ist ${gateway}` : ""}.`,
  }[locale]];
}

/** "Where does this airport road trip start, how long is it, what does it include?" */
export function corridorAnswer(c: { gateway: { code: string; name: string }; idealDays: string }, stops: { name: string }[], locale: L = "en"): string[] {
  const named = stops.slice(1, 4).map((s) => s.name);
  return [{
    en: `This road trip starts and ends at ${c.gateway.name} (${c.gateway.code}) and takes ${c.idealDays}, with ${stops.length} stops${named.length ? ` including ${named.join(", ")}` : ""}.`,
    de: `Dieser Roadtrip beginnt und endet am Flughafen ${c.gateway.name} (${c.gateway.code}) und dauert ${c.idealDays}, mit ${stops.length} Stopps${named.length ? `, darunter ${named.join(", ")}` : ""}.`,
  }[locale]];
}
