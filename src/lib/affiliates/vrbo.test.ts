import { describe, expect, it } from "vitest";
import { buildVrboSearchUrl } from "./vrbo";

describe("buildVrboSearchUrl", () => {
  it("carries the creator tracking ids and the destination search", () => {
    const url = new URL(buildVrboSearchUrl("Yellowstone National Park"));
    expect(url.origin + url.pathname).toBe("https://vrbo.com/affiliate");
    expect(url.searchParams.get("camref")).toBe("1110lRsGV");
    expect(url.searchParams.get("creativeref")).toBe("1101l63118");
    expect(url.searchParams.get("landingPage")).toBe(
      "https://www.vrbo.com/search?destination=Yellowstone%20National%20Park",
    );
  });
});
