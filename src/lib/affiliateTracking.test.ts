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
  it("uses the park slug, not the country, on English and German pages", () => {
    expect(pageContext("/destinations/us/wyoming/yellowstone")).toEqual({ page_type: "destination", destination_slug: "yellowstone" });
    expect(pageContext("/de/destinations/no/mre-og-romsdal/geirangerfjord")).toEqual({ page_type: "destination", destination_slug: "geirangerfjord" });
  });
  it("does not label eSIM and luggage links as flights", () => {
    expect(classifyPartnerLink("https://airalo.tpm.lv/Cl55ghx0")).toEqual({ partner: "airalo", category: "esim" });
    expect(classifyPartnerLink("https://radicalstorage.tpm.lv/cRmtR6gn")).toEqual({ partner: "radicalstorage", category: "luggage" });
  });
  it("identifies Campspot separately from gear merchants", () => {
    expect(classifyPartnerLink("https://www.awin1.com/cread.php?awinmid=22326&awinaffid=3115962")).toEqual({ partner: "campspot", category: "stay" });
  });
});
