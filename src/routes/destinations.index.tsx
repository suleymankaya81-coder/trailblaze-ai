import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PlaceCard } from "@/components/ui-kit";
import { PageHero } from "@/components/site/PageHero";
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
    "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition " +
    (active ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:border-primary")
  );
}

function paginationLinkClass(disabled: boolean) {
  return (
    "inline-flex min-h-12 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold transition " +
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
      <PageHero image={destinations[0]?.heroImage} kicker={`${total} destination${total === 1 ? "" : "s"}`} title={activeTag ? activeTag.label : "All destinations"} intro="National parks, outdoor towns and scenic places, each with a day-by-day plan, arrival airport and where to stay." />
      <main className="container-page py-10 md:py-14">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
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
          <input name="q" defaultValue={q} placeholder="Search by name" aria-label="Search destinations by name" className="h-12 rounded-lg border border-border bg-card px-3 text-sm" />
          <select name="region" defaultValue={region} aria-label="Region" className="h-12 rounded-lg border border-border bg-card px-3 text-sm">
            <option value="">All regions</option>
            {Object.entries(US_REGIONS).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
          </select>
          <select name="season" defaultValue={season} aria-label="Best season" className="h-12 rounded-lg border border-border bg-card px-3 text-sm">
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
            <p className="mt-8 text-sm text-muted-foreground">Showing {destinations.length} of {total}</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((d) => (
                <PlaceCard key={d.slug} to="/destinations/$slug" params={{ slug: d.slug }} image={d.heroImage} alt={d.name} title={d.name}
                  badges={[d.bestSeason ? `Best: ${d.bestSeason}` : "", d.tripDurationDays ?? ""].filter(Boolean)} info={d.region} />
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
