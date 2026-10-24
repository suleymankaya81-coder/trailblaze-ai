// Badge text from the cached Aviasales fare; hidden (null) when missing or implausibly low.
export function flightFareBadge(price: number | null | undefined): string | null {
  if (price == null || !Number.isFinite(price) || price < 40) return null; // very low cached fares are usually short regional legs
  return `Recent fares from ~$${Math.round(price)}`;
}
