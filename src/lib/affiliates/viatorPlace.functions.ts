import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { verifiedViatorProductUrl } from "./corridorPartners";

export type PlaceExperience = {
  code: string; title: string; url: string; image: string;
  price: number | null; currency: string; rating: number | null; reviews: number;
};
type Product = {
  productCode: string; title: string; productUrl: string;
  images?: { isCover?: boolean; variants: { width: number; url: string }[] }[];
  reviews?: { combinedAverageRating?: number; totalReviews?: number };
  pricing?: { currency: string; summary?: { fromPrice?: number } };
};

const DAY = 24 * 60 * 60 * 1000;

/** Live Viator listings for one destination, cached 24h per place. */
export const getPlaceExperiences = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().regex(/^[a-z0-9-]{1,80}$/) }).parse(d))
  .handler(async ({ data }): Promise<{ name: string; items: PlaceExperience[] }> => {
    const { data: dest } = await supabase.from("destinations").select("name, state").eq("slug", data.slug).eq("status", "published").maybeSingle();
    if (!dest) return { name: "", items: [] };
    const { data: cached } = await supabase.from("viator_place_cache").select("items, fetched_at").eq("slug", data.slug).maybeSingle();
    if (cached && Date.now() - new Date(cached.fetched_at).getTime() < DAY) return { name: dest.name, items: cached.items as PlaceExperience[] };

    const key = process.env["VIATOR_API_KEY"];
    if (!key) return { name: dest.name, items: (cached?.items as PlaceExperience[]) ?? [] };
    let items: PlaceExperience[] = [];
    try {
      const res = await fetch("https://api.viator.com/partner/search/freetext", {
        method: "POST",
        headers: { "exp-api-key": key, Accept: "application/json;version=2.0", "Accept-Language": "en-US", "Content-Type": "application/json" },
        body: JSON.stringify({ searchTerm: `${dest.name}${dest.state ? ` ${dest.state}` : ""}`, searchTypes: [{ searchType: "PRODUCTS", pagination: { start: 1, count: 20 } }], currency: "USD" }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        console.error(`[Viator place] ${res.status}`);
        return { name: dest.name, items: (cached?.items as PlaceExperience[]) ?? [] };
      }
      const body = (await res.json()) as { products?: { results?: Product[] } };
      for (const p of body.products?.results ?? []) {
        const url = verifiedViatorProductUrl(p.productUrl);
        const cover = p.images?.find((i) => i.isCover) ?? p.images?.[0];
        const image = cover?.variants.filter((v) => v.width >= 480).sort((a, b) => b.width - a.width)[0]?.url;
        if (!url || !image?.startsWith("https://")) continue;
        items.push({ code: p.productCode, title: p.title, url, image, price: p.pricing?.summary?.fromPrice ?? null, currency: p.pricing?.currency ?? "USD", rating: p.reviews?.combinedAverageRating ?? null, reviews: p.reviews?.totalReviews ?? 0 });
        if (items.length === 6) break;
      }
    } catch (e) {
      console.error("[Viator place] failed", e instanceof Error ? e.message : e);
      return { name: dest.name, items: (cached?.items as PlaceExperience[]) ?? [] };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("viator_place_cache").upsert({ slug: data.slug, items, fetched_at: new Date().toISOString() });
    return { name: dest.name, items };
  });
