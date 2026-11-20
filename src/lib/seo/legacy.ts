import { AUTHORITY_HOSTS, LEGACY_HOSTS, MIGRATED, REDIRECT_HOSTS, SITE_ORIGIN } from "@/config/site";
import { canonicalPath } from "@/lib/routes/paths";
import destinationGeo from "@/data/destination-geo.json";
// Addresses from the previous site design (deleted on purpose). Answer them
// with 301 (clear modern equivalent) or 410 Gone so Google drops them fast.
const REDIRECTS: Record<string, string> = {
  "/disclaimer": "/affiliate-disclosure",
  "/planner": "/destinations",
  "/guides": "/destinations",
};

const GONE_PREFIXES = [
  "/plans",
  "/blog",
  "/curated-plans",
  "/returns",
  // Old e-commerce era
  "/product-category",
  "/product",
  "/products",
  "/shop",
  "/cart",
  "/checkout",
  "/my-account",
  "/list-example",
  "/item",
  "/category",
  "/tag",
  "/author",
  "/feed",
  "/collections",
  "/wp-content",
  "/wp-json",
];

/**
 * Pages of the old world-national-parks.net directory (1998–2024 archive):
 * Verified country paths → live country directories; unpublished countries keep the directory fallback.
 * Root "/" only maps on the authority host itself.
 */
/** Switch on once the first UK places are published, so old UK pages land on the UK country page. */
export const UK_PAGES_LIVE = true;

/**
 * Old directory country pages (archive-verified codes) → our live country pages. "/eu/au" is Austria, "/eu/es" Estonia, "/au" Australia.
 * "/eu/pr" is Portugal, not "/eu/pt". The recovered Europe menu incorrectly reused
 * Slovenia's "/eu/sl" link for Switzerland: do not guess a Swiss path or overwrite Slovenia.
 */
export const AUTHORITY_COUNTRY: Record<string, string> = {
  "/eu/au": "at", "/eu/ge": "de", "/eu/it": "it", "/eu/sp": "es", "/eu/uk": "gb", "/ca": "ca", "/us": "us",
  "/eu/pr": "pt", "/eu/gr": "gr", "/eu/fr": "fr",
  "/eu/no": "no", "/eu/sw": "se", "/eu/fi": "fi", "/eu/ic": "is",
  "/eu/ir": "ie", "/eu/ne": "nl",
  "/eu/cr": "hr", "/eu/es": "ee", "/eu/hu": "hu", "/eu/la": "lv",
  "/eu/li": "lt", "/eu/po": "pl", "/eu/ro": "ro", "/eu/sl": "si",
};

const LIVE_AUTHORITY_COUNTRIES = new Set(Object.values(destinationGeo).map((location) => location.split("/")[0]));

export function authorityTarget(path: string, onAuthorityHost: boolean): string | null {
  const p = path.toLowerCase().replace(/\.html?$/, "");
  for (const [prefix, cc] of Object.entries(AUTHORITY_COUNTRY)) {
    if (p === prefix || p.startsWith(prefix + "/") || p.startsWith(prefix + ".")) {
      if (cc === "gb" && !UK_PAGES_LIVE) return "/trip-guides";
      return LIVE_AUTHORITY_COUNTRIES.has(cc) ? `/destinations/${cc}` : "/destinations";
    }
  }
  if (p === "/eu" || p.startsWith("/eu/")) return "/destinations";
  if (/^\/(af|as|au|sa|ru|ce|me|in|ne|so)(\/|$)/.test(p) || /\.(html?|asp)$/.test(path.toLowerCase())) return "/destinations";
  if (onAuthorityHost && p === "/") return "/";
  return null;
}

const moved301 = (location: string) =>
  new Response(null, { status: 301, headers: { location, "cache-control": "public, max-age=86400" } });

export const isLegacyHost = (host: string) => LEGACY_HOSTS.includes(host.toLowerCase());

/** On the old domain: forward a page that exists now (200) to the new domain, answer anything else with 410. */
export function legacyHostResponse(url: URL, status: number): Response {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  return status === 200 ? moved301(`${SITE_ORIGIN}${canonicalPath(path)}${url.search}`) : goneResponse();
}

function goneResponse(): Response {
  return new Response(
    '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page removed</title></head><body style="font-family:sans-serif;padding:3rem;text-align:center"><h1>This page has been permanently removed</h1></body></html>',
    { status: 410, headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex, nofollow", "cache-control": "public, max-age=86400" } },
  );
}

export function legacyResponse(url: URL): Response | null {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const host = url.hostname.toLowerCase();
  const onAuthority = AUTHORITY_HOSTS.includes(host);
  const mapped = authorityTarget(path, onAuthority);
  if (mapped) return moved301(`${SITE_ORIGIN}${mapped}`);
  // Old/extra domains → primary domain, same (canonical) address.
  if (REDIRECT_HOSTS.includes(host)) return moved301(`${SITE_ORIGIN}${canonicalPath(path)}${url.search}`);
  // Flat destination and root guide addresses → country/region structure.
  const moved = canonicalPath(path);
  if (moved !== path) {
    return new Response(null, {
      status: 301,
      headers: { location: `${SITE_ORIGIN}${moved}${url.search}`, "cache-control": "public, max-age=86400" },
    });
  }
  const to = REDIRECTS[path];
  if (to) {
    return new Response(null, {
      status: 301,
      headers: { location: `${SITE_ORIGIN}${to}`, "cache-control": "public, max-age=86400" },
    });
  }
  // The new domain never had the old-design addresses: they are plain 404s there, not kept rules.
  if (MIGRATED && !LEGACY_HOSTS.includes(host)) return null;
  if (GONE_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
    return new Response(
      '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page removed — WildParkRoutes</title></head><body style="font-family:sans-serif;padding:3rem;text-align:center"><h1>This page has been permanently removed</h1><p><a href="/destinations">Explore our destination guides</a></p></body></html>',
      {
        status: 410,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "x-robots-tag": "noindex, nofollow",
          "cache-control": "public, max-age=86400",
        },
      },
    );
  }
  return null;
}
