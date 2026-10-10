/**
 * Vrbo links via the Expedia Group Travel Creator Program.
 * Format verified from a Link Builder output: vrbo.com/affiliate?landingPage=<url>&camref=<id>&creativeref=<id>
 */
export const VRBO_CAMREF = "1110lRsGV";
export const VRBO_CREATIVEREF = "1101l63118";

export function buildVrboSearchUrl(destinationName: string): string {
  const landing = `https://www.vrbo.com/search?destination=${encodeURIComponent(destinationName)}`;
  const params = new URLSearchParams({
    landingPage: landing,
    camref: VRBO_CAMREF,
    creativeref: VRBO_CREATIVEREF,
  });
  return `https://vrbo.com/affiliate?${params.toString()}`;
}
