// Shared affiliate-compliance helpers (Sovrn Commerce Publisher Code of Conduct).
// Kept free of server-only imports so both client and server code can use it.

const BOT_PATTERNS = [
  "bot",
  "crawler",
  "spider",
  "crawl",
  "slurp",
  "headless",
  "phantomjs",
  "puppeteer",
  "playwright",
  "selenium",
  "python-requests",
  "curl/",
  "wget",
  "axios/",
  "node-fetch",
  "scrapy",
  "http-client",
  "monitoring",
  "preview",
  "facebookexternalhit",
];

export function isBotUserAgent(userAgent: string): boolean {
  if (!userAgent) return true; // no UA at all is not a genuine Reader click
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((p) => ua.includes(p));
}

// Links that already carry afsrc=1 belong to another affiliate; we must not
// re-affiliate or intercept them.
export function hasAfsrcParam(url: string): boolean {
  try {
    return new URL(url).searchParams.get("afsrc") === "1";
  } catch {
    return /[?&]afsrc=1\b/.test(url);
  }
}

// Human-readable partner names used in visible outbound-link labels, so the
// Reader always knows where a click takes them.
const PARTNER_LABELS: Record<string, string> = {
  rvshare: "RVshare",
  hipcamp: "Hipcamp",
  glamping_hub: "Glamping Hub",
  arrive_outdoors: "Arrive Outdoors",
  rei: "REI",
  viator: "Viator",
};

export function partnerLabel(partner: string | null): string | null {
  if (!partner) return null;
  return PARTNER_LABELS[partner] ?? partner.replace(/_/g, " ");
}

// Domain shown when we have no mapped partner — still transparent about the
// destination of the click.
export function destinationHost(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function outboundLinkTitle(partner: string | null, url: string | null): string {
  const name = partnerLabel(partner) ?? destinationHost(url);
  return name
    ? `Opens ${name} in a new tab — partner link, we may earn a commission`
    : "Opens a partner site in a new tab — we may earn a commission";
}
