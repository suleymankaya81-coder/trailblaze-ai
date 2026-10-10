/**
 * Expedia hotel links via the Expedia Group Travel Creator Program.
 * Format verified from a Link Builder output:
 * expedia.com/affiliate?siteid=1&landingPage=<url>&camref=<id>&creativeref=<id>
 * Expedia uses a different camref than Vrbo.
 */
export const EXPEDIA_CAMREF = "1101l6uPqy";
export const EXPEDIA_CREATIVEREF = "1100l68075";

export function buildExpediaHotelSearchUrl(destinationName: string): string {
  const landing = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destinationName)}`;
  const params = new URLSearchParams({
    siteid: "1",
    landingPage: landing,
    camref: EXPEDIA_CAMREF,
    creativeref: EXPEDIA_CREATIVEREF,
  });
  return `https://expedia.com/affiliate?${params.toString()}`;
}
