import { describe, expect, it } from "vitest";
import { buildExpediaHotelSearchUrl } from "./expedia";
import { buildVrboSearchUrl } from "./vrbo";

describe("affiliate links", () => {
  it("Expedia link carries the Expedia camref, not Vrbo's", () => {
    const u = new URL(buildExpediaHotelSearchUrl("Yellowstone National Park"));
    expect(u.host).toBe("expedia.com");
    expect(u.searchParams.get("camref")).toBe("1101l6uPqy");
    expect(u.searchParams.get("creativeref")).toBe("1100l68075");
    expect(u.searchParams.get("landingPage")).toBe(
      "https://www.expedia.com/Hotel-Search?destination=Yellowstone%20National%20Park",
    );
  });
  it("Vrbo link carries the Vrbo camref", () => {
    const u = new URL(buildVrboSearchUrl("Zion"));
    expect(u.searchParams.get("camref")).toBe("1110lRsGV");
  });
});
