import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bike,
  Compass,
  Glasses,
  MapPin,
  Moon,
  Mountain,
  Sparkles,
  Sun,
  Tent,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

import { LOOPS } from "@/lib/seo/guides";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SearchBar } from "@/components/site/SearchBar";
import { Button } from "@/components/ui/button";
import { servicePhoto, type ServicePhotoCategory } from "@/lib/data/servicePhotos";
import { AirportRentalsCards } from "@/components/destination/AirportRentalsCards";
import { RentalSearch } from "@/components/home/RentalSearch";
import {
  getHomepageDestinations,
  TRIP_TAG_OPTIONS,
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


// Icon-forward, not photo-forward — deliberately: this site already has
// one image-mismatch incident behind it, and there's no real per-tag
// photography to source without risking another one.
const planBuilderCards = TRIP_TAG_OPTIONS.map((t, i) => ({
  ...t,
  icon: [Tent, Truck, Sparkles, Users, Mountain, Sun][i] ?? Tent,
}));

const stayTypes: { name: string; category: ServicePhotoCategory; tag: string }[] = [
  { name: "Campgrounds", category: "tent", tag: "family" },
  { name: "Glamping", category: "glamping", tag: "glamping" },
  { name: "RV Parks", category: "rvpark", tag: "rv_road_trip" },
  { name: "Tiny Houses", category: "tinyhouse", tag: "weekend" },
  { name: "Cabins", category: "cabin", tag: "mountain" },
  { name: "Lodges", category: "hotel", tag: "national_park" },
];

const planIncludes = [
  {
    icon: Tent,
    title: "Curated stays",
    blurb: "Campgrounds, glamping, cabins and lodges worth the drive.",
  },
  {
    icon: Compass,
    title: "Choose your wheels",
    blurb: "Compare RV and campervan rentals, airport cars and SUVs with our travel partners.",
  },
  {
    icon: Sparkles,
    title: "Local experiences",
    blurb: "Hand-picked tours, hikes and golden-hour drives.",
  },
  {
    icon: Wallet,
    title: "Before you set off",
    blurb: "Destination-specific entry notes and seasonal considerations before you book.",
  },
  {
    icon: MapPin,
    title: "On-the-ground tips",
    blurb: "Weather, crowds, wildlife and safety, in plain English.",
  },
];

const stories = [
  {
    tag: "Field Notes",
    title: "Why shoulder season is the smartest time for national parks.",
    image: img("photo-1455156218388-5e61b526818b"),
  },
  {
    tag: "Road Trip",
    title: "A 7-day campervan loop through the American Southwest.",
    image: img("photo-1500534314209-a25ddb2bd429"),
  },
  {
    tag: "Gear",
    title: "The 12 things that actually matter on your first camping trip.",
    image: img("photo-1504280390367-361c6d9f38f4"),
  },
];

function HomePage() {
  const { homeDestinations } = Route.useLoaderData();
  const largeDestinations = homeDestinations.slice(0, 3);
  const compactDestinations = homeDestinations.slice(3, 6);


  return (
    <div className="bg-background">
      <Header />

      <HomeHero />

      {/* DESTINATIONS — one grid: three large + three compact */}
      {homeDestinations.length > 0 && (
        <section id="destinations" className="bg-background py-20">
          <div className="container-page">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">
                  Popular right now
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Where travelers are headed
                </h2>
              </div>
              <Link
                to="/destinations"
                className="text-sm font-semibold text-foreground/80 hover:text-foreground hover:underline"
              >
                View all destinations <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {largeDestinations.map((d) => (
                <DestinationCard key={d.slug} d={d} aspect="aspect-[4/5]" titleClass="text-2xl" />
              ))}
            </div>

            {compactDestinations.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {compactDestinations.map((d) => (
                  <DestinationCard key={d.slug} d={d} aspect="aspect-[4/3]" titleClass="text-lg" />
                ))}
              </div>
            )}

            {/* 6 featured cards are "currently highlighted," not "all we have." */}
            <div className="mt-10 text-center">
              <Link
                to="/destinations"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Explore all destinations <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ROAD TRIP LOOPS — routes are the heart of MiniaLife */}
      <section className="bg-beige py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">
                Road trip loops
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Multi-park routes, planned for you
              </h2>
            </div>
            <Link
              to="/road-trips"
              className="text-sm font-semibold text-foreground/80 hover:text-foreground hover:underline"
            >
              View all loops <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {LOOPS.slice(0, 3).map((l) => (
              <Link
                key={l.slug}
                to="/road-trips/$slug"
                params={{ slug: l.slug }}
                className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {l.region} · {l.stops.length} stops
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{l.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{l.intro}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  See the loop <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PLAN BUILDER — trip-tag shortcuts into the filtered destinations list */}
      <section className="bg-background py-16">
        <div className="container-page">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">
              Plan Builder
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              What kind of trip are you after?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {planBuilderCards.map((c) => (
              <Link
                key={c.value}
                to="/destinations"
                search={{ tag: c.value }}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-6 text-center transition hover:border-foreground/30 hover:shadow-soft"
              >
                <c.icon className="h-6 w-6 text-foreground/70 transition group-hover:text-foreground" />
                <span className="text-sm font-semibold text-foreground">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="rentals-gear" className="bg-beige py-20">
        <div className="container-page">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">Rental ideas</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">RV, campervan & airport car rentals</h2>
          </div>
          <RentalSearch />
          <div className="grid gap-5 md:grid-cols-2">
            <AirportRentalsCards slug="homepage" />
          </div>
        </div>
      </section>

      {/* CURATED TRIP ESSENTIALS — gear framed as route support, not a store */}
      <section className="bg-background py-16">
        <div className="container-page">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">
                Curated Trip Essentials
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Gear picked by MiniaLife for the road
              </h2>
            </div>
            <Link
              to="/gear"
              className="text-sm font-semibold text-foreground/80 hover:text-foreground hover:underline"
            >
              Browse the Gear Shop <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Bike, title: "7 Bikepacking Essentials", blurb: "Bags, tools and kit for self-supported rides.", to: "/gear/7-bikepacking-essentials" as const },
              { icon: Glasses, title: "Best Cycling Accessories", blurb: "Everyday upgrades for comfort and safety.", to: "/gear/best-cycling-accessories" as const },
              { icon: Moon, title: "Night Vision Spotlight", blurb: "WILDGUARDER binoculars for wildlife after dark.", to: "/gear" as const, hash: "night-vision" },
              { icon: Tent, title: "All Gear Categories", blurb: "Camping, hiking, optics, apparel and more.", to: "/gear" as const },
            ].map((c) => (
              <Link
                key={c.title}
                to={c.to}
                hash={"hash" in c ? c.hash : undefined}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/30 hover:shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground/70 transition group-hover:text-foreground">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{c.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{c.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Explore <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STAY TYPES — the one category-tile grid */}
      <section id="stay-types" className="bg-background py-20">
        <div className="container-page">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">
              Stays for every style
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              From canvas tents to cliffside cabins
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {stayTypes.map((s) => {
              const photo = servicePhoto(s.category, "homepage-stays");
              if (!photo) return null;
              return (
              <figure key={s.name}>
              <Link
                to="/destinations"
                search={{ tag: s.tag } as never}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg"
              >
                <img
                  src={photo.url}
                  alt={`${photo.subject} — illustrative ${s.name.toLowerCase()} photo`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
                <h3 className="absolute bottom-4 left-4 right-4 text-base font-bold text-off-white md:text-lg">
                  {s.name}
                </h3>
              </Link>
              <figcaption className="mt-2 text-[10px] text-muted-foreground">Illustrative · <a href={photo.source} target="_blank" rel="noopener noreferrer" className="underline">{photo.credit} · {photo.license}</a></figcaption>
              </figure>
            );})}
          </div>
        </div>
      </section>


      {/* CLOSING — single dark band: trip-plan pitch + closing CTA merged */}
      <section id="how" className="bg-ink py-24 text-off-white">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-off-white/60">
              Everything in one place
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold leading-[1.05] md:text-5xl">
              A complete trip plan, free.
            </h2>
            <p className="mt-5 text-off-white/80">
              Choose a prepared itinerary, explore the stops and check entry notes.
              Book flights, stays, vehicles and experiences separately with our travel partners.
            </p>
            <div className="mt-8">
              <Button asChild variant="hero" size="xl">
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Build my trip <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {planIncludes.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-off-white/15 bg-off-white/5 p-6 backdrop-blur"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-off-white/10 text-off-white">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm text-off-white/70">{p.blurb}</p>
              </div>
            ))}
          </div>
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
      <div className="relative flex min-h-[560px] w-full items-end md:min-h-[640px]">
        <img
          src={img("photo-1506905925346-21bda4d32df4", 2000)}
          alt="Alpine valley at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/10" />

        <div className="container-page relative z-10 w-full pb-14 text-off-white md:pb-20">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-off-white/75">
            MiniaLife · Outdoor Travel & Road Trips
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">
            USA outdoor road trips
          </h1>
          <p className="mt-4 max-w-2xl text-base text-off-white/90">Free self-drive itineraries, national park loops and arrival plans — for visitors flying in and travelers already on the road.</p>

          <div className="mt-8 max-w-2xl">
            <SearchBar size="lg" />
          </div>

          <div className="mt-5 flex items-center gap-4 text-sm">
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
      <div className={`relative ${aspect} overflow-hidden rounded-2xl`}>
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
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-foreground/70">{meta}</span>
        <span className="font-semibold text-foreground/80 group-hover:text-foreground group-hover:underline">
          Plan a trip <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
