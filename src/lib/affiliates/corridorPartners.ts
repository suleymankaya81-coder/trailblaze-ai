import { tpLink } from "./travelpayouts";

export const GRAND_CIRCLE_EXPERIENCES = [
  { code: "142864P1", search: "Antelope Canyon tour Page Arizona", stop: "Page · Antelope Canyon" },
  { code: "275883P1", search: "Zion National Park guided tour Springdale", stop: "Springdale · Zion" },
  { code: "5847LASWIN", search: "Grand Canyon helicopter Las Vegas", stop: "Las Vegas · Grand Canyon West" },
] as const;

export function corridorPartnerLinks(slug: string) {
  return {
    flight: tpLink("aviasales", slug),
    car: tpLink("economybookings", slug),
    esim: tpLink("airalo", slug),
    motorhome: "https://www.motorhomerepublic.com/usa/",
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