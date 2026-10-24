import { describe, expect, it } from "vitest";
import { commonsFilePage, parsePhotoCredit, toAbsoluteImageUrl } from "./imageCredit";
import { guideCover, uniqueImages, urlsetXml } from "./sitemap.server";
import { buildDestinationImages } from "./destinationJsonLd";

const credit = "Hero: Palacemusic / CC BY-SA 3.0 via Wikimedia Commons · Gallery: Hustvedt / CC BY-SA 3.0 via Wikimedia Commons; Thomas Wolf, www.foto-tw.de / CC BY 4.0 via Wikimedia Commons";
const hero = "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Double_arch.jpg/1920px-Double_arch.jpg";

describe("image credit parsing", () => {
  it("preserves verified alternative-source credits and links", () => {
    const result = parsePhotoCredit("Hero: Carol M. Highsmith / Public domain via Library of Congress | https://www.loc.gov/item/example/");
    expect(result.hero).toEqual({ creator: "Carol M. Highsmith", license: "Public domain", licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/", source: "Library of Congress", sourceUrl: "https://www.loc.gov/item/example/" });
    const images = buildDestinationImages({ name: "Seattle", region: "Washington", heroImage: "https://minialife.com/photo.jpg", gallery: [], photoCredit: "Hero: Carol M. Highsmith / Public domain via Library of Congress | https://www.loc.gov/item/example/" });
    expect(images[0]).toMatchObject({ creditText: "Carol M. Highsmith / Public domain via Library of Congress", acquireLicensePage: "https://www.loc.gov/item/example/" });
  });
  it("reads hero and every gallery credit, including commas in names", () => {
    const r = parsePhotoCredit(credit);
    expect(r.hero).toEqual({ creator: "Palacemusic", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/" });
    expect(r.gallery.map((g) => g?.creator)).toEqual(["Hustvedt", "Thomas Wolf, www.foto-tw.de"]);
    expect(r.gallery[1]?.licenseUrl).toBe("https://creativecommons.org/licenses/by/4.0/");
  });
  it("makes relative paths absolute and rejects http", () => {
    expect(toAbsoluteImageUrl("/__l5e/a.jpg")).toBe("https://minialife.com/__l5e/a.jpg");
    expect(toAbsoluteImageUrl("http://x.org/a.jpg")).toBeNull();
    expect(toAbsoluteImageUrl("")).toBeNull();
  });
  it("derives the Commons file page", () => {
    expect(commonsFilePage(hero)).toBe("https://commons.wikimedia.org/wiki/File:Double_arch.jpg");
  });
});

describe("image structured data", () => {
  it("omits creator when the credit cannot be resolved", () => {
    const imgs = buildDestinationImages({ name: "Moab", region: "Utah", heroImage: hero, gallery: [hero], photoCredit: null });
    expect(imgs).toHaveLength(1);
    expect(imgs[0]).not.toHaveProperty("creator");
  });
  it("attaches the photographer to the hero", () => {
    const imgs = buildDestinationImages({ name: "Moab", region: "Utah", heroImage: hero, gallery: [], photoCredit: credit });
    expect(imgs[0]).toMatchObject({ creator: { name: "Palacemusic" }, acquireLicensePage: "https://commons.wikimedia.org/wiki/File:Double_arch.jpg" });
  });
});

describe("image sitemap", () => {
  it("escapes XML and declares the image namespace", () => {
    const xml = urlsetXml([{ loc: "https://minialife.com/a", images: ["https://x.org/a.jpg?b=1&c=2"] }]);
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    expect(xml).toContain("a.jpg?b=1&amp;c=2");
  });
  it("lists duplicate photos once and keeps encoded characters", () => {
    expect(uniqueImages([hero, hero, "https://x.org/Canyon_Lake%2C_TX.jpg"])).toEqual([hero, "https://x.org/Canyon_Lake%2C_TX.jpg"]);
  });
  it("falls back only to the guide's own destination photo", () => {
    expect(guideCover("/unknown-guide", null, hero)).toBe(hero);
    expect(guideCover("/unknown-guide", null, null)).toBeNull();
  });
});
