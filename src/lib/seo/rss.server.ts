// Server-only: Pinterest RSS feeds built live from published rows + branded pin cards.
import { type PinKind, isBroken, pinDescription, pinTitle } from "./pinCopy";
import { FEEDS, type Feed, type FeedItem, feedForPath, renderRss, selectItems } from "./rss";

const BASE = "https://minialife.com";

async function rest<T>(query: string): Promise<T[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing backend env");
  const headers: Record<string, string> = { apikey: key };
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
  const out: T[] = [];
  for (let offset = 0; ; offset += 1000) {
    const res = await fetch(`${url}/rest/v1/${query}&limit=1000&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`rss fetch ${res.status}`);
    const rows = (await res.json()) as T[];
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

type D = { id: string; slug: string; name: string; tagline: string | null; best_season: string | null; recommended_duration: string | null; nearest_airport_code: string | null; updated_at: string };
type L = { path: string; page_type: string; seo_title: string | null; seo_description: string | null; destination_id: string; published_at: string | null; updated_at: string; indexable: boolean };
type P = { key: string; image_url: string; release_at: string };

export async function buildRss(feed: string): Promise<Response | null> {
  if (!(FEEDS as readonly string[]).includes(feed)) return null;
  let items: FeedItem[] = [];
  try {
    const [dests, pages, pins] = await Promise.all([
      rest<D>("destinations?select=id,slug,name,tagline,best_season,recommended_duration,nearest_airport_code,updated_at&status=eq.published&order=slug.asc"),
      rest<L>("seo_landing_pages?select=path,page_type,seo_title,seo_description,destination_id,published_at,updated_at,indexable&status=eq.published&order=path.asc"),
      // CSV-uploaded pins are posted manually; never repeat them through RSS.
      rest<P>("pin_assets?select=key,image_url,release_at&channel=eq.rss&order=key.asc"),
    ]);
    const pinBy = new Map(pins.map((p) => [p.key, p]));
    const byId = new Map(dests.map((d) => [d.id, d]));
    const push = (kind: PinKind, d: D, key: string, link: string, extra: Partial<L>, feedName: FeedItem["feed"], date: string, indexable: boolean) => {
      const pin = pinBy.get(key);
      const input = { kind, name: d.name, tagline: d.tagline, seoTitle: extra.seo_title, seoDescription: extra.seo_description, bestSeason: d.best_season, duration: d.recommended_duration, airport: d.nearest_airport_code };
      const title = pinTitle(input);
      const description = pinDescription(input);
      if (isBroken(title) || isBroken(description)) return;
      items.push({ title, description, link, image: pin?.image_url ?? null, releaseAt: pin?.release_at, date, feed: feedName, indexable, published: true });
    };
    for (const d of dests) push("destination", d, `d:${d.slug}`, `${BASE}/destinations/${d.slug}`, {}, "parks", d.updated_at, true);
    for (const p of pages) {
      const d = byId.get(p.destination_id);
      if (!d) continue;
      push(p.page_type as PinKind, d, `p:${p.path}`, `${BASE}${p.path}`, p, feedForPath(p.path), p.published_at ?? p.updated_at, p.indexable);
    }
  } catch (err) {
    console.error("[rss]", err);
    items = [];
  }
  return new Response(renderRss(selectItems(items, feed as Feed), feed as Feed), {
    headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
