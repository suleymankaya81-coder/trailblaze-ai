import { AUTHORITY_HOSTS, REDIRECT_HOSTS, SITE_ORIGIN } from "@/config/site";
import { canonicalPath } from "@/lib/routes/paths";
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
 * German park pages → German catalogue, other Europe → trip guides, everything else → destinations.
 * Root "/" only maps on the authority host itself.
 */
export function authorityTarget(path: string, onAuthorityHost: boolean): string | null {
  const p = path.toLowerCase();
  if (p.startsWith("/eu/ge")) return "/de/destinations";
  if (p === "/eu" || p.startsWith("/eu/")) return "/trip-guides";
  if (/^\/(af|as|au|sa|ca|ru|us)(\/|$)/.test(p) || /\.html?$/.test(p)) return "/destinations";
  if (onAuthorityHost && p === "/") return "/destinations";
  return null;
}

const moved301 = (location: string) =>
  new Response(null, { status: 301, headers: { location, "cache-control": "public, max-age=86400" } });

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
      headers: { location: `${moved}${url.search}`, "cache-control": "public, max-age=86400" },
    });
  }
  const to = REDIRECTS[path];
  if (to) {
    return new Response(null, {
      status: 301,
      headers: { location: `${SITE_ORIGIN}${to}`, "cache-control": "public, max-age=86400" },
    });
  }
  if (GONE_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
    return new Response(
      '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page removed — MiniaLife</title></head><body style="font-family:sans-serif;padding:3rem;text-align:center"><h1>This page has been permanently removed</h1><p><a href="/destinations">Explore our destination guides</a></p></body></html>',
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
