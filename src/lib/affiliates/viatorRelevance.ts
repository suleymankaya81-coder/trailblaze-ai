const GENERIC = new Set("national park parks country landscape aonb state forest forests wilderness area recreation preserve monument scenic trail river lake lakes beach beaches coast coastal valley mountain mountains region city town island islands the and of usa united states".split(" "));
const words = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z0-9]+/g) ?? [];

/** Free-text search can return unrelated destinations; require a place-specific name in provider text. */
export function isPlaceExperienceRelevant(name: string, title: string, description = "", context?: { countryCode?: string | null; region?: string | null }): boolean {
  const terms = words(name).filter((word) => word.length > 2 && !GENERIC.has(word));
  if (!terms.length) return false;
  const text = new Set(words(`${title} ${description}`));
  // Same-name destinations abroad require affirmative Canadian geography.
  if (context?.countryCode === "ca") {
    const geography = [...words(context.region ?? "").filter(w => w.length > 2), "canada", "canadian"];
    if (!geography.some(term => text.has(term))) return false;
  }
  if (context?.countryCode === "gb") {
    const geography = [...words(context.region ?? "").filter(w => w.length > 2), "uk", "britain", "british", "england", "scotland", "wales", "english", "scottish", "welsh"];
    if (!geography.some(term => text.has(term))) return false;
  }
  return terms.every((term) => text.has(term));
}

/** Fallback for places with no named listing: a gateway town or the place's distinctive area must be named, with the same country checks. */
export function isNearbyExperienceRelevant(title: string, description = "", context: { gateways?: string[] | null; area?: string | null; state?: string | null; countryCode?: string | null }): boolean {
  const text = new Set(words(`${title} ${description}`));
  const geo = context.countryCode === "ca" ? [...words(context.state ?? ""), "canada", "canadian"]
    : context.countryCode === "gb" ? [...words(context.state ?? ""), "uk", "britain", "british", "england", "scotland", "wales", "english", "scottish", "welsh", "ireland"]
    : null;
  if (geo && !geo.some((term) => text.has(term))) return false;
  const stateWords = new Set(words(context.state ?? ""));
  const has = (phrase: string, min: number) => {
    const terms = words(phrase).filter((w) => w.length > 2 && !GENERIC.has(w) && !stateWords.has(w) && !DIRECTIONS.has(w));
    return terms.length >= min && terms.every((t) => text.has(t));
  };
  return (context.gateways ?? []).some((g) => has(g, 1)) || has(context.area ?? "", 2);
}
const DIRECTIONS = new Set("north south east west northern southern eastern western northeastern northwestern southeastern southwestern central upper lower greater".split(" "));
