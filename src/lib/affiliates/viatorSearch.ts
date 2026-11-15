/** Search links are not listings and never promise availability or prices. */
export function viatorPlaceSearchUrl(name: string, country = "us"): string {
  const countries: Record<string, string> = { us: "USA", ca: "Canada", gb: "United Kingdom" };
  const url = new URL("https://www.viator.com/searchResults/all");
  url.searchParams.set("text", `${name} ${countries[country] ?? country}`);
  url.searchParams.set("pid", "P00327298");
  url.searchParams.set("mcid", "42383");
  url.searchParams.set("medium", "link");
  return url.toString();
}