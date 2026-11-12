import { describe, expect, it } from "vitest";
import { CHILDREN, destinationAlternates, parseChild, urlsetXml } from "./sitemap.server";

describe("country-split sitemaps", () => {
  it("lists US destination, German and guide sitemaps", () => {
    expect(CHILDREN).toEqual(expect.arrayContaining(["us-destinations", "de-us-destinations", "us-guides-glamping"]));
    expect(CHILDREN).not.toContain("destinations");
  });
  it("parses country children", () => {
    expect(parseChild("us-guides-glamping")).toEqual({ country: "us", kind: "guides-glamping" });
    expect(parseChild("de-us-destinations")).toEqual({ country: "us", kind: "de-destinations" });
  });
  it("keeps old names answerable", () => expect(parseChild("destinations")).toEqual({ country: null, kind: "destinations" }));
  it("rejects unknown names", () => expect(parseChild("fr-destinations")).toBeNull());
  it("emits en/de/x-default hreflang", () => {
    const xml = urlsetXml([{ loc: "https://minialife.com/destinations/us/maine/acadia", alternates: destinationAlternates("acadia") }]);
    expect(xml).toContain('hreflang="de" href="https://minialife.com/de/destinations/us/maine/acadia"');
    expect(xml).toContain('hreflang="x-default" href="https://minialife.com/destinations/us/maine/acadia"');
  });
});
