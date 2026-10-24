import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { DestinationCard } from "@/routes/index";
import {
  DESTINATIONS_PAGE_SIZE,
  getDestinationsList,
  TRIP_TAG_OPTIONS,
} from "@/lib/data/destinations.functions";
import { SEASONS, US_REGIONS } from "@/lib/data/usRegions";
import { FilterPanel } from "@/components/site/FilterPanel";
import { Button } from "@/components/ui/button";

const SearchSchema = z.object({
  tag: z.string().optional(),
  region: z.string().optional(),
  season: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export const Route = createFileRoute("/destinations/")({
  validateSearch: (search) => SearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ tag: search.tag, region: search.region, season: search.season, q: search.q, page: search.page ?? 1 }),
  loader: async ({ deps }) => {
    const result = await getDestinationsList({
      data: { tag: deps.tag, region: deps.region, season: deps.season, q: deps.q, page: deps.page },
    }).catch((err) => {
      console.error("[/destinations] getDestinationsList failed", err);
      return { destinations: [], total: 0 };
    });
    return { ...result, tag: deps.tag ?? null, region: deps.region ?? "", season: deps.season ?? "", q: deps.q ?? "", page: deps.page };
  },
  head: ({ loaderData }) => {
    const isFiltered = Boolean(loaderData?.tag || loaderData?.region || loaderData?.season || loaderData?.q) || (loaderData?.page ?? 1) > 1;
    return {
      meta: [
        { title: "All Destinations — Minialife" },
        {
          name: "description",
          content:
            "Every destination Minialife covers — camping, glamping, RV travel, cabins and national parks.",
        },
        { property: "og:title", content: "All Destinations — Minialife" },
        {
          property: "og:description",
          content:
            "Browse every outdoor destination we cover: camping, glamping, RV travel, cabins and national parks.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        // Filtered and paginated variants are duplicates of the main list.
        ...(isFiltered ? [{ name: "robots", content: "noindex, follow" }] : []),
        { property: "og:url", content: "https://minialife.com/destinations" },
      ],
      links: [{ rel: "canonical", href: "https://minialife.com/destinations" }],
    };
  },
  component: DestinationsIndexPage,
});

function pageLinkClass(active: boolean) {
  return (
    "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
    (active ? "bg-ink text-off-white" : "border border-border text-foreground/70 hover:bg-muted")
  );
}

function paginationLinkClass(disabled: boolean) {
  return (
    "rounded-full border border-border px-4 py-2 text-xs font-semibold transition " +
    (disabled ? "pointer-events-none opacity-40" : "text-foreground hover:bg-muted")
  );
}

function DestinationsIndexPage() {
  const { destinations, total, tag, region, season, q, page } = Route.useLoaderData();
  const keep = { tag: tag ?? undefined, region: region || undefined, season: season || undefined, q: q || undefined };
  const activeTag = TRIP_TAG_OPTIONS.find((t) => t.value === tag);
  const totalPages = Math.max(1, Math.ceil(total / DESTINATIONS_PAGE_SIZE));

  return (
    <div className="bg-background">
      <Header />
      <main className="container-page py-16">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">
          {total} destination{total === 1 ? "" : "s"}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          {activeTag ? activeTag.label : "All destinations"}
        </h1>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/destinations" className={pageLinkClass(!tag)}>
            All
          </Link>
          {TRIP_TAG_OPTIONS.map((t) => (
            <Link
              key={t.value}
              to="/destinations"
              search={{ tag: t.value }}
              className={pageLinkClass(tag === t.value)}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="mt-6"><FilterPanel><form method="get" action="/destinations" className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          {tag && <input type="hidden" name="tag" value={tag} />}
          <input name="q" defaultValue={q} placeholder="Search by name" aria-label="Search destinations by name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select name="region" defaultValue={region} aria-label="Region" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="">All regions</option>
            {Object.entries(US_REGIONS).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
          </select>
          <select name="season" defaultValue={season} aria-label="Best season" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="">Any season</option>
            {SEASONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
          <Button type="submit" size="lg">Show destinations</Button>
        </form></FilterPanel></div>

        {destinations.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">
            No destinations to show here.{" "}
            <Link to="/destinations" className="underline underline-offset-2 hover:text-foreground">
              View all destinations
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((d) => (
                <DestinationCard key={d.slug} d={d} aspect="aspect-[4/3]" titleClass="text-xl" />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-12 flex items-center justify-center gap-3"
                aria-label="Destinations pagination"
              >
                <Link
                  to="/destinations"
                  search={{ ...keep, page: Math.max(1, page - 1) }}
                  aria-disabled={page <= 1}
                  className={paginationLinkClass(page <= 1)}
                >
                  Previous
                </Link>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Link
                  to="/destinations"
                  search={{ ...keep, page: Math.min(totalPages, page + 1) }}
                  aria-disabled={page >= totalPages}
                  className={paginationLinkClass(page >= totalPages)}
                >
                  Next
                </Link>
              </nav>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
