import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Backpack,
  Calendar,
  Compass,
  MapPin,
  Sparkles,
  Tent,
  Wallet,
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
          "Personalized outdoor travel guides for camping, glamping, RV trips, cabins and national parks. Where to stay, what to rent, what to do, what to pack.",
      },
      { property: "og:title", content: "Minialife — Plan Your Next Outdoor Escape" },
      {
        property: "og:description",
        content:
          "Tell us where you want to go. We'll show you where to stay, what to rent, what to do, and what to bring.",
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
  { name: "Gear Rentals", image: img("photo-1504280390367-361c6d9f38f4"), tag: "From $25/day" },
];

const planIncludes = [
  { icon: Tent, title: "Best Stays", blurb: "Curated campgrounds, glamping, cabins and lodges." },
  { icon: Compass, title: "RV & Gear Rentals", blurb: "From Sprinter vans to kayaks, ready on arrival." },
  { icon: Sparkles, title: "Experiences", blurb: "Hand-picked tours, hikes and golden-hour drives." },
  { icon: Backpack, title: "Packing Checklist", blurb: "AI-generated, downloadable, trip-specific." },
  { icon: Wallet, title: "Trip Budget", blurb: "Realistic numbers for stays, fuel, food and fun." },
  { icon: MapPin, title: "Local Tips", blurb: "Weather, crowds, wildlife and safety notes." },
];

function HomePage() {
  return (
    <div className="bg-background">
      <Header />

      {/* HERO */}
      <section className="relative min-h-screen">
        <img
          src={img("photo-1506905925346-21bda4d32df4", 2000)}
          alt="Mountain lake at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/20 to-background" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <div className="container-page flex flex-1 items-center pt-32 pb-24">
            <div className="w-full">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-background/70 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-foreground/80 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Outdoor travel, simplified
              </p>
              <h1 className="max-w-3xl font-display text-5xl leading-[1.05] text-off-white md:text-7xl">
                Plan Your Next
                <br /> Outdoor Escape
              </h1>
              <p className="mt-6 max-w-xl text-base text-off-white/85 md:text-lg">
                Discover where to stay, what to rent, what to do, and what to pack — all in one
                personalized outdoor travel guide.
              </p>
              <div className="mt-10">
                <SearchBar />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-background py-28">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">How it works</p>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
              From idea to itinerary in three steps.
            </h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choose a destination",
                blurb: "A park, a lake, or just a vibe like 'glamping weekend' — we take it from there.",
              },
              {
                step: "02",
                title: "Get personalized picks",
                blurb: "Stays, rentals, activities, packing list and budget — built for your trip.",
              },
              {
                step: "03",
                title: "Book and go",
                blurb: "Reserve directly with operators. Bring the checklist. Leave the planning behind.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-3xl border border-border bg-card p-8 shadow-soft"
              >
                <span className="font-display text-sm text-sage-deep">{s.step}</span>
                <h3 className="mt-4 font-display text-2xl text-foreground">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{s.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="bg-beige/40 py-28">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">Popular right now</p>
              <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
                Where travelers are headed.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              The most-planned outdoor destinations this season — pick one and we'll build the whole
              guide.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d) => (
              <Link
                key={d.slug}
                to="/destinations/$slug"
                params={{ slug: d.slug }}
                className="group relative block aspect-[4/5] overflow-hidden rounded-3xl shadow-soft"
              >
                <img
                  src={d.heroImage}
                  alt={d.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs text-off-white/75">{d.region}</p>
                  <h3 className="mt-1 font-display text-2xl text-off-white">{d.name}</h3>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-off-white/90">
                    Plan a trip <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOUR PLAN INCLUDES */}
      <section className="bg-background py-28">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">What's inside</p>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
              Everything for your trip, in one guide.
            </h2>
          </div>
          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {planIncludes.map((p) => (
              <div
                key={p.title}
                className="rounded-3xl border border-border bg-card p-7 shadow-soft"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage/40 text-forest">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STAY TYPES */}
      <section id="stay-types" className="bg-beige/40 py-28">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">Stays for every style</p>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
              From canvas tents to cliffside cabins.
            </h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {stayTypes.map((s) => (
              <div
                key={s.name}
                className="group relative aspect-[5/4] overflow-hidden rounded-3xl shadow-soft"
              >
                <img
                  src={s.image}
                  alt={s.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <h3 className="absolute bottom-6 left-6 font-display text-2xl text-off-white">
                  {s.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RENTALS */}
      <section id="rentals" className="bg-background py-28">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">Rent before you go</p>
              <h2 className="mt-3 max-w-xl font-display text-4xl text-foreground md:text-5xl">
                The right gear, waiting at the trailhead.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Skip the airline fees and bulky bags. Pick up everything when you land.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rentals.map((r) => (
              <div
                key={r.name}
                className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
              >
                <div className="relative aspect-[5/4] overflow-hidden">
                  <img
                    src={r.image}
                    alt={r.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="font-display text-xl text-foreground">{r.name}</h3>
                    <p className="text-xs text-muted-foreground">{r.tag}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING TRIPS */}
      <section className="bg-beige/40 py-28">
        <div className="container-page">
          <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">Trending trips</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl text-foreground md:text-5xl">
            Plans other travelers are loving this week.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {destinations.slice(0, 4).map((d) => (
              <Link
                key={d.slug}
                to="/destinations/$slug"
                params={{ slug: d.slug }}
                className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={d.heroImage}
                    alt={d.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground">{d.tripDurationDays}</p>
                  <h3 className="mt-1 font-display text-lg text-foreground">{d.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY FAVORITES */}
      <section className="bg-background py-28">
        <div className="container-page">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">Community favorites</p>
              <h2 className="mt-3 max-w-xl font-display text-4xl text-foreground md:text-5xl">
                Most-viewed plans this month.
              </h2>
            </div>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {destinations.slice(2, 5).map((d) => (
              <Link
                key={d.slug}
                to="/destinations/$slug"
                params={{ slug: d.slug }}
                className="group flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <img
                    src={d.gallery[0] ?? d.heroImage}
                    alt={d.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="mr-1 inline h-3 w-3" />
                    {d.bestSeason}
                  </p>
                  <h3 className="mt-1 font-display text-xl text-foreground">{d.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.tagline}</p>
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
        <div className="absolute inset-0 bg-ink/55" />
        <div className="container-page relative z-10 flex flex-col items-center py-32 text-center">
          <h2 className="max-w-3xl font-display text-5xl leading-[1.05] text-off-white md:text-7xl">
            Ready for your next adventure?
          </h2>
          <p className="mt-6 max-w-xl text-off-white/85">
            One destination. One plan. Everything you need to go.
          </p>
          <div className="mt-10 w-full">
            <div className="mx-auto flex max-w-xl justify-center">
              <Button asChild variant="hero" size="xl">
                <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  Start Planning <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
