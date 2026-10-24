import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { LOOPS } from "@/lib/seo/guides";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SearchBar } from "@/components/site/SearchBar";
import { servicePhoto, type ServicePhotoCategory } from "@/lib/data/servicePhotos";
import { PhotoCredit } from "@/components/shared/PhotoCredit";
import { RentalSearch } from "@/components/home/RentalSearch";
import { StartHere } from "@/components/home/StartHere";
import { TripEssentials } from "@/components/destination/TripEssentials";
import { EditorialCard, PlaceCard, SectionHead, SectionLink, SwipeRow, Thumb } from "@/components/ui-kit";
import planImg from "@/assets/thumbs/plan.jpg";
import mapImg from "@/assets/thumbs/map.jpg";
import carImg from "@/assets/thumbs/car.jpg";
import roadImg from "@/assets/thumbs/road.jpg";
import flightImg from "@/assets/thumbs/flight.jpg";
import heroAsset from "@/assets/home/home-hero-trollstigen.jpg.asset.json";
import rvImg from "@/assets/thumbs/rv.jpg";
import {
  getHomepageDestinations,
  type HomepageDestination,
} from "@/lib/data/destinations.functions";

export const Route = createFileRoute("/")({
  loader: async (): Promise<{ homeDestinations: HomepageDestination[] }> => ({
    homeDestinations: await getHomepageDestinations().catch((err) => {
      console.error("[/] getHomepageDestinations failed", err);
      return [];
    }),
  }),
  head: () => ({
    meta: [
      { title: "USA Outdoor Road Trips & Self-Drive Itineraries — MiniaLife" },
      {
        name: "description",
        content:
          "Free USA outdoor road trip itineraries: airport loops, national parks and RV routes. Plan your stops, check entry notes and book with travel partners.",
      },
      { property: "og:title", content: "USA Outdoor Road Trips & Self-Drive Itineraries — MiniaLife" },
      {
        property: "og:description",
        content:
          "Free USA outdoor road trip itineraries: airport loops, national parks and RV routes. Plan your stops, check entry notes and book with travel partners.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&h=630&q=75",
      },
      { property: "og:url", content: "https://minialife.com/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&h=630&q=75" },
    ],
    links: [{ rel: "canonical", href: "https://minialife.com/" }],
  }),
  component: HomePage,
});

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;


const stayTypes: { name: string; category: ServicePhotoCategory; tag: string; why: string; price: string }[] = [
  { name: "In or by the park", category: "hotel", tag: "national_park", why: "Shortest drive to trailheads; books up first.", price: "Est. from $110/night" },
  { name: "Nearby town cabin", category: "cabin", tag: "mountain", why: "More space and a kitchen for groups.", price: "Est. from $120/night" },
  { name: "RV & camping", category: "rvpark", tag: "rv_road_trip", why: "Outdoor sites for tents and RVs; facilities and fees vary.", price: "Est. from $35/night" },
];

const why = [
  { img: planImg, title: "Free trip plans", text: "Day-by-day itineraries you can use without an account." },
  { img: mapImg, title: "Real route maps", text: "Airport drives and stops drawn on an actual map." },
  { img: carImg, title: "Trusted partners", text: "Rentals, stays and tours from approved travel partners." },
  { img: roadImg, title: "Independent guides", text: "Written by MiniaLife, not paid placements." },
];

