import { airportRentalsLink, motorhomeRepublicLink } from "./webjet";

export const RENTAL_PARTNERS = ["motorhome_republic", "airport_rentals"] as const;
export const RETIRED_CAR_PARTNERS = ["rentcars", "rent_cars", "economybookings", "qeeq", "discover_cars"];

export function isRentalCategory(category: string): boolean {
  return ["rv_rental", "gear_rental", "car_rental"].includes(category);
}

export function isApprovedRental(partner: string | null, category: string): boolean {
  return !isRentalCategory(category) || RENTAL_PARTNERS.some((p) => p === partner);
}

export function rentalPartnerUrl(partner: string | null): string | null {
  if (partner === "motorhome_republic") return motorhomeRepublicLink();
  if (partner === "airport_rentals" || RETIRED_CAR_PARTNERS.includes(partner ?? "")) return airportRentalsLink();
  return null;
}