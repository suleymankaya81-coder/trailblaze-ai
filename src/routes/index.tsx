import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Backpack,
  Bike,
  Calendar,
  Compass,
  Leaf,
  MapPin,
  Mountain,
  Sparkles,
  Tent,
  Truck,
  Wallet,
  Waves,
} from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SearchBar } from "@/components/site/SearchBar";
import { Button } from "@/components/ui/button";
import { destinations } from "@/data/destinations";

export const Route = createFileRoute("/")({
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
    ],
  }),
  component: HomePage,
});

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const quickShop = [
  { name: "National Parks", icon: Mountain, image: img("photo-1506905925346-21bda4d32df4", 600) },
  { name: "Glamping", icon: Tent, image: img("photo-1517824806704-9040b037703b", 600) },
  { name: "RV Travel", icon: Truck, image: img("photo-1469854523086-cc02fe5d8800", 600) },
  { name: "Cabins", icon: Leaf, image: img("photo-1464822759023-fed622ff2c3b", 600) },
  { name: "Road Trips", icon: Compass, image: img("photo-1533873984035-25970ab07461", 600) },
  { name: "Water", icon: Waves, image: img("photo-1463693396721-8ca0cfa2b3b5", 600) },
  { name: "Biking", icon: Bike, image: img("photo-1485965120184-e220f721d03e", 600) },
  { name: "Gear Rentals", icon: Backpack, image: img("photo-1504280390367-361c6d9f38f4", 600) },
];

const stayTypes = [
  { name: "Campgrounds", image: img("photo-1504280390367-361c6d9f38f4") },
  { name: "Glamping", image: img("photo-1517824806704-9040b037703b") },
  { name: "RV Parks", image: img("photo-1533873984035-25970ab07461") },
  { name: "Tiny Houses", image: img("photo-1518780664697-55e3ad937233") },
  { name: "Cabins", image: img("photo-1464822759023-fed622ff2c3b") },
  { name: "Lodges", image: img("photo-1510798831971-661eb04b3739") },
];

const rentals = [
  { name: "RV Rentals", image: img("photo-1469854523086-cc02fe5d8800"), tag: "From $189/day" },
  { name: "Campervan Rentals", image: img("photo-1532274402911-5a369e4c4bb5"), tag: "From $149/day" },
  { name: "Bike Rentals", image: img("photo-1485965120184-e220f721d03e"), tag: "From $45/day" },
  { name: "Kayak Rentals", image: img("photo-1463693396721-8ca0cfa2b3b5"), tag: "From $55/day" },
];

