import { isMhrBlackFridayLive, MHR_BF_DEAL_PATH } from "./mhrBlackFriday";
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
export const motorhomeRepublicLink = (path?: string, now = Date.now()) =>
  withWebjetAffiliate(`https://www.motorhomerepublic.com${path ?? (isMhrBlackFridayLive(now) ? MHR_BF_DEAL_PATH : "/usa/")}`);
export const airportRentalsLink = () => withWebjetAffiliate("https://www.airportrentals.com/");
