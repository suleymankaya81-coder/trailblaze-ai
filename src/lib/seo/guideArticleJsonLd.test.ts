import { describe, expect, it } from "vitest";
import { GUIDE_DATES_TRUSTED } from "@/config/site";
import { formatUpdated, guideArticleJsonLd, guideDates, realDate } from "./guideArticleJsonLd";

const base = { headline: "The Best Time to Visit Zion National Park", description: "d", url: "https://wildparkroutes.com/destinations/us/utah/zion/best-time", sections: [{ heading: "Spring" }] };
const place = { name: "Zion National Park", url: "https://wildparkroutes.com/destinations/us/utah/zion" };

const dated = { publishedAt: "2026-10-09T07:06:43.906+00:00", createdAt: "2026-10-01T00:00:00+00:00", updatedAt: "2026-10-25T13:59:06.920175+00:00" };

describe("guide dates while they are bulk timestamps (GUIDE_DATES_TRUSTED = false)", () => {
  it("is off until real modification dates exist", () => {
    expect(GUIDE_DATES_TRUSTED).toBe(false);
  });
  it("outputs neither datePublished nor dateModified, and no visible date", () => {
    const a = guideArticleJsonLd({ ...base, ...dated });
    expect(a).not.toHaveProperty("datePublished");
    expect(a).not.toHaveProperty("dateModified");
    // The page shows "Last updated" only when guideDates(...).dateModified is set.
    expect(guideDates(dated).dateModified).toBeNull();
  });
});

describe("guide Article dates once trusted", () => {
  it("uses published_at for datePublished and updated_at for dateModified", () => {
    const a = guideArticleJsonLd({ ...base, ...dated }, true);
    expect(a.datePublished).toBe("2026-10-09T07:06:43.906Z");
    expect(a.dateModified).toBe("2026-10-25T13:59:06.920Z");
  });
  it("falls back to the row's created_at when published_at is empty", () => {
    expect(guideDates({ publishedAt: null, createdAt: "2026-09-30T10:00:00Z", updatedAt: null }, true)).toEqual({ datePublished: "2026-09-30T10:00:00.000Z", dateModified: null });
  });
  it("omits dates that are unknown or unparseable instead of inventing them", () => {
    const a = guideArticleJsonLd({ ...base, publishedAt: null, createdAt: null, updatedAt: "not a date" }, true);
    expect(a).not.toHaveProperty("datePublished");
    expect(a).not.toHaveProperty("dateModified");
    expect(realDate(undefined)).toBeNull();
  });
  it("never reports a modification before publication", () => {
    expect(guideDates({ publishedAt: "2026-10-09T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z" }, true).dateModified).toBe("2026-10-09T00:00:00.000Z");
  });
  it("formats the visible date the same way everywhere (UTC)", () => {
    expect(formatUpdated("2026-10-25T23:59:06Z")).toBe("October 25, 2026");
  });
});

describe("guide Article subject", () => {
  it("links the guide to its place's destination node", () => {
    const a = guideArticleJsonLd({ ...base, place });
    expect(a.about).toEqual({ "@type": "TouristDestination", "@id": `${place.url}#destination`, name: place.name, url: place.url });
  });
  it("has author and publisher but never a Person", () => {
    const s = JSON.stringify(guideArticleJsonLd({ ...base, place }));
    expect(s).not.toContain('"Person"');
  });
});
