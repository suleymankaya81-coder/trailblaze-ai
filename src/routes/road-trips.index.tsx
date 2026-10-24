import { createFileRoute, Link } from "@tanstack/react-router";
import { getDestinationCovers } from "@/lib/data/destinations.functions";
import { ArrowUpRight, MapPin } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { LOOPS } from "@/lib/seo/guides";
import { SITE } from "@/lib/seo/flyDrive";

const title = "USA Road Trips: Airport Loops & Multi-Park Routes — MiniaLife";
const description = `${LOOPS.length} road-trip loops linking nearby national parks and scenic towns, with suggested days per stop, leg distances and booking notes.`;

export const Route = createFileRoute("/road-trips/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/road-trips` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/road-trips` }],
  }),
  loader: () => getDestinationCovers({ data: { slugs: [...new Set(LOOPS.flatMap((l) => l.stops))] } }),
  component: Page,
});

function Page() {
  const covers = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero image={Object.values(covers)[0]} kicker="Road trips" title="All road trips in one place" intro="Self-drive loops linking parks and towns, with suggested days per stop and approximate distances. Flying in? Start from an airport loop.">
        <nav aria-label="Road trip types" className="flex flex-wrap gap-2">
          <Link to="/corridors" className="rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-foreground">From an airport (24)</Link>
          <a href="#loops" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Multi-park loops ({LOOPS.length})</a>
        </nav>
      </PageHero>
      <main className="container-page py-10 md:py-14">
        <Link to="/corridors" className="flex flex-col gap-2 rounded-3xl border-2 border-forest bg-card p-6 shadow-soft transition hover:shadow-lg md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Gateway Road Trips · Fly in, loop, fly home</p>
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">Road trips from major arrival airports</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">Loops that start and end at a major U.S. airport, with suggested trip lengths, entry, licence and park-pass notes for international visitors. 24 loops from Las Vegas, Los Angeles, San Francisco, Seattle, Salt Lake City, Denver, Boston, Chicago, Miami, Anchorage and more.</p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">See all gateway road trips <ArrowUpRight className="h-4 w-4" /></span>
        </Link>
        <h2 id="loops" className="mt-14 scroll-mt-28 font-display text-2xl font-semibold text-foreground">All {LOOPS.length} loops</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOOPS.map((l) => { const s = l.stops.find((x) => covers[x]); const cover = s ? covers[s] : undefined; return (
            <Link key={l.slug} to="/road-trips/$slug" params={{ slug: l.slug }} className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
{cover ? <div className="relative aspect-[16/9] overflow-hidden bg-muted"><img src={cover} alt={`${l.title} — route scenery`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div> : null}
              <div className="flex flex-1 flex-col p-6">
              <p className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{l.region}<span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">{l.stops.length} stops</span></p>
              <h2 className="mt-2 font-display text-xl font-semibold text-foreground">{l.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{l.intro}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">See the loop <ArrowUpRight className="h-4 w-4" /></span>
              </div>
            </Link>
          );})}
        </div>
      </main>
      <Footer />
    </div>
  );
}
