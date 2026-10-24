import { createFileRoute, Link } from "@tanstack/react-router";
import { PlaceCard } from "@/components/ui-kit";
import roadImg from "@/assets/thumbs/road.jpg";
import flightImg from "@/assets/thumbs/flight.jpg";
import carImg from "@/assets/thumbs/car.jpg";
import rvImg from "@/assets/thumbs/rv.jpg";
import planImg from "@/assets/thumbs/plan.jpg";
import mapImg from "@/assets/thumbs/map.jpg";
import { LOOPS } from "@/lib/seo/guides";
import { CORRIDORS } from "@/lib/seo/corridors";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { getDestinationCovers } from "@/lib/data/destinations.functions";
import { SITE } from "@/lib/seo/flyDrive";

const title = "Trip Guides: Fly & Drive, RV, Permits & Loops — MiniaLife";
const description = "All MiniaLife trip guides in one place: road trip loops, gateway road trips, fly & drive, RV & camping and no-reservation guides.";

const FAMILIES = [
  { cover: "zion", to: "/road-trips", icon: roadImg, count: `${LOOPS.length} loops`, label: "Road Trip Loops", text: "Multi-park loops with days per stop and drive distances." },
  { cover: "big-sur", to: "/corridors", icon: flightImg, count: `${CORRIDORS.length} airport loops`, label: "Gateway Road Trips", text: "Fly into a major airport, drive the loop, fly home." },
  { cover: "acadia", to: "/fly-and-drive", icon: carImg, count: "500 guides", label: "Fly & Drive", text: "Closest airport, drive time, car and first night for every destination." },
  { cover: "grand-teton", to: "/rv-camping", icon: rvImg, count: "363 guides", label: "RV & Camping", text: "Campgrounds, RV parks and campervan rentals." },
  { cover: "arches-national-park", to: "/no-reservation", icon: planImg, count: "228 guides", label: "No Reservation", text: "Entry rules and backup plans where booking matters." },
  { cover: "yellowstone", to: "/destinations", icon: mapImg, count: "500 places", label: "All Destinations", text: "Every place with its map, day-by-day plan and stays." },
];

export const Route = createFileRoute("/trip-guides")({
  head: ({ loaderData }) => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      ...((image => image?.startsWith("https://") ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : [])(loaderData?.["yellowstone"] ?? Object.values(loaderData ?? {})[0])),
      { property: "og:url", content: `${SITE}/trip-guides` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/trip-guides` }],
  }),
  loader: () => getDestinationCovers({ data: { slugs: FAMILIES.map((f) => f.cover) } }),
  component: Page,
});

function Page() {
  const covers = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero image={covers["yellowstone"] ?? Object.values(covers)[0]} kicker="Trip Guides" title="Find the guide for your trip" intro="Choose how you're travelling and we'll show every matching guide." />
      <main className="container-page py-10 md:py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FAMILIES.map((f) => (
            <PlaceCard key={f.to} to={f.to} image={covers[f.cover] ?? f.icon} alt={f.label} title={f.label} summary={f.text} badges={[f.count]} action="Browse" />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
