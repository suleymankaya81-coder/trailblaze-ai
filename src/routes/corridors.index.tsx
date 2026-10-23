import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Plane } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
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
  component: Page,
});

function Page() {
  const list = CORRIDORS.filter((c) => !c.pilot);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-page py-14 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Gateway Road Trips</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-foreground md:text-5xl">USA road trip loops from arrival airports</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Each route starts and ends at a major U.S. airport, so you return the car where you picked it up. Built for visitors arriving from overseas.
        </p>
        {CORRIDOR_AREAS.map((area) => (
          <section key={area} className="mt-12">
            <h2 className="font-display text-2xl font-semibold text-foreground">{area}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.filter((c) => corridorArea(c) === area).map((c) => (
            <Link key={c.slug} to="/corridors/$slug" params={{ slug: c.slug }} className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><Plane className="h-3.5 w-3.5" />{c.gateway.code} · {c.region} · {c.idealDays}</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.intro}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">See the route <ArrowUpRight className="h-4 w-4" /></span>
            </Link>
          ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
