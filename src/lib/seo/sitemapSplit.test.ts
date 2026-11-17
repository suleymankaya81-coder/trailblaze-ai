import { describe, expect, it } from "vitest";
import { buildSitemapResponse, CHILDREN, destinationAlternates, parseChild, urlsetXml } from "./sitemap.server";

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
  it("rejects unknown names", () => expect(parseChild("jp-destinations")).toBeNull());
  it("parses the new France/Portugal/Greece children", () => {
    expect(parseChild("fr-destinations")).toEqual({ country: "fr", kind: "destinations" });
    expect(parseChild("pt-guides-glamping")).toEqual({ country: "pt", kind: "guides-glamping" });
    expect(parseChild("gr-destinations")).toEqual({ country: "gr", kind: "destinations" });
  });
  it("lists France/Portugal/Greece sitemap children once their places are published", async () => {
    const res = await buildSitemapResponse();
    const body = await res.text();
    expect(body).toMatch(/\/sitemaps\/fr-destinations\.xml/);
    expect(body).toMatch(/\/sitemaps\/pt-destinations\.xml/);
    expect(body).toMatch(/\/sitemaps\/gr-destinations\.xml/);
    expect(body).toMatch(/\/sitemaps\/us-destinations\.xml/);
  });
  it("emits en/de/x-default hreflang", () => {
    const xml = urlsetXml([{ loc: "https://wildparkroutes.com/destinations/us/maine/acadia", alternates: destinationAlternates("acadia") }]);
    expect(xml).toContain('hreflang="de" href="https://wildparkroutes.com/de/destinations/us/maine/acadia"');
    expect(xml).toContain('hreflang="x-default" href="https://wildparkroutes.com/destinations/us/maine/acadia"');
  });
});
