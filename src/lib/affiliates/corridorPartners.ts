import { tpLink } from "./travelpayouts";
import { airportRentalsLink, motorhomeRepublicLink } from "./webjet";

export function corridorPartnerLinks(slug: string) {
  return {
    flight: tpLink("aviasales", slug),
    car: tpLink("economybookings", slug),
    esim: tpLink("airalo", slug),
    motorhome: motorhomeRepublicLink(),
    airportRentals: airportRentalsLink(),
  };
}

/** Keep Viator's API attribution (medium=api) rather than rewriting it as a manually generated link. */
export function verifiedViatorProductUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "www.viator.com" || !url.pathname.startsWith("/tours/")) return null;
    if (url.searchParams.get("pid") !== "P00327298" || url.searchParams.get("mcid") !== "42383") return null;
    return url.toString();
  } catch {
    return null;
  }
}