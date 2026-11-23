import { describe, expect, it, vi } from "vitest";
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
  it("does not confuse the no-reservation feed with Norway's no country code", () => {
    expect(parseChild("no-reservation")).toEqual({ country: null, kind: "no-reservation" });
    expect(parseChild("no-destinations")).toEqual({ country: "no", kind: "destinations" });
  });
  it("parses the new France/Portugal/Greece children", () => {
    expect(parseChild("fr-destinations")).toEqual({ country: "fr", kind: "destinations" });
    expect(parseChild("pt-guides-glamping")).toEqual({ country: "pt", kind: "guides-glamping" });
    expect(parseChild("gr-destinations")).toEqual({ country: "gr", kind: "destinations" });
  });
  it("lists France/Portugal/Greece sitemap children once their places are published", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.test");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([{ entity_id: "acadia" }]))));
    const res = await buildSitemapResponse();
    const body = await res.text();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    expect(body).toMatch(/\/sitemaps\/fr-destinations\.xml/);
    expect(body).toMatch(/\/sitemaps\/pt-destinations\.xml/);
    expect(body).toMatch(/\/sitemaps\/gr-destinations\.xml/);
    expect(body).toMatch(/\/sitemaps\/us-destinations\.xml/);
    expect(body).toContain("/sitemaps/fr-us-destinations.xml");
    expect(body).not.toContain("/sitemaps/fr-nz-destinations.xml");
  });
  it("distinguishes France from the French language", () => {
    expect(parseChild("fr-destinations")).toEqual({ country: "fr", kind: "destinations" });
    expect(parseChild("fr-fr-destinations")).toEqual({ country: "fr", kind: "fr-destinations" });
    expect(parseChild("fr-us-destinations")).toEqual({ country: "us", kind: "fr-destinations" });
  });
  it("emits only the available destination languages", () => {
    const links = destinationAlternates("acadia", ["fr"]);
    expect(links.map(l => l.lang)).toEqual(["en", "fr", "x-default"]);
    expect(links[1]?.href).toBe("https://wildparkroutes.com/fr/destinations/us/maine/acadia");
  });
  it("emits en/de/x-default hreflang", () => {
    const xml = urlsetXml([{ loc: "https://wildparkroutes.com/destinations/us/maine/acadia", alternates: destinationAlternates("acadia") }]);
    expect(xml).toContain('hreflang="de" href="https://wildparkroutes.com/de/destinations/us/maine/acadia"');
    expect(xml).toContain('hreflang="x-default" href="https://wildparkroutes.com/destinations/us/maine/acadia"');
  });
});
