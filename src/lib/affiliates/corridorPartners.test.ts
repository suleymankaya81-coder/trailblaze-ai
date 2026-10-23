import { describe, expect, it } from "vitest";
import { corridorPartnerLinks, verifiedViatorProductUrl } from "./corridorPartners";

describe("Grand Circle partner attribution", () => {
  it("uses the approved car and eSIM links with corridor attribution", () => {
    const links = corridorPartnerLinks("grand-circle-from-las-vegas");
    expect(new URL(links.car).hostname).toBe("economybookings.tpm.lv");
    expect(new URL(links.esim).hostname).toBe("airalo.tpm.lv");
    expect(new URL(links.flight).searchParams.get("sub_id")).toBe("grand-circle-from-las-vegas");
    expect(links.motorhome).toBe("https://www.motorhomerepublic.com/usa/?affiliate=minialife");
  });
  it("preserves verified direct Viator API attribution without Awin", () => {
    const link = "https://www.viator.com/tours/Page/Upper-Antelope-Canyon-Tour/d23393-142864P1?pid=P00327298&mcid=42383&medium=api&api_version=2.0";
    expect(verifiedViatorProductUrl(link)).toBe(link);
    expect(verifiedViatorProductUrl(link.replace("P00327298", "OTHER"))).toBeNull();
    expect(verifiedViatorProductUrl(link.replace("www.viator.com", "example.com"))).toBeNull();
  });
});