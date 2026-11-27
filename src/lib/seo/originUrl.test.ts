import { describe, expect, it } from "vitest";
import { toCurrentOrigin } from "./originUrl";
import { toAbsoluteImageUrl } from "./imageCredit";
import { guideCover, uniqueImages } from "./sitemap.server";

// The 8 distinct legacy URLs found in the live sitemaps and hub covers (2026-11-27); all are served
// with HTTP 200 (image/jpeg) on https://wildparkroutes.com at the same path.
const LEGACY = [
  "https://minialife.com/__l5e/assets-v1/3f60001e-bd23-42c4-813f-eff8f7710b93/sarasota-landscape.jpg",
  "https://minialife.com/__l5e/assets-v1/5014d0bb-d768-4886-a76b-9016696ae246/dallas-fort-worth-landscape.jpg",
  "https://minialife.com/__l5e/assets-v1/5aa03390-b176-4f80-ad3b-76713d09fd4b/williams-landscape.jpg",
  "https://minialife.com/__l5e/assets-v1/823ea13f-1a0e-42d0-b69b-602691137913/branson-landscape.jpg",
  "https://minialife.com/__l5e/assets-v1/a889123b-c600-4cf7-8358-aa4865785fda/buena-vista-landscape.jpg",
  "https://minialife.com/__l5e/assets-v1/c8e601ba-505e-4006-895a-09e2ed8879f5/ely-ward-mountain.jpg",
  "https://minialife.com/__l5e/assets-v1/cfd07980-0133-471a-a118-6c4407387831/seattle-landscape.jpg",
  "https://minialife.com/__l5e/assets-v1/dac05e82-02cc-4839-9809-00ce3e214022/sacramento-american-river.jpg",
];

describe("legacy-domain image URLs", () => {
  it("are rewritten to the current origin, keeping the path", () => {
    for (const u of LEGACY) expect(toCurrentOrigin(u)).toBe(u.replace("https://minialife.com", "https://wildparkroutes.com"));
    expect(toCurrentOrigin("https://www.minialife.com/__l5e/x.jpg")).toBe("https://wildparkroutes.com/__l5e/x.jpg");
  });
  it("leave other hosts, relative paths and empty values unchanged", () => {
    for (const u of ["https://upload.wikimedia.org/wikipedia/commons/a/ab/Zion.jpg", "/__l5e/assets-v1/a/b.jpg", "https://wildparkroutes.com/logo-512.png", "not a url"]) expect(toCurrentOrigin(u)).toBe(u);
    expect(toCurrentOrigin(null)).toBeNull();
    expect(toCurrentOrigin("")).toBe("");
  });
  it("never reach sitemap images, guide covers or JSON-LD images", () => {
    expect(uniqueImages(LEGACY).every((u) => u.startsWith("https://wildparkroutes.com/__l5e/"))).toBe(true);
    expect(guideCover("/no-such-guide", null, LEGACY[6])).toBe("https://wildparkroutes.com/__l5e/assets-v1/cfd07980-0133-471a-a118-6c4407387831/seattle-landscape.jpg");
    expect(toAbsoluteImageUrl(LEGACY[0])).not.toContain("minialife");
  });
});
