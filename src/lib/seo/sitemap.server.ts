// Server-only: builds sitemap.xml from the Supabase destinations table
// (status = 'published') plus the site's static pages. Never edit by hand —
// every published destination shows up automatically, no manual step.

const STATIC_PATHS = ["/", "/about", "/contact", "/privacy", "/terms", "/affiliate-disclosure"];

type DestinationRow = { slug: string; updated_at: string };

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

async function fetchPublishedDestinations(): Promise<DestinationRow[]> {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY for sitemap generation");
  }

  const headers: Record<string, string> = { apikey: SUPABASE_KEY };
  if (!isNewSupabaseApiKey(SUPABASE_KEY)) headers.Authorization = `Bearer ${SUPABASE_KEY}`;

  const url = `${SUPABASE_URL}/rest/v1/destinations?select=slug,updated_at&status=eq.published&order=slug.asc`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch destinations for sitemap: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as DestinationRow[];
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Canonical public origin — the sitemap always advertises the real site,
// never the preview/request host.
const BASE_URL = "https://minialife.com";

export async function buildSitemapResponse(_origin?: string): Promise<Response> {
  // No lastmod on static pages: we have no page-specific change timestamp,
  // and a build-time date would be fabricated.
  const urls: { loc: string; lastmod?: string }[] = STATIC_PATHS.map((path) => ({
    loc: `${BASE_URL}${path}`,
  }));

  try {
    const destinations = await fetchPublishedDestinations();
    for (const d of destinations) {
      urls.push({
        loc: `${BASE_URL}/destinations/${d.slug}`,
        lastmod: new Date(d.updated_at).toISOString(),
      });
    }
    // Search pages: published + indexable only (RLS also hides pages whose
    // destination is unpublished).
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (SUPABASE_URL && KEY) {
      const headers: Record<string, string> = { apikey: KEY };
      if (!isNewSupabaseApiKey(KEY)) headers.Authorization = `Bearer ${KEY}`;
      // The API caps each response at 1000 rows, so page through all of them.
      const PAGE = 1000;
      for (let offset = 0; ; offset += PAGE) {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/seo_landing_pages?select=path,updated_at&status=eq.published&indexable=eq.true&order=path.asc&limit=${PAGE}&offset=${offset}`,
          { headers },
        );
        if (!res.ok) break;
        const rows = (await res.json()) as { path: string; updated_at: string }[];
        for (const p of rows) {
          urls.push({ loc: `${BASE_URL}${p.path}`, lastmod: new Date(p.updated_at).toISOString() });
        }
        if (rows.length < PAGE) break;
      }
    }
  } catch (err) {
    // Degrade gracefully — a stale/partial sitemap beats a 500 for crawlers.
    console.error("[sitemap] failed to load destinations, serving static pages only", err);
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url><loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`,
    ),
    "</urlset>",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
