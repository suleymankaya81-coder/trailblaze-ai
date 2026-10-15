import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
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
import { offerPhoto } from "@/lib/data/destinationCardPhotos";
import { servicePhoto, type ServicePhotoCategory } from "@/lib/data/servicePhotos";
import { PartnerPhotoCard } from "@/components/destination/PartnerPhotoCard";
import { tpLink } from "@/lib/affiliates/travelpayouts";
import rental1 from "@/assets/home-rental-1.jpg";
import rental2 from "@/assets/home-rental-2.jpg";
import rental3 from "@/assets/home-rental-3.jpg";
import rental4 from "@/assets/home-rental-4.jpg";
import rental5 from "@/assets/home-rental-5.jpg";
import rental6 from "@/assets/home-rental-6.jpg";
import rental7 from "@/assets/home-rental-7.jpg";
import rental8 from "@/assets/home-rental-8.jpg";
import rvImage from "@/assets/home-rv.jpg";
import campervanImage from "@/assets/home-campervan.jpg";
import bikeImage from "@/assets/home-bike.jpg";
import kayakImage from "@/assets/home-kayak.jpg";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80" },
    ],
    links: [{ rel: "canonical", href: "https://minialife.com/" }],
  }),
  component: HomePage,
});

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const homepageRentalImages = [rental1, rental2, rental3, rental4, rental5, rental6, rental7, rental8];

// Icon-forward, not photo-forward — deliberately: this site already has
// one image-mismatch incident behind it, and there's no real per-tag
// photography to source without risking another one.
const planBuilderCards = TRIP_TAG_OPTIONS.map((t, i) => ({
  ...t,
  icon: [Tent, Truck, Sparkles, Users, Mountain, Sun][i] ?? Tent,
}));

const stayTypes: { name: string; category: ServicePhotoCategory }[] = [
  { name: "Campgrounds", category: "tent" },
  { name: "Glamping", category: "glamping" },
  { name: "RV Parks", category: "rvpark" },
  { name: "Tiny Houses", category: "tinyhouse" },
  { name: "Cabins", category: "cabin" },
  { name: "Lodges", category: "hotel" },
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
  const usedRentalPhotos = new Set([
    servicePhoto("bike", "homepage-partners")?.url,
    servicePhoto("car", "homepage-partners")?.url,
  ]);

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
                  Rental ideas
                </p>
                <h2 className="mt-2 max-w-2xl font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Rentals and gear worth considering
                </h2>
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                RVs, campervans, bikes, cars and outdoor gear. Photos are illustrative and prices are
                estimates — check the partner site for current availability and pricing.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {([{ brand: "bikesbooking" as const, name: "BikesBooking", category: "bike" as const, title: "Bike & e-bike rentals" }, { brand: "economybookings" as const, name: "EconomyBookings", category: "car" as const, title: "Compare road-trip rental cars" }]).map((item) => {
                const photo = servicePhoto(item.category, "homepage-partners");
                return photo ? <PartnerPhotoCard key={item.brand} brand={item.name} title={item.title} href={tpLink(item.brand, "homepage")} photo={photo} /> : null;
              })}
              {gearOffers.map((offer, index) => {
                // Offers without listing photography use the same credited,
                // explicitly illustrative photos as the destination cards.
                const rentalIndex = /car rental/i.test(offer.title) ? 2 : /van/i.test(offer.title) ? 1 : 0;
                const gearIndex = /bottle|water/i.test(offer.title) ? 1
                  : /wool|layer/i.test(offer.title) ? 2
                  : /lamp|light/i.test(offer.title) ? 3
                  : /first.?aid/i.test(offer.title) ? 4
                  : /jacket/i.test(offer.title) ? 5 : 0;
                let photo = offerPhoto(
                  offer.destinationSlug,
                  offer.category === "rv_rental" ? "rental" : "gear",
                  offer.category === "rv_rental" ? rentalIndex : gearIndex,
                  `${offer.title} ${offer.subcategory ?? ""}`,
                );
                for (let offset = 1; photo && usedRentalPhotos.has(photo.url) && offset < 20; offset++) {
                  photo = offerPhoto(offer.destinationSlug, offer.category === "rv_rental" ? "rental" : "gear", index + offset, `${offer.title} ${offer.subcategory ?? ""}`);
                }
                if (photo) usedRentalPhotos.add(photo.url);
                const generatedImage = /bike|bicycle/i.test(offer.title) ? bikeImage
                  : /kayak/i.test(offer.title) ? kayakImage
                  : offer.subcategory === "RV" ? rvImage
                  : offer.subcategory === "Campervan" ? campervanImage
                  : /car rental/i.test(offer.title) ? homepageRentalImages[index] : undefined;
                const image = photo?.url || generatedImage;
                if (!image) return null;
                return (
                <figure key={offer.id}>
                <Link
                  to="/destinations/$slug"
                  params={{ slug: offer.destinationSlug }}
                  className="group block overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={image}
                      alt={photo ? `${photo.subject} — illustrative photo, not actual partner inventory` : `${offer.title} — AI-generated illustration`}
                      loading="lazy"
                      onError={(event) => {
                        if (!generatedImage && photo && event.currentTarget.getAttribute("src") !== photo.url) {
                          event.currentTarget.src = photo.url;
                          event.currentTarget.alt = `${photo.subject} — illustrative photo`;
                        }
                      }}
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
                {!photo && generatedImage ? (
                  <figcaption className="mt-2 text-xs text-muted-foreground">
                    AI-generated illustration · Not an actual rental listing
                  </figcaption>
                ) : photo && (
                  <figcaption className="mt-2 text-xs text-muted-foreground">
                    Illustrative photo · <a href={photo.source} target="_blank" rel="noopener noreferrer" className="underline">{photo.credit} · {photo.license}</a>
                  </figcaption>
                )}
                </figure>
                );
              })}
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
            {stayTypes.map((s) => {
              const photo = servicePhoto(s.category, "homepage-stays");
              if (!photo) return null;
              return (
              <figure key={s.name}>
              <a
                href="#destinations"
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
              </a>
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
              Pick any destination — we put together the stays, rentals, things to do, gear
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
