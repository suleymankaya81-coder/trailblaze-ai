import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifiedViatorProductUrl } from "./corridorPartners";
import { getCorridor } from "@/lib/seo/corridors";
import { viatorProductImage } from "./viatorImages";

type Product = {
  productCode: string;
  title: string;
  productUrl: string;
  images?: { isCover?: boolean; variants: { width: number; url: string }[] }[];
  reviews?: { combinedAverageRating?: number; totalReviews?: number };
  pricing?: { currency: string; summary?: { fromPrice?: number }; extraChargesSummary?: { fromPrice?: number } };
};
export type CorridorExperience = {
  code: string; title: string; url: string; image: string; stop: string;
  price: number | null; currency: string; rating: number | null; reviews: number;
};

export const getCorridorExperiences = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().max(80) }).parse(data))
  .handler(async ({ data }): Promise<{ items: CorridorExperience[]; unavailable: boolean }> => {
    const key = process.env["VIATOR_API_KEY"];
    const corridor = getCorridor(data.slug);
    if (!key || !corridor || corridor.pilot) return { items: [], unavailable: true };
    const raw = await Promise.all(corridor.experiences.map(async (selection): Promise<CorridorExperience | null> => {
      try {
        const response = await fetch("https://api.viator.com/partner/search/freetext", {
          method: "POST",
          headers: { "exp-api-key": key, Accept: "application/json;version=2.0", "Accept-Language": "en-US", "Content-Type": "application/json" },
          body: JSON.stringify({ searchTerm: selection.search, searchTypes: [{ searchType: "PRODUCTS", pagination: { start: 1, count: 10 } }], currency: "USD" }),
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) {
          console.error(`[Viator corridor] ${response.status}: ${await response.text()}`);
          return null;
        }
        const body = await response.json() as { products?: { results?: Product[] } };
        const list = body.products?.results ?? [];
        const product = selection.code ? list.find((p) => p.productCode === selection.code) : list.find((p) => verifiedViatorProductUrl(p.productUrl) && p.images?.length);
        if (!product) return null;
        const url = verifiedViatorProductUrl(product.productUrl);
        const image = viatorProductImage(product.images);
        if (!url || !image?.startsWith("https://")) return null;
        return {
          code: product.productCode, title: product.title, url, image, stop: selection.stop,
          price: product.pricing?.extraChargesSummary?.fromPrice ?? product.pricing?.summary?.fromPrice ?? null,
          currency: product.pricing?.currency ?? "USD",
          rating: product.reviews?.combinedAverageRating ?? null, reviews: product.reviews?.totalReviews ?? 0,
        } satisfies CorridorExperience;
      } catch (error) {
        console.error("[Viator corridor] Request failed", error instanceof Error ? error.message : "Unknown error");
        return null;
      }
    }));
    const seen = new Set<string>();
    const results = raw.map((p) => (p && !seen.has(p.code) ? (seen.add(p.code), p) : null));
    return { items: results.filter((p): p is CorridorExperience => p !== null), unavailable: results.every((p) => p === null) };
  });