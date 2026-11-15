import access from "@/data/destination-access.json";
/** Reviewed non-road places cannot receive driving actions or vehicle pickup claims. */
export const isNonRoadDestination = (slug: string, accessType?: string | null): boolean =>
  (accessType ?? (access as Record<string, string>)[slug]) === "fly-in";
export function isOfferEligibleForPlace(partner: string | null, country: string, nonRoad: boolean, category: string): boolean {
  if (country !== "us" && ["roverpass", "campspot", "harvest_hosts"].includes(partner ?? "")) return false;
  return !(nonRoad && (category === "rv_rental" || category === "car_rental"));
}