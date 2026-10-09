// Server-only: sitemap index at /sitemap.xml plus child sitemaps under
// /sitemaps/*.xml, built live from published rows — never edited by hand.

const STATIC_PATHS = ["/", "/destinations", "/about", "/contact", "/privacy", "/terms", "/affiliate-disclosure"];
const BASE_URL = "https://minialife.com";
const GUIDE_TYPES = ["best-time-to-visit", "things-to-do", "itinerary", "glamping"] as const;

type Url = { loc: string; lastmod?: string };

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

async function fetchAll<T>(query: string): Promise<T[]> {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !KEY) throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");
  const headers: Record<string, string> = { apikey: KEY };
  if (!isNewSupabaseApiKey(KEY)) headers.Authorization = `Bearer ${KEY}`;
  // The API caps each response at 1000 rows, so page through all of them.
  const PAGE = 1000;
  const out: T[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}&limit=${PAGE}&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
    const rows = (await res.json()) as T[];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function xml(body: string): Response {
  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}

function urlset(urls: Url[]): Response {
  return xml(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(
        (u) => `  <url><loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`,
      ),
      "</urlset>",
    ].join("\n"),
  );
}

const CHILDREN = ["pages", "destinations", ...GUIDE_TYPES.map((t) => `guides-${t}`)];

export async function buildSitemapResponse(_origin?: string): Promise<Response> {
  return xml(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...CHILDREN.map((c) => `  <sitemap><loc>${BASE_URL}/sitemaps/${c}.xml</loc></sitemap>`),
      "</sitemapindex>",
    ].join("\n"),
  );
}

// Returns null for unknown child names (caller falls through to 404).
export async function buildChildSitemap(name: string): Promise<Response | null> {
  if (!CHILDREN.includes(name)) return null;
  if (name === "pages") return urlset(STATIC_PATHS.map((p) => ({ loc: `${BASE_URL}${p}` })));
  try {
    if (name === "destinations") {
      const rows = await fetchAll<{ slug: string; updated_at: string }>(
        "destinations?select=slug,updated_at&status=eq.published&order=slug.asc",
      );
      return urlset(
        rows.map((d) => ({ loc: `${BASE_URL}/destinations/${d.slug}`, lastmod: new Date(d.updated_at).toISOString() })),
      );
    }
    const suffix = name.slice("guides-".length);
    const rows = await fetchAll<{ path: string; updated_at: string }>(
      `seo_landing_pages?select=path,updated_at&status=eq.published&indexable=eq.true&path=like.*-${suffix}&order=path.asc`,
    );
    return urlset(rows.map((p) => ({ loc: `${BASE_URL}${p.path}`, lastmod: new Date(p.updated_at).toISOString() })));
  } catch (err) {
    console.error("[sitemap]", err);
    return urlset([]);
  }
}
