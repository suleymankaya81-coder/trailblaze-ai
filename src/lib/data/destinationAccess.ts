import access from "@/data/destination-access.json";
/** Reviewed non-road places cannot receive driving actions or vehicle pickup claims. */
const accessOf = (slug: string, accessType?: string | null) => accessType ?? (access as Record<string, string>)[slug];
export const isNonRoadDestination = (slug: string, accessType?: string | null): boolean =>
  ["fly-in", "ferry"].includes(accessOf(slug, accessType) ?? "");
/** Islands reached by scheduled boat: no road route, but not an expedition. */
export const isFerryDestination = (slug: string, accessType?: string | null): boolean => accessOf(slug, accessType) === "ferry";
export function isOfferEligibleForPlace(partner: string | null, country: string, nonRoad: boolean, category: string): boolean {
  if (country !== "us" && ["roverpass", "campspot", "harvest_hosts"].includes(partner ?? "")) return false;
  return !(nonRoad && (category === "rv_rental" || category === "car_rental"));
}