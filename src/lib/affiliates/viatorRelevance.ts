const GENERIC = new Set("national park parks state forest forests wilderness area recreation preserve monument scenic trail river lake lakes beach beaches coast coastal valley mountain mountains region city town island islands the and of usa united states".split(" "));
const words = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z0-9]+/g) ?? [];

/** Free-text search can return unrelated destinations; require a place-specific name in provider text. */
export function isPlaceExperienceRelevant(name: string, title: string, description = ""): boolean {
  const terms = words(name).filter((word) => word.length > 2 && !GENERIC.has(word));
  if (!terms.length) return false;
  const text = new Set(words(`${title} ${description}`));
  return terms.every((term) => text.has(term));
}