// Server-only: Pinterest RSS feeds built live from published rows.
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

type D = { id: string; slug: string; name: string; tagline: string | null; best_season: string | null; recommended_duration: string | null; hero_image: string | null; photo_credit: string | null; updated_at: string };
type L = { path: string; seo_title: string | null; seo_description: string | null; cover_image: string | null; cover_photo_credit: string | null; destination_id: string; published_at: string | null; updated_at: string; indexable: boolean };

export async function buildRss(feed: string): Promise<Response | null> {
  if (!(FEEDS as readonly string[]).includes(feed)) return null;
  let items: FeedItem[] = [];
  try {
    const [dests, pages] = await Promise.all([
      rest<D>("destinations?select=id,slug,name,tagline,best_season,recommended_duration,hero_image,photo_credit,updated_at&status=eq.published&order=slug.asc"),
      rest<L>("seo_landing_pages?select=path,seo_title,seo_description,cover_image,cover_photo_credit,destination_id,published_at,updated_at,indexable&status=eq.published&order=path.asc"),
    ]);
    const byId = new Map(dests.map((d) => [d.id, d]));
    const credit = (c: string | null) => (c ? ` Photo: ${c.replace(/<[^>]+>/g, "")}.` : "");
    items = dests.map((d) => ({
      title: `${d.name} Road Trip Guide`,
      description: [d.tagline, d.best_season && `Best time: ${d.best_season}.`, d.recommended_duration && `Plan ${d.recommended_duration}.`, "Free trip plan with route map, stays and gear on MiniaLife."].filter(Boolean).join(" ") + credit(d.photo_credit),
      link: `${BASE}/destinations/${d.slug}`,
      image: d.hero_image,
      date: d.updated_at,
      feed: "parks",
      indexable: true,
      published: true,
    }));
    for (const p of pages) {
      const d = byId.get(p.destination_id);
      if (!d) continue; // destination not published
      const useCover = !!p.cover_image;
      items.push({
        title: p.seo_title ?? d.name,
        description: (p.seo_description ?? d.tagline ?? "") + credit(useCover ? p.cover_photo_credit : d.photo_credit),
        link: `${BASE}${p.path}`,
        image: useCover ? p.cover_image : d.hero_image,
        date: p.published_at ?? p.updated_at,
        feed: feedForPath(p.path),
        indexable: p.indexable,
        published: true,
      });
    }
  } catch (err) {
    console.error("[rss]", err);
  }
  return new Response(renderRss(selectItems(items, feed as Feed), feed as Feed), {
    headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
