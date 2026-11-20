import type { AffiliateAdapter } from "./types";
export const VIATOR_PID = "P00327298";
export const VIATOR_MCID = "42383";

/** Manual links use the approved direct account; API-issued attribution stays intact. */
export function withViatorAffiliate(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" || !/^(www\.)?viator\.com$/.test(url.hostname)) throw new Error("Invalid Viator booking URL");
  url.searchParams.delete("aff_id");
  url.searchParams.delete("sub_id");
  url.searchParams.set("pid", VIATOR_PID);
  url.searchParams.set("mcid", VIATOR_MCID);
  if (url.searchParams.get("medium") !== "api") url.searchParams.set("medium", "link");
  return url.toString();
}

export const viatorAdapter: AffiliateAdapter = {
  partner: "viator",
  buildDeepLink(offer) {
    return withViatorAffiliate(offer.externalUrl || "https://www.viator.com");
  },
};