function HomePage() {
  const { homeDestinations } = Route.useLoaderData();
  const featured = homeDestinations.slice(0, 5);
  const used = new Set(featured.map((d) => d.heroImage));
  const fallbacks = [roadImg, mapImg, rvImg, flightImg];
  const loopImage = (stops: readonly string[], i: number) => { const hit = homeDestinations.find((d) => stops.includes(d.slug) && !used.has(d.heroImage))?.heroImage; if (hit) { used.add(hit); return hit; } return fallbacks[i % fallbacks.length]; };

  return (
    <div className="bg-background">
      <Header />
      <HomeHero />
      <StartHere parkImage={homeDestinations[0]?.heroImage} />

      {featured.length > 0 && (
        <section id="destinations" className="section-y border-t border-border">
          <div className="container-page">
            <SectionHead kicker="Popular right now" title="Where travelers are headed" action={<SectionLink to="/destinations">All destinations</SectionLink>} />
            <SwipeRow className="md:grid-cols-4 md:grid-rows-2">
              {featured.map((d, i) => (
                <div key={d.slug} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
                  <PlaceCard to="/destinations/$slug" params={{ slug: d.slug }} image={d.heroImage} alt={d.name} large={i === 0}
                    badges={[d.bestSeason ? `Best: ${d.bestSeason}` : null, d.tripDurationDays].filter((x): x is string => !!x)}
                    title={d.name} info={d.region} action="See the plan" />
                </div>
              ))}
            </SwipeRow>
          </div>
        </section>
      )}

      <section className="section-y bg-card">
        <div className="container-page">
          <SectionHead kicker="Road trip loops" title="Multi-park routes, planned for you" action={<SectionLink to="/road-trips">All loops</SectionLink>} />
          <SwipeRow className="md:grid-cols-2 lg:grid-cols-4">
            {LOOPS.slice(0, 4).map((l, i) => (
              <PlaceCard key={l.slug} to="/road-trips/$slug" params={{ slug: l.slug }} image={loopImage(l.stops, i)} alt={`${l.title} route scenery`}
                badges={[`${l.stops.length} stops`, l.region]} title={l.title} summary={l.intro} action="See the route" />
            ))}
          </SwipeRow>
        </div>
      </section>

      <section id="rentals-gear" className="section-y">
        <div className="container-page">
          <SectionHead kicker="Step 2 of your trip" title="RV, campervan & airport car rentals" intro="Search Motorhome Republic for RVs or Airport Rentals for cars. Compare the current price for your dates on the partner site." />
          <div className="mx-auto max-w-3xl">
            <RentalSearch />
          </div>
        </div>
      </section>

      <section id="stay-types" className="section-y bg-card">
        <div className="container-page">
          <SectionHead kicker="Where to stay" title="Pick the stay that fits your trip" action={<SectionLink to="/destinations">Browse places</SectionLink>} />
          <SwipeRow className="md:grid-cols-3">
            {stayTypes.map((s) => {
              const photo = servicePhoto(s.category, "homepage-stays");
              return photo ? (
                <figure key={s.name} className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
                  <Link to="/destinations" search={{ tag: s.tag } as never} className="group flex flex-1 flex-col">
                    <div className="aspect-[16/10] overflow-hidden"><img src={photo.url} alt={`${photo.subject} — illustrative photo`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl">{s.name}</h3>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.why}</p>
                      <p className="mt-4 text-lg font-semibold">{s.price} <span className="text-[11px] font-normal text-muted-foreground">typical rate · confirm with partner</span></p>
                    </div>
                  </Link>
                  <PhotoCredit photo={photo} className="absolute right-2 top-2" />
                </figure>
              ) : null;
            })}
          </SwipeRow>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <SectionHead kicker="Trip guides" title="Guides for the way you travel" action={<SectionLink to="/trip-guides">All trip guides</SectionLink>} />
          <SwipeRow className="md:grid-cols-3">
            <EditorialCard to="/fly-and-drive" image={flightImg} title="Fly & Drive" summary="Land at the nearest airport, pick up a car and reach the park the same day." action="Plan a fly-in trip" />
            <EditorialCard to="/no-reservation" image={roadImg} title="No reservation needed" summary="Parks you can visit without timed-entry permits, with current notes." action="See open parks" />
            <EditorialCard to="/rv-camping" image={rvImg} title="RV & camping" summary="Where to pick up an RV and which places suit campers best." action="Plan an RV trip" />
          </SwipeRow>
        </div>
      </section>

      <section className="section-y bg-card">
        <div className="container-page">
          <TripEssentials context={{ slug: "homepage", name: "your road trip" }} />
          <div className="mt-2"><SectionLink to="/gear">Go to the Gear Shop</SectionLink></div>
        </div>
      </section>

      <section className="section-y border-t border-border">
        <div className="container-page">
          <SectionHead kicker="Why MiniaLife" title="Plan with confidence" />
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((w) => <li key={w.title} className="flex items-start gap-4"><Thumb src={w.img} size={64} /><div><h3 className="text-lg">{w.title}</h3><p className="mt-1 text-sm text-muted-foreground">{w.text}</p></div></li>)}
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* =========================================================
   HOME HERO — single photo, one headline, full-weight search,
   neutral fast-path row. Replaces the old 5-panel carousel.
========================================================= */
function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative flex min-h-[560px] w-full items-end md:min-h-[78vh]">
        <img
          src={heroAsset.url}
          alt="Trollstigen mountain road winding through a Norwegian valley"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" />

        <div className="container-page relative z-10 w-full pb-14 text-off-white md:pb-20">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-off-white/75">
            MiniaLife · Outdoor Travel & Road Trips
          </p>
          <h1 className="mt-3 max-w-4xl font-display uppercase leading-[1.05] tracking-[0.01em] text-[34px] md:text-[64px]">
            Plan the drive.<br />We did the rest.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-off-white/90">Free day-by-day road trip itineraries, route maps and booking links — everything in one place.</p>

          <div className="mt-8">
            <Link
              to="/destinations"
              className="inline-flex items-center justify-center rounded-sm bg-off-white px-8 py-3.5 text-sm font-semibold text-ink hover:bg-off-white/90"
            >
              Start planning
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm">
            <Link
              to="/corridors"
              className="font-medium text-off-white/80 hover:text-off-white hover:underline"
            >
              Gateway Road Trips
            </Link>
            <span className="h-1 w-1 rounded-full bg-off-white/40" />
            <Link
              to="/trip-guides"
              className="font-medium text-off-white/80 hover:text-off-white hover:underline"
            >
              All Trip Guides
            </Link>
          </div>
        </div>

        <PhotoCredit
          photo={{
            source: "https://commons.wikimedia.org/wiki/File:Trollstigen_HochPanno.jpg",
            credit: "Stefan Krause",
            license: "CC BY-SA 3.0 · via Wikimedia Commons",
          }}
          className="absolute bottom-2 right-2"
        />
      </div>
    </section>
  );
}

/* =========================================================
   SHARED
========================================================= */
export function DestinationCard({
  d,
  aspect,
  titleClass,
}: {
  d: HomepageDestination;
  aspect: string;
  titleClass: string;
}) {
  const meta = [d.tripDurationDays, d.bestSeason]
    .filter((v): v is string => Boolean(v))
    .join(" · ");

  return (
    <Link to="/destinations/$slug" params={{ slug: d.slug }} className="group block">
      <div className={`relative ${aspect} overflow-hidden rounded-lg`}>
        <img
          src={d.heroImage}
          alt={d.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-off-white">
          <p className="text-xs uppercase tracking-wider text-off-white/80">{d.region}</p>
          <h3 className={`mt-1 font-bold ${titleClass}`}>{d.name}</h3>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-2 text-sm">
        <span className="text-foreground/70">{meta}</span>
        <span className="font-semibold text-foreground/80 group-hover:text-foreground group-hover:underline">
          Plan a trip <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
