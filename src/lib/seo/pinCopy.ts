// Pure Pinterest pin copy: titles, descriptions and hashtags built from
// reviewed page data. No AI, no photo credits (credit lives on the image).
export type PinKind = "destination" | "best_time" | "things_to_do" | "glamping" | "trip_planner";

export type PinInput = {
  kind: PinKind;
  name: string;
  tagline?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  bestSeason?: string | null;
  duration?: string | null;
  airport?: string | null;
};

export const TITLE_MAX = 100;
export const DESC_MIN = 250;
export const DESC_MAX = 450;

export function clean(s: string): string {
  return s
    .replace(/\s*\|\s*Minialife\b/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\b(\w+)( \1\b)+/gi, "$1")
    .replace(/National Park National Park/gi, "National Park")
    .replace(/\s+([.,!?:;])/g, "$1")
    .replace(/([.!?])\1+/g, "$1")
    .trim();
}

export function isBroken(s: string): boolean {
  return !s.trim() || /\b(undefined|null|NaN)\b/.test(s);
}

function sentences(s: string | null | undefined): string[] {
  if (!s) return [];
  return clean(s)
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 20 && /[.!?]$/.test(x));
}

function durLabel(d: string): string {
  return d.replace(/\s*days?$/i, "").replace(/\s*-\s*/, "–") + " Day";
}

export function pinTitle(p: PinInput): string {
  const n = clean(p.name);
  let t: string;
  switch (p.kind) {
    case "destination":
      t = `${n} Road Trip: Free Route Map & Trip Plan`;
      break;
    case "best_time":
      t = `Best Time to Visit ${n} (Month-by-Month Guide)`;
      break;
    case "things_to_do": {
      const m = p.seoTitle?.match(/\b(\d{1,2})\s+(?:Best\s+)?Things/i);
      t = m ? `${m[1]} Best Things to Do in ${n}` : `Best Things to Do in ${n}: Outdoor Guide`;
      break;
    }
    case "glamping":
      t = `Best Glamping & RV Stays Near ${n}`;
      break;
    case "trip_planner":
      t = p.duration ? `${n} Itinerary: ${durLabel(p.duration)} Trip Plan` : `${n} Itinerary: Day-by-Day Trip Plan`;
      break;
  }
  t = clean(t);
  if (t.length > TITLE_MAX) t = t.slice(0, TITLE_MAX).replace(/\s+\S*$/, "");
  return t;
}

const CTA: Record<PinKind, string> = {
  destination: "Tap to get the free route map and full trip plan.",
  best_time: "Tap to see the month-by-month guide and plan your dates.",
  things_to_do: "Tap for the full list of outdoor activities and a free trip plan.",
  glamping: "Tap to compare stays and get the free trip plan.",
  trip_planner: "Tap for the day-by-day plan and free route map.",
};

const FILLER: Record<PinKind, string> = {
  destination: "Includes where to stay, scenic stops and gear tips.",
  best_time: "Covers weather, crowds and the best seasons for outdoor trips.",
  things_to_do: "Covers hikes, scenic drives and family-friendly ideas.",
  glamping: "Covers cabins, glamping sites and RV-friendly campgrounds.",
  trip_planner: "Covers where to stay, scenic stops and what to book ahead.",
};

const KIND_TAGS: Record<PinKind, string[]> = {
  destination: ["#roadtrip", "#travelguide"],
  best_time: ["#travelplanning", "#besttimetovisit"],
  things_to_do: ["#thingstodo", "#outdooradventure"],
  glamping: ["#glamping", "#rvlife"],
  trip_planner: ["#itinerary", "#roadtrip"],
};

export function pinTags(p: PinInput): string[] {
  const place = "#" + clean(p.name).toLowerCase().replace(/national park/g, "").replace(/[^a-z0-9]/g, "");
  const tags = [place, ...KIND_TAGS[p.kind]];
  if (/national park/i.test(p.name)) tags.push("#nationalparks");
  else tags.push("#ustravel");
  return [...new Set(tags.filter((t) => t.length > 2))].slice(0, 5);
}

export function pinDescription(p: PinInput): string {
  const source = p.kind === "destination" ? [...sentences(p.tagline), ...sentences(p.seoDescription)] : [...sentences(p.seoDescription), ...sentences(p.tagline)];
  const facts: string[] = [];
  if (p.bestSeason && p.kind !== "glamping") facts.push(`Best time: ${clean(p.bestSeason)}.`);
  if (p.duration && (p.kind === "destination" || p.kind === "trip_planner")) facts.push(`Plan ${clean(p.duration)}.`);
  if (p.airport && p.kind !== "best_time") facts.push(`Nearest airport: ${p.airport}.`);
  const tags = pinTags(p).join(" ");
  const fit = (parts: string[]) => clean(parts.join(" ")) + " " + tags;

  let body = [source[0] ?? "", ...facts, CTA[p.kind]].filter(Boolean);
  // Too long: drop facts from the end, then nothing else (CTA always stays).
  while (fit(body).length > DESC_MAX && body.length > 2) body.splice(body.length - 2, 1);
  // Too short: add a second real sentence, then a factual filler line.
  for (const extra of [source[1], FILLER[p.kind], "Every guide is free and written for road trippers.", "Save this pin for your next outdoor trip."]) {
    if (fit(body).length >= DESC_MIN || !extra) continue;
    const next = [...body.slice(0, -1), extra, body[body.length - 1]];
    if (fit(next).length <= DESC_MAX) body = next;
  }
  return fit(body);
}
