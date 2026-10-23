import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { LOOPS } from "@/lib/seo/guides";
import { SITE } from "@/lib/seo/flyDrive";

const title = "Multi-Park Road Trip Loops in the USA — MiniaLife";
const description = `${LOOPS.length} road-trip loops linking nearby national parks and scenic towns, with suggested days per stop, leg distances and booking notes.`;

export const Route = createFileRoute("/road-trips/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/road-trips` }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-page py-14 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Road trips</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-foreground md:text-5xl">Multi-park road trip loops</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Routes that link nearby parks and towns, with no long drives between stops.</p>
        <Link to="/corridors" className="mt-10 flex flex-col gap-2 rounded-3xl border-2 border-forest bg-card p-6 shadow-soft transition hover:shadow-lg md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Gateway Road Trips · Fly in, loop, fly home</p>
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">Road trips from major arrival airports</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">Multi-week loops that start and end at a major U.S. airport, with entry, licence and park-pass notes for international visitors. 24 loops from Las Vegas, Los Angeles, San Francisco, Seattle, Salt Lake City, Denver, Boston, Chicago, Miami, Anchorage and more.</p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">See all gateway road trips <ArrowUpRight className="h-4 w-4" /></span>
        </Link>
        <h2 className="mt-14 font-display text-2xl font-semibold text-foreground">All {LOOPS.length} loops</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOOPS.map((l) => (
            <Link key={l.slug} to="/road-trips/$slug" params={{ slug: l.slug }} className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{l.region} · {l.stops.length} stops</p>
              <h2 className="mt-2 font-display text-xl font-semibold text-foreground">{l.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{l.intro}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">See the loop <ArrowUpRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
