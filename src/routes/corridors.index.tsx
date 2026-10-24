import { createFileRoute, Link } from "@tanstack/react-router";
import { PlaceCard } from "@/components/ui-kit";
import flightImg from "@/assets/thumbs/flight.jpg";

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
  head: ({ loaderData }) => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      ...((image => image?.startsWith("https://") ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : [])((() => { const stops = CORRIDORS.filter(c => !c.pilot)[0]?.stops ?? []; const slug = stops.slice(1).find(s => loaderData?.[s]) ?? stops.find(s => loaderData?.[s]); return slug ? loaderData?.[slug] : undefined; })())),
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
          {CORRIDOR_AREAS.map((area) => <a key={area} href={`#${area.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="inline-flex min-h-11 items-center rounded-full border border-background/40 px-4 text-xs font-semibold text-background hover:bg-background/10">{area}</a>)}
        </div>
      </PageHero>
      <main className="container-page py-6 md:py-10">
        {CORRIDOR_AREAS.map((area) => (
          <section key={area} id={area.toLowerCase().replace(/[^a-z]+/g, "-")} className="mt-12 scroll-mt-28">
            <h2 className="text-[26px] leading-tight text-foreground md:text-3xl">{area}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.filter((c) => corridorArea(c) === area).map((c) => (
            <PlaceCard key={c.slug} to="/corridors/$slug" params={{ slug: c.slug }} image={coverFor(c.stops) ?? flightImg} alt={`${c.title} route scenery`} title={c.title} summary={c.intro} badges={[`✈ ${c.gateway.code}`, c.idealDays, `${c.stops.length} stops`]} action="See the route" />
          ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
