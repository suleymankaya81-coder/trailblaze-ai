import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";

// SEO landing pages (e.g. /yellowstone-camping) live in seo_landing_pages and
// link to a destination by FK — destination core data is never copied here.
// Not wired to any route yet: a root catch-all would collide with fixed routes
// and /destinations/$slug, so routing is deferred to a later stage.
// Public reads only return status='published' rows (also enforced by RLS);
// `indexable` is reported separately so callers can emit noindex.

export type LandingPageView = {
  id: string;
  path: string;
  pageType: Tables<"seo_landing_pages">["page_type"];
  destinationId: string;
  targetKeyword: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  introContent: string | null;
  contentSections: Json[];
  inventoryFilter: Json | null;
  inventoryRequirements: Json;
  indexable: boolean;
  noindexReason: string | null;
  canonicalUrl: string | null;
  priority: number;
  updatedAt: string;
};

const PATH_RE = /^\/[a-z0-9]+(-[a-z0-9]+)*$/;

export function normalizeLandingPath(input: string): string | null {
  const p = (
    "/" +
    input
      .trim()
      .toLowerCase()
      .replace(/^\/+|\/+$/g, "")
  ).replace(/\/+/g, "/");
  return PATH_RE.test(p) ? p : null;
}

function toView(r: Tables<"seo_landing_pages">): LandingPageView {
  return {
    id: r.id,
    path: r.path,
    pageType: r.page_type,
    destinationId: r.destination_id,
    targetKeyword: r.target_keyword,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    introContent: r.intro_content,
    contentSections: Array.isArray(r.content_sections) ? r.content_sections : [],
    inventoryFilter: r.inventory_filter,
    inventoryRequirements: r.inventory_requirements,
    indexable: r.indexable,
    noindexReason: r.noindex_reason,
    canonicalUrl: r.canonical_url,
    priority: r.priority,
    updatedAt: r.updated_at,
  };
}

// Returns null for unknown, draft, archived, or nested paths — callers must
// treat null as not-found (never a 200).
export const getPublicLandingPageByPath = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ path: z.string().max(200) }).parse(input))
  .handler(async ({ data }): Promise<LandingPageView | null> => {
    const path = normalizeLandingPath(data.path);
    if (!path) return null;
    const { data: row, error } = await supabase
      .from("seo_landing_pages")
      .select("*")
      .eq("path", path)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return row ? toView(row) : null;
  });

export const getPublicLandingPagesForDestination = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ destinationId: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<LandingPageView[]> => {
    const { data: rows, error } = await supabase
      .from("seo_landing_pages")
      .select("*")
      .eq("destination_id", data.destinationId)
      .eq("status", "published")
      .order("priority", { ascending: false });
    if (error) throw error;
    return (rows ?? []).map(toView);
  });

export type LandingBundle = {
  page: LandingPageView;
  h1: string;
  sections: { heading: string; body: string }[];
  destination: { slug: string; name: string; heroImage: string; photoCredit: string | null };
  siblings: { path: string; pageType: string }[];
};

// Everything the /$landing route needs in one call. Null → 404.
export const getLandingBundle = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ path: z.string().max(200) }).parse(input))
  .handler(async ({ data }): Promise<LandingBundle | null> => {
    const path = normalizeLandingPath(data.path);
    if (!path) return null;
    const { data: row, error } = await supabase
      .from("seo_landing_pages")
      .select("*")
      .eq("path", path)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    const { data: dest, error: dErr } = await supabase
      .from("destinations")
      .select("slug, name, hero_image, photo_credit")
      .eq("id", row.destination_id)
      .eq("status", "published")
      .maybeSingle();
    if (dErr) throw dErr;
    if (!dest) return null;
    const { data: sib } = await supabase
      .from("seo_landing_pages")
      .select("path, page_type")
      .eq("destination_id", row.destination_id)
      .eq("status", "published")
      .neq("id", row.id)
      .order("priority", { ascending: false });
    const raw = Array.isArray(row.content_sections) ? row.content_sections : [];
    let h1 = row.seo_title ?? dest.name;
    const sections: { heading: string; body: string }[] = [];
    for (const s of raw) {
      if (!s || typeof s !== "object" || Array.isArray(s)) continue;
      const o = s as Record<string, Json | undefined>;
      if (o.type === "h1" && typeof o.text === "string") h1 = o.text;
      else if (typeof o.heading === "string" && typeof o.body === "string")
        sections.push({ heading: o.heading, body: o.body });
    }
    return {
      page: toView(row),
      h1,
      sections,
      destination: {
        slug: dest.slug,
        name: dest.name,
        heroImage: dest.hero_image ?? "",
        photoCredit: dest.photo_credit,
      },
      siblings: (sib ?? []).map((s) => ({ path: s.path, pageType: s.page_type })),
    };
  });
