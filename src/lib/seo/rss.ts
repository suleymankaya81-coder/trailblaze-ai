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

export function withUtm(link: string): string {
  return `${link}${link.includes("?") ? "&" : "?"}utm_source=pinterest&utm_medium=rss`;
}

export function selectItems(items: FeedItem[], feed: Feed, limit = 200, now = new Date().toISOString()): FeedItem[] {
  return items
    .filter((i) => i.published && i.indexable && !!i.image && /^https:\/\//.test(i.image!))
    .filter((i) => !i.releaseAt || i.releaseAt <= now)
    .filter((i) => feed === "all" || i.feed === feed)
    .sort((a, b) => (b.releaseAt ?? b.date).localeCompare(a.releaseAt ?? a.date))
    .slice(0, limit);
}

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderRss(items: FeedItem[], feed: Feed): string {
  const self = feed === "all" ? "https://minialife.com/rss.xml" : `https://minialife.com/rss/${feed}.xml`;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    "<title>MiniaLife — Road Trips &amp; Outdoor Travel</title>",
    "<link>https://minialife.com</link>",
    `<atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    "<description>Road trip guides, scenic routes and outdoor travel plans.</description>",
    ...items.map((i) => {
      const img = i.image!;
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
