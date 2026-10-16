// Pure helpers for Pinterest RSS feeds (testable, no I/O).
export const FEEDS = ["all", "parks", "rv", "best-time", "things-to-do"] as const;
export type Feed = (typeof FEEDS)[number];

export type FeedItem = {
  title: string;
  description: string;
  link: string;
  image: string | null;
  date: string;
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

// Vertical 2:3 rendition of the credited photo, sized for Pinterest.
export function pinImage(src: string): string {
  const clean = src.replace(/^https?:\/\//, "");
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=1000&h=1500&fit=cover&output=jpg&q=82`;
}

export function withUtm(link: string): string {
  return `${link}${link.includes("?") ? "&" : "?"}utm_source=pinterest&utm_medium=rss`;
}

export function selectItems(items: FeedItem[], feed: Feed, limit = 200): FeedItem[] {
  return items
    .filter((i) => i.published && i.indexable && !!i.image && /^https:\/\//.test(i.image!))
    .filter((i) => feed === "all" || i.feed === feed)
    .sort((a, b) => b.date.localeCompare(a.date))
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
      const img = pinImage(i.image!);
      return [
        "<item>",
        `<title>${esc(i.title.slice(0, 100))}</title>`,
        `<link>${esc(withUtm(i.link))}</link>`,
        `<guid isPermaLink="true">${esc(i.link)}</guid>`,
        `<description>${esc(i.description.slice(0, 480))}</description>`,
        `<pubDate>${new Date(i.date).toUTCString()}</pubDate>`,
        `<enclosure url="${esc(img)}" type="image/jpeg" length="0"/>`,
        `<media:content url="${esc(img)}" medium="image" type="image/jpeg"/>`,
        "</item>",
      ].join("");
    }),
    "</channel>",
    "</rss>",
  ].join("\n");
}