const planIncludes = [
  { icon: Tent, title: "Curated stays", blurb: "Campgrounds, glamping, cabins and lodges worth the drive." },
  { icon: Compass, title: "RV & gear rentals", blurb: "From Sprinter vans to kayaks, ready when you arrive." },
  { icon: Sparkles, title: "Local experiences", blurb: "Hand-picked tours, hikes and golden-hour drives." },
  { icon: Backpack, title: "Smart packing list", blurb: "Trip-specific, downloadable, no second-guessing." },
  { icon: Wallet, title: "Realistic budget", blurb: "Stays, fuel, food and fun — all the real numbers." },
  { icon: MapPin, title: "On-the-ground tips", blurb: "Weather, crowds, wildlife and safety, in plain English." },
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
  return (
    <div className="bg-background">
      <Header />

      {/* HERO — REI-style: clean, single bold headline + green CTA */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
          <img
            src={img("photo-1506905925346-21bda4d32df4", 2000)}
            alt="Mountain lake at golden hour"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/25 to-transparent" />
          <div className="container-page relative z-10 flex h-full flex-col justify-center">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-off-white/90">
                Outdoor travel, planned for you
              </p>
              <h1 className="text-5xl font-bold leading-[1.02] tracking-tight text-off-white md:text-7xl">
                Find the trip.<br />Skip the planning.
              </h1>
              <p className="mt-5 max-w-lg text-base text-off-white/90 md:text-lg">
                One destination. One complete guide. Stays, rentals, activities, packing
                and budget — all in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="xl">
                  <a href="#destinations">
                    Explore destinations <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 rounded-full border border-off-white/40 px-6 py-3 text-sm font-semibold text-off-white hover:bg-off-white hover:text-forest"
                >
                  How it works
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Floating search */}
        <div className="container-page relative z-20 -mt-10">
          <div className="rounded-2xl border border-border bg-background p-5 shadow-lift md:p-6">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* QUICK SHOP — REI-style circular category row */}
      <section className="bg-background py-16">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Shop the outdoor life
            </h2>
            <a href="#destinations" className="hidden text-sm font-semibold text-forest hover:underline md:block">
              See all categories <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </a>
          </div>
          <div className="grid grid-cols-4 gap-x-4 gap-y-8 md:grid-cols-8">
            {quickShop.map((c) => (
              <a
                key={c.name}
                href="#destinations"
                className="group flex flex-col items-center text-center"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-full ring-1 ring-border md:h-24 md:w-24">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <span className="mt-3 text-xs font-semibold text-foreground/90 group-hover:text-forest md:text-sm">
                  {c.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO SPLIT — REI-style member/promo banner */}
      <section className="bg-beige py-16">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-forest p-10 text-off-white md:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage">For travelers</p>
            <h3 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
              A complete trip plan, free.
            </h3>
            <p className="mt-4 max-w-md text-off-white/85">
              Pick any destination — we put together the stays, rentals, things to do,
              packing list and budget for you.
            </p>
            <a
              href="#destinations"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-off-white px-6 py-3 text-sm font-semibold text-forest hover:bg-sage"
            >
              Start a free plan <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src={img("photo-1455156218388-5e61b526818b", 1400)}
              alt="Campsite under stars"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-10 text-off-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Featured trip</p>
              <h3 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">
                7 nights under the Milky Way.
              </h3>
              <a
                href="#destinations"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-off-white/50 px-5 py-2.5 text-sm font-semibold hover:bg-off-white hover:text-forest"
              >
                See the plan <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="bg-background py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-forest">Popular right now</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Where travelers are headed
              </h2>
            </div>
            <a href="#" className="text-sm font-semibold text-forest hover:underline">
              View all destinations <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </a>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d) => (
              <Link
                key={d.slug}
                to="/destinations/$slug"
                params={{ slug: d.slug }}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <img
                    src={d.heroImage}
                    alt={d.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-off-white">
                    <p className="text-xs uppercase tracking-wider text-off-white/80">{d.region}</p>
                    <h3 className="mt-1 text-2xl font-bold">{d.name}</h3>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-foreground/80">{d.tripDurationDays} · {d.bestSeason}</span>
                  <span className="font-semibold text-forest group-hover:underline">
                    Plan a trip <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STAY TYPES */}
      <section id="stay-types" className="bg-beige py-20">
        <div className="container-page">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-forest">Stays for every style</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
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

      {/* RENTALS */}
      <section id="rentals" className="bg-background py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-forest">Rent before you go</p>
              <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                The right gear, waiting at the trailhead
              </h2>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Skip the airline fees and the bulky bags. Pick up everything when you land.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {rentals.map((r) => (
              <a
                key={r.name}
                href="#"
                className="group block overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={r.image}
                    alt={r.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{r.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r.tag}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-forest" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — what your plan includes */}
      <section id="how" className="bg-forest py-20 text-off-white">
        <div className="container-page">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage">Everything in one place</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              What's in your trip plan
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {planIncludes.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-off-white/15 bg-off-white/5 p-6 backdrop-blur"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage text-forest">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm text-off-white/80">{p.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORIES — editorial trio (REI Uncommon Path style) */}
      <section id="stories" className="bg-background py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-forest">Field journal</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Stories from the trail
              </h2>
            </div>
            <a href="#" className="text-sm font-semibold text-forest hover:underline">
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
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-forest">{s.tag}</p>
                <h3 className="mt-2 text-xl font-bold leading-snug text-foreground group-hover:text-forest">
                  {s.title}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING TRIPS */}
      <section className="bg-beige py-20">
        <div className="container-page">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-forest">Trending trips</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Plans other travelers are loving this week
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {destinations.slice(0, 4).map((d) => (
              <Link
                key={d.slug}
                to="/destinations/$slug"
                params={{ slug: d.slug }}
                className="group block overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={d.heroImage}
                    alt={d.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    <Calendar className="mr-1 inline h-3 w-3" /> {d.tripDurationDays}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-foreground">{d.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden">
        <img
          src={img("photo-1510328329472-4cf06fc20a36", 2000)}
          alt="Alpine valley at sunset"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/65" />
        <div className="container-page relative z-10 flex flex-col items-center py-28 text-center">
          <h2 className="max-w-3xl text-4xl font-bold leading-[1.05] text-off-white md:text-6xl">
            Your next adventure is one search away.
          </h2>
          <p className="mt-5 max-w-xl text-off-white/85">
            One destination. One plan. Everything you need to go.
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
                Start Planning <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
