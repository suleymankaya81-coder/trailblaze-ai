import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Backpack,
  Compass,
  MapPin,
  Mountain,
  Sparkles,
  Sun,
  Tent,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SearchBar } from "@/components/site/SearchBar";
import { Button } from "@/components/ui/button";
import {
  getFeaturedGearOffers,
  getHomepageDestinations,
  TRIP_TAG_OPTIONS,
  type FeaturedGearOffer,
  type HomepageDestination,
} from "@/lib/data/destinations.functions";

export const Route = createFileRoute("/")({
  loader: async (): Promise<{
    gearOffers: FeaturedGearOffer[];
    homeDestinations: HomepageDestination[];
  }> => {
    // Defensive: both of these are homepage nice-to-haves, so a Supabase
    // hiccup on either should just hide that section, never take down the
    // whole homepage.
    const [gearOffers, homeDestinations] = await Promise.all([
      getFeaturedGearOffers().catch((err) => {
        console.error("[/] getFeaturedGearOffers failed", err);
        return [];
      }),
      getHomepageDestinations().catch((err) => {
        console.error("[/] getHomepageDestinations failed", err);
        return [];
      }),
    ]);
    return { gearOffers, homeDestinations };
  },
  head: () => ({
    meta: [
      { title: "Minialife — Plan Your Next Outdoor Escape" },
      {
        name: "description",
        content:
          "A complete outdoor trip in one place. Discover destinations, stays, RV rentals and gear for camping, glamping, road trips and national parks.",
      },
      { property: "og:title", content: "Minialife — Plan Your Next Outdoor Escape" },
      {
        property: "og:description",
        content:
          "Where to go, where to stay, what to rent, what to pack. Built for travelers who'd rather be outside.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
      },
      { property: "og:url", content: "https://minialife.com/" },
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

const stayTypes = [
  { name: "Campgrounds", image: img("photo-1504280390367-361c6d9f38f4") },
  { name: "Glamping", image: img("photo-1517824806704-9040b037703b") },
  { name: "RV Parks", image: img("photo-1533873984035-25970ab07461") },
  { name: "Tiny Houses", image: img("photo-1518780664697-55e3ad937233") },
  { name: "Cabins", image: img("photo-1464822759023-fed622ff2c3b") },
  { name: "Lodges", image: img("photo-1510798831971-661eb04b3739") },
];

const planIncludes = [
  {
    icon: Tent,
    title: "Curated stays",
    blurb: "Campgrounds, glamping, cabins and lodges worth the drive.",
  },
  {
    icon: Compass,
    title: "RV & gear rentals",
    blurb: "From Sprinter vans to kayaks, ready when you arrive.",
  },
  {
    icon: Sparkles,
    title: "Local experiences",
    blurb: "Hand-picked tours, hikes and golden-hour drives.",
  },
  {
    icon: Backpack,
    title: "Smart packing list",
    blurb: "Trip-specific, downloadable, no second-guessing.",
  },
  {
    icon: Wallet,
    title: "Realistic budget",
    blurb: "Stays, fuel, food and fun — all the real numbers.",
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
  const { gearOffers, homeDestinations } = Route.useLoaderData();
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

      {/* RENTALS & GEAR — real Supabase offers, single section (no static placeholders) */}
      {gearOffers.length > 0 && (
        <section id="rentals-gear" className="bg-beige py-20">
          <div className="container-page">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">
                  Live inventory
                </p>
                <h2 className="mt-2 max-w-2xl font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Rentals and gear ready at the trailhead
                </h2>
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                Real listings pulled from the destinations below — pick one to see the full plan.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {gearOffers.map((offer) => (
                <Link
                  key={offer.id}
                  to="/destinations/$slug"
                  params={{ slug: offer.destinationSlug }}
                  className="group block overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={offer.image ?? ""}
                      alt={offer.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {offer.destinationName}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-foreground">{offer.title}</h3>
                    <p className="mt-1.5 font-serif text-lg font-semibold text-foreground">
                      {offer.priceDisplay ??
                        (offer.priceValue != null
                          ? `$${offer.priceValue}${offer.priceUnit ? ` / ${offer.priceUnit}` : ""}`
                          : "Price on request")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
            {stayTypes.map((s) => (
              <a
                key={s.name}
                href="#destinations"
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
              >
                <img
                  src={s.image}
                  alt={s.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
                <h3 className="absolute bottom-4 left-4 right-4 text-base font-bold text-off-white md:text-lg">
                  {s.name}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* STORIES — editorial trio */}
      <section id="stories" className="bg-beige py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">
                Field journal
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Stories from the trail
              </h2>
            </div>
            <a
              href="#"
              className="text-sm font-semibold text-foreground/80 hover:text-foreground hover:underline"
            >
              Read the journal <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {stories.map((s) => (
              <a key={s.title} href="#" className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-foreground/60">
                  {s.tag}
                </p>
                <h3 className="mt-2 text-xl font-bold leading-snug text-foreground group-hover:underline">
                  {s.title}
                </h3>
              </a>
            ))}
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
              Pick any destination — we put together the stays, rentals, things to do, packing list
              and budget for you.
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
            Outdoor trip planning, simplified
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">
            One destination. One plan. Everything you need to go.
          </h1>

          <div className="mt-8 max-w-2xl">
            <SearchBar size="lg" />
          </div>

          <div className="mt-5 flex items-center gap-4 text-sm">
            <a
              href="#rentals-gear"
              className="font-medium text-off-white/80 hover:text-off-white hover:underline"
            >
              RV Rentals
            </a>
            <span className="h-1 w-1 rounded-full bg-off-white/40" />
            <a
              href="#rentals-gear"
              className="font-medium text-off-white/80 hover:text-off-white hover:underline"
            >
              Gear
            </a>
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
