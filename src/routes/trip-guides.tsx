import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Car, Map, MapPinned, Plane, Ticket, Truck } from "lucide-react";
import { LOOPS } from "@/lib/seo/guides";
import { CORRIDORS } from "@/lib/seo/corridors";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SITE } from "@/lib/seo/flyDrive";

const title = "Trip Guides: Fly & Drive, RV, Permits & Loops — MiniaLife";
const description = "All MiniaLife trip guides in one place: road trip loops, gateway road trips, fly & drive, RV & camping and no-reservation guides.";

const FAMILIES = [
  { to: "/road-trips", icon: Map, count: `${LOOPS.length} loops`, label: "Road Trip Loops", text: "Multi-park loops with days per stop and drive distances." },
  { to: "/corridors", icon: Plane, count: `${CORRIDORS.length} airport loops`, label: "Gateway Road Trips", text: "Fly into a major airport, drive the loop, fly home." },
  { to: "/fly-and-drive", icon: Car, count: "500 guides", label: "Fly & Drive", text: "Closest airport, drive time, car and first night for every destination." },
  { to: "/rv-camping", icon: Truck, count: "363 guides", label: "RV & Camping", text: "Campgrounds, RV parks and campervan rentals." },
  { to: "/no-reservation", icon: Ticket, count: "228 guides", label: "No Reservation", text: "Entry rules and backup plans where booking matters." },
  { to: "/destinations", icon: MapPinned, count: "500 places", label: "All Destinations", text: "Every place with its map, day-by-day plan and stays." },
];

export const Route = createFileRoute("/trip-guides")({
  head: () => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: `${SITE}/trip-guides` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/trip-guides` }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-page py-14 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Trip Guides</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-foreground md:text-5xl">Find the guide for your trip</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Choose how you're travelling and we'll show every matching guide.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FAMILIES.map((f) => (
            <Link key={f.to} to={f.to} className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground"><f.icon className="h-5 w-5" /></span><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{f.count}</span></div>
              <h2 className="mt-4 font-display text-xl font-semibold text-foreground">{f.label}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{f.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Browse <ArrowUpRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
