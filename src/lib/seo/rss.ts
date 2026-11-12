import { SITE_ORIGIN } from "@/config/site";
import { canonicalPath } from "@/lib/routes/paths";
// Pure helpers for Pinterest RSS feeds (testable, no I/O).
export const FEEDS = ["all", "parks", "rv", "best-time", "things-to-do"] as const;
export type Feed = (typeof FEEDS)[number];

export type FeedItem = {
  title: string;
  description: string;
  link: string;
  /** Branded pin card (rendered once by render-pins.py); null = not pinnable yet. */
  image: string | null;
  date: string;
  /** Drip schedule: items appear only once this moment has passed. */
  releaseAt?: string;
  feed: Exclude<Feed, "all">;
  indexable: boolean;
  published: boolean;
};

export function feedForPath(path: string): Exclude<Feed, "all"> {
  if (path.endsWith("-best-time-to-visit")) return "best-time";
  if (path.endsWith("-things-to-do")) return "things-to-do";
  if (path.endsWith("-glamping")) return "rv";
  return "parks";
}

/** Board feed for a pin's stored feed name; guide families without their own feed join the closest board. */
export function feedForPin(feed: string): Exclude<Feed, "all"> {
  if (feed === "rv-camping" || feed === "rv") return "rv";
  if (feed === "best-time" || feed === "things-to-do") return feed;
  return "parks";
}

export type StoredPin = { key: string; image_url: string; release_at: string; feed: string; title: string | null; description: string | null; link: string | null };

/** Pins that carry their own reviewed copy and link (former manual-upload pins). */
export function storedPinItem(p: StoredPin): FeedItem | null {
  if (!p.title || !p.description || !p.link || !/^https:\/\/minialife\.com\//.test(p.link)) return null;
  return { title: p.title, description: p.description, link: SITE_ORIGIN + canonicalPath(new URL(p.link).pathname), image: p.image_url, releaseAt: p.release_at, date: p.release_at, feed: feedForPin(p.feed), indexable: true, published: true };
}

export function withUtm(link: string): string {
  return `${link}${link.includes("?") ? "&" : "?"}utm_source=pinterest&utm_medium=rss`;
}

export function selectItems(items: FeedItem[], feed: Feed, limit = 200, now = new Date().toISOString()): FeedItem[] {
  return items
    .filter((i) => i.published && i.indexable && typeof i.image === "string" && /^https:\/\//.test(i.image))
    .filter((i) => !i.releaseAt || i.releaseAt <= now)
    .filter((i) => feed === "all" || i.feed === feed)
    .sort((a, b) => (b.releaseAt ?? b.date).localeCompare(a.releaseAt ?? a.date))
    .slice(0, limit);
}

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderRss(items: FeedItem[], feed: Feed): string {
  const self = feed === "all" ? `${SITE_ORIGIN}/rss.xml` : `${SITE_ORIGIN}/rss/${feed}.xml`;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    "<title>MiniaLife — Road Trips &amp; Outdoor Travel</title>",
    `<link>${SITE_ORIGIN}</link>`,
    `<atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    "<description>Road trip guides, scenic routes and outdoor travel plans.</description>",
    ...items.map((i) => {
      const img = i.image;
      if (!img) return "";
      return [
        "<item>",
        `<title>${esc(i.title.slice(0, 100))}</title>`,
        `<link>${esc(withUtm(i.link))}</link>`,
        `<guid isPermaLink="false">${esc(i.link)}#pin-v1</guid>`,
        `<description>${esc(i.description)}</description>`,
        `<pubDate>${new Date(i.releaseAt ?? i.date).toUTCString()}</pubDate>`,
        `<enclosure url="${esc(img)}" type="image/jpeg" length="0"/>`,
        `<media:content url="${esc(img)}" medium="image" type="image/jpeg"/>`,
        "</item>",
      ].join("");
    }),
    "</channel>",
    "</rss>",
  ].join("\n");
}
