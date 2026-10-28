import { describe, expect, it } from "vitest";
import { classifyPartnerLink, pageContext } from "./affiliateTracking";

describe("affiliate click tracking", () => {
  it("classifies rental partners", () => {
    expect(classifyPartnerLink("https://www.motorhomerepublic.com/x?a=1")).toEqual({ partner: "motorhome_republic", category: "rv" });
    expect(classifyPartnerLink("https://www.airportrentals.com/")).toEqual({ partner: "airport_rentals", category: "car" });
  });
  it("ignores internal links", () => {
    expect(classifyPartnerLink("https://minialife.com/destinations/acadia")).toBeNull();
  });
  it("reads destination slug from path", () => {
    expect(pageContext("/destinations/grand-canyon")).toEqual({ page_type: "destination", destination_slug: "grand-canyon" });
  });
});
