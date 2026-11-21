import { withViatorAffiliate } from "./viator";
import { viatorPlaceQuery } from "./viatorPlaceIdentity";
/** Search links are not listings and never promise availability or prices. */
export function viatorPlaceSearchUrl(name: string, country = "us"): string {
  const url = new URL("https://www.viator.com/searchResults/all");
  url.searchParams.set("text", viatorPlaceQuery(name, country));
  return withViatorAffiliate(url.toString());
}