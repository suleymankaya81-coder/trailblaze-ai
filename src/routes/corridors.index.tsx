import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Plane } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { getDestinationCovers } from "@/lib/data/destinations.functions";
import { CORRIDORS, CORRIDOR_AREAS, corridorArea } from "@/lib/seo/corridors";

const title = "USA Airport Road Trip Loops: Gateway Road Trips — MiniaLife";
const description =
  "Free USA self-drive itineraries that return to your arrival airport. Compare national park and coastal loops, suggested days and notes for overseas visitors.";
const url = "https://minialife.com/corridors";

export const Route = createFileRoute("/corridors/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: url }],
  }),
  loader: () => getDestinationCovers({ data: { slugs: [...new Set(CORRIDORS.flatMap((c) => c.stops))] } }),
  component: Page,
});

function Page() {
  const list = CORRIDORS.filter((c) => !c.pilot);
  const covers = Route.useLoaderData();
  const coverFor = (stops: string[]) => { const s = stops.slice(1).find((x) => covers[x]) ?? stops.find((x) => covers[x]); return s ? covers[s] : undefined; };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero image={coverFor(list[0]?.stops ?? [])} kicker="Road Trips · From an airport" title="USA road trip loops from arrival airports" intro="Each route starts and ends at a major U.S. airport, so you return the car where you picked it up. Built for visitors arriving from overseas.">
        <nav aria-label="Road trip types" className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">From an airport ({CORRIDORS.length})</span>
          <Link to="/road-trips" hash="loops" className="rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-foreground">Multi-park loops</Link>
        </nav>
        <div className="mt-6 flex flex-wrap gap-2">
          {CORRIDOR_AREAS.map((area) => <a key={area} href={`#${area.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="rounded-full border border-background/40 px-4 py-1.5 text-xs font-semibold text-background hover:bg-background/10">{area}</a>)}
        </div>
      </PageHero>
      <main className="container-page py-6 md:py-10">
        {CORRIDOR_AREAS.map((area) => (
          <section key={area} id={area.toLowerCase().replace(/[^a-z]+/g, "-")} className="mt-12 scroll-mt-28">
            <h2 className="font-display text-2xl font-semibold text-foreground">{area}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.filter((c) => corridorArea(c) === area).map((c) => { const cover = coverFor(c.stops); return (
            <Link key={c.slug} to="/corridors/$slug" params={{ slug: c.slug }} className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
{cover ? <div className="relative aspect-[16/9] overflow-hidden bg-muted"><img src={cover} alt={`${c.title} — route scenery`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div> : null}
              <div className="flex flex-1 flex-col p-6">
              <p className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground"><Plane className="h-3 w-3" />{c.gateway.code}</span><span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">{c.idealDays}</span><span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">{c.stops.length} stops</span></p>
              <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.intro}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">See the route <ArrowUpRight className="h-4 w-4" /></span>
              </div>
            </Link>
          );})}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
