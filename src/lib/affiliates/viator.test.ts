import { describe, expect, it } from "vitest";
import { viatorAdapter, withViatorAffiliate } from "./viator";
import { buildAwinLink } from "./awin";

describe("approved direct Viator attribution", () => {
  it("replaces legacy Awin programme 11018 with the confirmed direct account", () => {
    const value = buildAwinLink({ id: "legacy", partner: "viator", networkMid: 11018, externalUrl: "https://www.viator.com/searchResults/all?text=Yellowstone" }, "audit");
    const url = new URL(value);
    expect(url.hostname).toBe("www.viator.com");
    expect(url.searchParams.get("pid")).toBe("P00327298");
    expect(url.searchParams.get("mcid")).toBe("42383");
    expect(url.searchParams.get("medium")).toBe("link");
  });
  it("preserves API medium and version", () => {
    const url = new URL(withViatorAffiliate("https://www.viator.com/tours/test/product?pid=P00327298&mcid=42383&medium=api&api_version=2.0"));
    expect(url.searchParams.get("medium")).toBe("api");
    expect(url.searchParams.get("api_version")).toBe("2.0");
  });
  it("adapter never sends obsolete placeholder attribution", () => {
    const url = new URL(viatorAdapter.buildDeepLink({ id: "x", partner: "viator", externalUrl: "https://www.viator.com/?aff_id=old&sub_id=old" }, { sessionId: "s", destinationSlug: "yellowstone" }));
    expect(url.searchParams.has("aff_id")).toBe(false);
    expect(url.searchParams.get("pid")).toBe("P00327298");
  });
  it("rejects unrelated hosts", () => expect(() => withViatorAffiliate("https://viator.com.example.org/")).toThrow());
});