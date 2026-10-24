import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { verifiedViatorProductUrl } from "./corridorPartners";
import { viatorProductImage } from "./viatorImages";
import { isPlaceExperienceRelevant } from "./viatorRelevance";

export type PlaceExperience = {
  code: string; title: string; url: string; image: string;
  price: number | null; currency: string; rating: number | null; reviews: number;
  summary?: string; category?: string;
  freeCancellation?: boolean; mobileTicket?: boolean;
};
type Product = {
  productCode: string; title: string; productUrl: string; description?: string;
  images?: { isCover?: boolean; variants: { width: number; url: string }[] }[];
  reviews?: { combinedAverageRating?: number; totalReviews?: number };
  pricing?: { currency: string; summary?: { fromPrice?: number } };
  flags?: string[];
};

/** Labels only when Viator's own product flags state them. */
export function viatorAssurances(flags: string[] | undefined): { freeCancellation: boolean; mobileTicket: boolean } {
  const f = flags ?? [];
  return { freeCancellation: f.includes("FREE_CANCELLATION"), mobileTicket: f.includes("MOBILE_TICKET") };
}

/** Our own category label from the tour title (not provider text). */
export function tourCategory(title: string): string {
  const t = title.toLowerCase();
  const rules: [RegExp, string][] = [
    [/helicopter|plane|flight|air tour/, "Scenic flight"], [/kayak|raft|boat|cruise|canoe|paddle/, "Water activity"],
    [/hik|trek|walk/, "Guided hike"], [/jeep|4x4|off-road|atv|utv/, "Off-road tour"], [/bike|cycl/, "Bike tour"],
    [/horse|trail ride/, "Horseback riding"], [/wildlife|safari|whale|bird/, "Wildlife tour"], [/photo/, "Photography tour"],
    [/food|wine|tasting|brew/, "Food & drink"], [/museum|histor|ghost/, "History & culture"], [/bus|coach|day trip|sightseeing/, "Sightseeing day trip"],
  ];
  return rules.find(([re]) => re.test(t))?.[1] ?? "Tour & experience";
}

const DAY = 24 * 60 * 60 * 1000;

/** Live Viator listings for one destination, cached 24h per place. */
export const getPlaceExperiences = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().regex(/^[a-z0-9-]{1,80}$/) }).parse(d))
  .handler(async ({ data }): Promise<{ name: string; items: PlaceExperience[]; unavailable?: boolean }> => {
    const { data: dest } = await supabase.from("destinations").select("name, state").eq("slug", data.slug).eq("status", "published").maybeSingle();
    if (!dest) return { name: "", items: [] };
    const { data: cached } = await supabase.from("viator_place_cache").select("items, fetched_at").eq("slug", data.slug).maybeSingle();
    const cachedItems = ((cached?.items as PlaceExperience[] | undefined) ?? []).filter((item) => isPlaceExperienceRelevant(dest.name, item.title, item.summary));
    if (cached && Date.now() - new Date(cached.fetched_at).getTime() < DAY) return { name: dest.name, items: cachedItems };

    const key = process.env["VIATOR_API_KEY"];
    if (!key) return { name: dest.name, items: cachedItems, unavailable: cachedItems.length === 0 };
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
        return { name: dest.name, items: cachedItems, unavailable: cachedItems.length === 0 };
      }
      const body = (await res.json()) as { products?: { results?: Product[] } };
      for (const p of body.products?.results ?? []) {
        if (!isPlaceExperienceRelevant(dest.name, p.title, p.description)) continue;
        const url = verifiedViatorProductUrl(p.productUrl);
        const image = viatorProductImage(p.images);
        if (!url || !image?.startsWith("https://")) continue;
        const desc = (p.description ?? "").replace(/\s+/g, " ").trim();
        const summary = desc ? (desc.length > 160 ? `${desc.slice(0, 157).replace(/\s\S*$/, "")}…` : desc) : undefined;
        items.push({ code: p.productCode, title: p.title, url, image, price: p.pricing?.summary?.fromPrice ?? null, currency: p.pricing?.currency ?? "USD", rating: p.reviews?.combinedAverageRating ?? null, reviews: p.reviews?.totalReviews ?? 0, summary, category: tourCategory(p.title), ...viatorAssurances(p.flags) });
        if (items.length === 6) break;
      }
    } catch (e) {
      console.error("[Viator place] failed", e instanceof Error ? e.message : e);
      return { name: dest.name, items: cachedItems, unavailable: cachedItems.length === 0 };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("viator_place_cache").upsert({ slug: data.slug, items, fetched_at: new Date().toISOString() });
    return { name: dest.name, items };
  });
