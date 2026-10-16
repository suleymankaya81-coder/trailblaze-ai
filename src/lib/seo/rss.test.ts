import { describe, expect, it } from "vitest";
import { type FeedItem, feedForPath, selectItems } from "./rss";

const base: FeedItem = { title: "t", description: "d", link: "https://minialife.com/x", image: "https://a.org/p.jpg", date: "2026-10-01", feed: "parks", indexable: true, published: true };

describe("pinterest rss", () => {
  it("excludes noindex pages", () => expect(selectItems([{ ...base, indexable: false }], "all")).toHaveLength(0));
  it("excludes unpublished pages", () => expect(selectItems([{ ...base, published: false }], "all")).toHaveLength(0));
  it("excludes pages without a branded pin card", () => expect(selectItems([{ ...base, image: null }], "all")).toHaveLength(0));
  it("holds back pins until their drip release time", () => {
    const now = "2026-10-17T00:00:00Z";
    expect(selectItems([{ ...base, releaseAt: "2026-10-18T00:00:00Z" }], "all", 200, now)).toHaveLength(0);
    expect(selectItems([{ ...base, releaseAt: "2026-10-16T00:00:00Z" }], "all", 200, now)).toHaveLength(1);
  });
  it("routes guides to their board feed", () => {
    expect(feedForPath("/zion-best-time-to-visit")).toBe("best-time");
    expect(feedForPath("/zion-glamping")).toBe("rv");
    expect(selectItems([base], "rv")).toHaveLength(0);
  });
});
