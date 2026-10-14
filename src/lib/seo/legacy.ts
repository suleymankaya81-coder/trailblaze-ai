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

export function legacyResponse(url: URL): Response | null {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const to = REDIRECTS[path];
  if (to) {
    return new Response(null, {
      status: 301,
      headers: { location: `https://minialife.com${to}`, "cache-control": "public, max-age=86400" },
    });
  }
  if (GONE_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
    return new Response(
      '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page removed — MiniaLife</title></head><body style="font-family:sans-serif;padding:3rem;text-align:center"><h1>This page has been permanently removed</h1><p><a href="/destinations">Explore our destination guides</a></p></body></html>',
      {
        status: 410,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "x-robots-tag": "noindex",
          "cache-control": "public, max-age=86400",
        },
      },
    );
  }
  return null;
}
