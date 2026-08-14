import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SearchBar } from "@/components/site/SearchBar";
import { findDestinationSlugByQuery } from "@/lib/data/destinations.functions";

const SearchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/search")({
  validateSearch: (search) => SearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ q: search.q ?? "" }),
  loader: async ({ deps }): Promise<{ q: string }> => {
    const q = deps.q.trim();
    if (q) {
      const { slug } = await findDestinationSlugByQuery({ data: { query: q } });
      if (slug) throw redirect({ to: "/destinations/$slug", params: { slug } });
    }
    // No match (or no query at all) — render the no-results state below
    // instead of guessing at a destination.
    return { q };
  },
  head: () => ({
    meta: [
      { title: "Search Destinations — Minialife" },
      {
        name: "description",
        content:
          "Search Minialife for a national park, lake, desert or road-trip destination and open its full travel guide.",
      },
      // Query-driven, thin result page — kept out of search indexes.
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Search Destinations — Minialife" },
      {
        property: "og:description",
        content: "Find the outdoor destination you're planning and open its full guide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NoSearchMatch,
});

function NoSearchMatch() {
  const { q } = Route.useLoaderData();

  return (
    <div className="bg-beige/30">
      <Header />
      <main className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">
          {q ? "No match found" : "Search"}
        </p>
        <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
          {q ? `We couldn't find "${q}"` : "Where do you want to go?"}
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          Try another destination name, or browse everywhere we cover.
        </p>
        <div className="mt-8 w-full max-w-xl">
          <SearchBar size="md" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
