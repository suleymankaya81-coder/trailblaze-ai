// Webjet Group affiliate programme (Motorhome Republic + Airport Rentals), code "minialife".
export const WEBJET_AFFILIATE = "minialife";

export function withWebjetAffiliate(url: string): string {
  try {
    const u = new URL(url);
    if (!/(^|\.)(motorhomerepublic|airportrentals)\.com$/.test(u.hostname)) return url;
    u.searchParams.set("affiliate", WEBJET_AFFILIATE);
    return u.toString();
  } catch {
    return url;
  }
}
export const motorhomeRepublicLink = (path = "/usa/") => withWebjetAffiliate(`https://www.motorhomerepublic.com${path}`);
export const airportRentalsLink = () => withWebjetAffiliate("https://www.airportrentals.com/");
