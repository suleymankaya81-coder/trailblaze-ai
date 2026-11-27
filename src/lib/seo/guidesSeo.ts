// Search-phrase titles/descriptions for the per-destination RV & camping and
// no-reservation guides. Keywords from Semrush US data (Oct 2026):
// "{name} rv camping" (e.g. "yellowstone rv camping", 590/mo) and
// "{name} reservations" (e.g. "yellowstone reservations", 1,600/mo; top
// question "do you need a reservation for {name}"). Distinct phrase families
// from the destination guide ("{name} travel guide") and the four search pages.
import { BRAND, DESCRIPTION_MAX, TITLE_MAX, fitText } from "./routeSeo";
import { formatDriveShort } from "./flyDrive";

export type GuideSeoInput = {
  name: string;
  airportCode: string | null;
  driveMinutes: number | null;
  permitLevel?: string | null;
};

export function rvCampingTitle(d: GuideSeoInput): string {
  return fitText(
    [
      // Stored fact first: the pickup airport and drive time.
      ...(d.airportCode && d.driveMinutes != null ? [`${d.name} RV Camping: ${d.airportCode} Pickup, ${formatDriveShort(d.driveMinutes)} Drive${BRAND}`, `${d.name} RV Camping: Pick Up at ${d.airportCode}${BRAND}`] : []),
      `${d.name} RV Camping: RV Parks, Campgrounds & Route${BRAND}`,
      `${d.name} RV Camping: Parks & Campgrounds${BRAND}`,
      `${d.name} RV Camping Guide${BRAND}`,
      `${d.name} RV Camping${BRAND}`,
      `${d.name} RV Camping`,
    ],
    TITLE_MAX,
  );
}

export function rvCampingDescription(d: GuideSeoInput): string {
  const drive =
    d.airportCode && d.driveMinutes != null
      ? `the ${formatDriveShort(d.driveMinutes)} drive from ${d.airportCode}, `
      : "";
  return fitText(
    [
      `Plan an RV or camping trip to ${d.name}: RV parks and campgrounds near ${d.name}, ${drive}motorhome rentals and overnight stops.`,
      `Plan an RV or camping trip to ${d.name}: RV parks and campgrounds near ${d.name}, motorhome rentals and overnight stops.`,
      `RV camping near ${d.name}: RV parks, campgrounds, motorhome rentals and overnight stops.`,
      `RV camping near ${d.name}: RV parks, campgrounds and motorhome rentals.`,
    ],
    DESCRIPTION_MAX,
  );
}

export function noReservationTitle(d: GuideSeoInput): string {
  return fitText(
    [
      // Stored permit level as the fact in the title.
      ...(d.permitLevel === "high" ? [`${d.name} Reservations: High Demand, Entry Rules${BRAND}`] : d.permitLevel === "moderate" ? [`${d.name} Reservations: Entry Rules & Backup Plans${BRAND}`] : []),
      `${d.name} Reservations: Entry Rules & Backup Plans${BRAND}`,
      `${d.name} Reservations & Entry Rules${BRAND}`,
      `Visit ${d.name} Without a Reservation${BRAND}`,
      `${d.name} Reservations${BRAND}`,
      `${d.name} Reservations`,
    ],
    TITLE_MAX,
  );
}

export function noReservationDescription(d: GuideSeoInput): string {
  return fitText(
    [
      `Do you need a reservation for ${d.name}? Current entry rules, timing tips to get in without one, nearby no-booking alternatives, plus flights and car rental.`,
      `Do you need a reservation for ${d.name}? Entry rules, timing tips to get in without one and nearby no-booking alternatives.`,
      `${d.name} reservations: entry rules, timing tips to get in without one and nearby places with no booking.`,
      `${d.name} reservations: entry rules and how to visit without one.`,
    ],
    DESCRIPTION_MAX,
  );
}
