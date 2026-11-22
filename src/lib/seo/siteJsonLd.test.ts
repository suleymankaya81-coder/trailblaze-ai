import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CONTACT_EMAIL, LOGO_PATH, LOGO_SIZE, ORGANIZATION_SAME_AS, SITE_ORIGIN } from "@/config/site";
import { ORGANIZATION_ID, organizationJsonLd, siteJsonLd } from "./siteJsonLd";
import { guideArticleJsonLd } from "./guideArticleJsonLd";
import { destGuideJsonLd } from "./guides";

const pngSize = (path: string) => {
  const b = readFileSync(path);
  expect(b.subarray(1, 4).toString()).toBe("PNG");
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
};

describe("Organization schema", () => {
  it("uses a square logo of at least 112×112 px that exists in public/", () => {
    const { width, height } = pngSize(`public${LOGO_PATH}`);
    expect(width).toBe(height);
    expect(width).toBeGreaterThanOrEqual(112);
    expect(width).toBe(LOGO_SIZE);
    expect(organizationJsonLd().logo).toMatchObject({ url: `${SITE_ORIGIN}${LOGO_PATH}`, width: LOGO_SIZE, height: LOGO_SIZE });
  });
  it("uses the configured contact email, never the legacy minialife.com address", () => {
    expect(organizationJsonLd().email).toBe(CONTACT_EMAIL);
    expect(JSON.stringify(siteJsonLd())).not.toContain("minialife");
  });
  it("lists sameAs only from configured real profiles", () => {
    const org = organizationJsonLd();
    if (ORGANIZATION_SAME_AS.length) expect(org.sameAs).toEqual([...ORGANIZATION_SAME_AS]);
    else expect(org).not.toHaveProperty("sameAs");
    for (const u of ORGANIZATION_SAME_AS) expect(u).toMatch(/^https:\/\//);
  });
  it("has exactly one Organization node with the shared @id", () => {
    const orgs = (siteJsonLd()["@graph"] as { "@type": string; "@id"?: string }[]).filter((n) => n["@type"] === "Organization");
    expect(orgs).toHaveLength(1);
    expect(orgs[0]["@id"]).toBe(ORGANIZATION_ID);
  });
});

describe("guide Articles reference the single Organization", () => {
  it("place guides (best time, itinerary, glamping)", () => {
    const a = guideArticleJsonLd({ headline: "Best Time to Visit Zion", description: "d", url: "https://wildparkroutes.com/x", sections: [] });
    expect(a.publisher).toEqual({ "@id": ORGANIZATION_ID });
    expect(a.author).toEqual({ "@id": ORGANIZATION_ID });
    expect(JSON.stringify(a)).not.toContain('"Organization"');
  });
  it("Phase B guides (no-reservation, rv-camping)", () => {
    const g = destGuideJsonLd({ name: "Zion", slug: "zion", heroImage: "", faqs: [], url: "https://wildparkroutes.com/no-reservation/zion", label: "No reservation", title: "t" });
    const art = (g["@graph"] as Record<string, unknown>[])[0];
    expect(art.publisher).toEqual({ "@id": ORGANIZATION_ID });
    expect(art.author).toEqual({ "@id": ORGANIZATION_ID });
  });
});
