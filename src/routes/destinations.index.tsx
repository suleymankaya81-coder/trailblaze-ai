import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { DestinationCard } from "@/routes/index";
import { getDestinationsList, TRIP_TAG_OPTIONS } from "@/lib/data/destinations.functions";

const SearchSchema = z.object({ tag: z.string().optional() });

export const Route = createFileRoute("/destinations/")({
  validateSearch: (search) => SearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ tag: search.tag }),
  loader: async ({ deps }) => {
    const destinations = await getDestinationsList({ data: { tag: deps.tag } }).catch((err) => {
      console.error("[/destinations] getDestinationsList failed", err);
      return [];
    });
    return { destinations, tag: deps.tag ?? null };
  },
  head: () => ({
    meta: [
      { title: "All Destinations — Minialife" },
      {
        name: "description",
        content:
          "Every destination Minialife covers — camping, glamping, RV travel, cabins and national parks.",
      },
    ],
  }),
  component: DestinationsIndexPage,
});

function DestinationsIndexPage() {
  const { destinations, tag } = Route.useLoaderData();
  const activeTag = TRIP_TAG_OPTIONS.find((t) => t.value === tag);

  return (
    <div className="bg-background">
      <Header />
      <main className="container-page py-16">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">
          {destinations.length} destination{destinations.length === 1 ? "" : "s"}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          {activeTag ? activeTag.label : "All destinations"}
        </h1>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/destinations"
            className={
              "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
              (!tag
                ? "bg-ink text-off-white"
                : "border border-border text-foreground/70 hover:bg-muted")
            }
          >
            All
          </Link>
          {TRIP_TAG_OPTIONS.map((t) => (
            <Link
              key={t.value}
              to="/destinations"
              search={{ tag: t.value }}
              className={
                "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
                (tag === t.value
                  ? "bg-ink text-off-white"
                  : "border border-border text-foreground/70 hover:bg-muted")
              }
            >
              {t.label}
            </Link>
          ))}
        </div>

        {destinations.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">
            No destinations match this filter yet.{" "}
            <Link to="/destinations" className="underline underline-offset-2 hover:text-foreground">
              View all destinations
            </Link>
            .
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d) => (
              <DestinationCard key={d.slug} d={d} aspect="aspect-[4/5]" titleClass="text-xl" />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
