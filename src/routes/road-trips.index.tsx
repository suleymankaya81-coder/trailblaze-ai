import { createFileRoute, Link } from "@tanstack/react-router";
import { getDestinationCovers } from "@/lib/data/destinations.functions";
import { ArrowUpRight } from "lucide-react";
import { PlaceCard, SectionHead } from "@/components/ui-kit";
import roadImg from "@/assets/thumbs/road.jpg";
import flightImg from "@/assets/thumbs/flight.jpg";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { LOOPS } from "@/lib/seo/guides";
import { SITE } from "@/lib/seo/flyDrive";
import { HUB_SEO } from "@/lib/seo/hubSeo";

const title = HUB_SEO.roadTrips.title;
const description = HUB_SEO.roadTrips.description;

export const Route = createFileRoute("/road-trips/")({
  head: ({ loaderData }) => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/road-trips` },
      { name: "twitter:card", content: "summary_large_image" },
      ...((image => image?.startsWith("https://") ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : [])(Object.values(loaderData ?? {})[0])),
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
        <Link to="/corridors" className="group grid overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-soft md:grid-cols-[2fr_3fr]">
          <img src={flightImg} alt="" loading="lazy" className="aspect-[16/10] h-full w-full object-cover md:aspect-auto" />
          <div className="p-6 md:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-deep">Gateway Road Trips · Fly in, loop, fly home</p>
            <h2 className="mt-2 text-[26px] leading-tight text-foreground md:text-3xl">Road trips from major arrival airports</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">24 loops that start and end at a major U.S. airport, with trip lengths and entry, licence and park-pass notes for overseas visitors.</p>
            <span className="mt-6 inline-flex min-h-12 items-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">See all gateway road trips <ArrowUpRight className="h-4 w-4" /></span>
          </div>
        </Link>
        <div id="loops" className="mt-14 scroll-mt-28"><SectionHead kicker="Multi-park loops" title={`All ${LOOPS.length} loops`} intro="Self-drive routes linking nearby parks and towns, with suggested days per stop." /></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LOOPS.map((l) => { const s = l.stops.find((x) => covers[x]); return (
            <PlaceCard key={l.slug} to="/road-trips/$slug" params={{ slug: l.slug }} image={s ? covers[s] : roadImg} alt={`${l.title} route scenery`} title={l.title} summary={l.intro} badges={[`${l.stops.length} stops`, l.region]} action="See the loop" />
          );})}
        </div>
      </main>
      <Footer />
    </div>
  );
}
