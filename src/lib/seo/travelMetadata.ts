import { DESCRIPTION_MAX, TITLE_MAX, fitText } from "./routeSeo";
import { tp } from "@/lib/i18n";

export type TravelFacts = { name: string; region?: string | null; destinationType?: string | null; tripDurationDays?: string | null; bestSeason?: string | null; campingScore?: number | null; airportCode?: string | null };
type Family = "destination" | "fly-and-drive" | "no-reservation" | "rv-camping" | "road-trips" | "corridors";
const typeNames: Record<string, string> = { national_park: "national park", state_park: "state park", national_monument: "national monument", city: "city", town: "town", gateway_city: "gateway city", scenic_region: "scenic region", island: "island" };
const typeNamesDe: Record<string, string> = { national_park: "Nationalpark", state_park: "State Park", national_monument: "National Monument", city: "Stadt", town: "Ort", gateway_city: "Ausgangsstadt", scenic_region: "Landschaftsregion", island: "Insel" };
const months: Record<string, string> = { January: "Januar", February: "Februar", March: "März", April: "April", May: "Mai", June: "Juni", July: "Juli", August: "August", September: "September", October: "Oktober", November: "November", December: "Dezember" };
const seasonDe = (value: string) => tp("de", value).replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g, m => months[m]).replace(/\bearly\b/g, "Anfang").replace(/\blate\b/g, "Ende").replace(/\bto\b/g, "bis");

/** Stored facts only; omit absent fields and never promise campground availability. */
export function travelDescription(facts: TravelFacts, family: Family, fallback: string, locale: "en" | "de" = "en"): string {
  const de = locale === "de";
  const type = facts.destinationType ? (de ? typeNamesDe : typeNames)[facts.destinationType] : null;
  const location = [facts.region && (de ? tp("de", facts.region) : facts.region), type].filter(Boolean).join(" · ");
  const days = facts.tripDurationDays ? (de ? tp("de", facts.tripDurationDays) : facts.tripDurationDays) : null;
  const season = facts.bestSeason ? (de ? seasonDe(facts.bestSeason) : facts.bestSeason) : null;
  const topic = de ? { destination: "Reiseplan, Karte & Camping", "fly-and-drive": "Flüge, Mietwagen & erste Nacht", "no-reservation": "Einlassregeln & Alternativen", "rv-camping": "Wohnmobil, Campingplätze & Route", "road-trips": "Roadtrip, Karte & Camping", corridors: "Flughafen-Roadtrip & Camping" }[family]
    : { destination: "Travel plan, map & camping", "fly-and-drive": "Flights, car & first night", "no-reservation": "Entry rules & backup plans", "rv-camping": "RV parks, campgrounds & route", "road-trips": "Road trip, map & camping", corridors: "Airport road trip & camping" }[family];
  const arrival = family === "fly-and-drive" && facts.airportCode ? `${facts.airportCode}: ${topic}` : topic;
  const parts = [location, days, season ? `${de ? "Beste Zeit" : "Best season"}: ${season}` : null, arrival].filter(Boolean);
  const full = `${facts.name}: ${parts.join("; ")}.`;
  // Prefer all supplied facts; shorten only location detail before losing season/duration.
  const compact = `${facts.name}: ${[days, season, arrival].filter(Boolean).join("; ")}.`;
  return fitText([full, compact, fallback], DESCRIPTION_MAX);
}

type Tag = Record<string, unknown>;
export function germanTravelHead(head: { meta?: Tag[]; [key: string]: unknown }, facts: TravelFacts, family: Family) {
  const topic = { destination: "Reiseführer", "fly-and-drive": "Flughafen & Anreise", "no-reservation": "Reservierung & Einlass", "rv-camping": "Wohnmobil & Camping", "road-trips": "Roadtrip", corridors: "Roadtrip ab Flughafen" }[family];
  const name = tp("de", facts.name);
  const title = fitText([`${name}: ${topic} — MiniaLife`, `${name}: ${topic}`, name], TITLE_MAX);
  const description = travelDescription(facts, family, `${facts.name}: ${topic}.`, "de");
  return { ...head, meta: (head.meta ?? []).map(tag => typeof tag.title === "string" ? { ...tag, title } : tag.property === "og:title" ? { ...tag, content: title } : tag.name === "description" || tag.property === "og:description" ? { ...tag, content: description } : tag) };
}