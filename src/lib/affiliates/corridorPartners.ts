import { tpLink } from "./travelpayouts";
import { airportRentalsLink, motorhomeRepublicLink } from "./webjet";
import { rvLinkFor } from "./countryPartners";
import geo from "@/data/destination-geo.json";

const countryOf = (slug: string) => ((geo as Record<string, string>)[slug] ?? "us").split("/")[0];

export function corridorPartnerLinks(slug: string) {
  return {
    flight: tpLink("aviasales", slug),
    car: airportRentalsLink(),
    esim: tpLink("airalo", slug),
    // Country-aware: Canadian places use the Canada search, never the US-only campaign page.
    motorhome: countryOf(slug) === "us" ? motorhomeRepublicLink() : rvLinkFor(countryOf(slug)) ?? motorhomeRepublicLink("/canada/"),
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