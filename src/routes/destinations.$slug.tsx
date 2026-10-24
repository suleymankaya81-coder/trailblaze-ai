import { TripSnapshot, TripQuickNav } from "@/components/destination/TripSnapshot";
import { offerCtaLabel } from "@/lib/affiliates/ctaLabel";
import { SafeImage } from "@/components/shared/SafeImage";
import { PhotoCredit } from "@/components/shared/PhotoCredit";
import { PlaceCard, SwipeRow, Thumb } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import planImage from "@/assets/thumbs/plan.jpg";
import carImage from "@/assets/thumbs/car.jpg";
import stayImage from "@/assets/thumbs/stay.jpg";
import gearImage from "@/assets/thumbs/gear.jpg";
import roadImage from "@/assets/thumbs/road.jpg";
import mapImage from "@/assets/thumbs/map.jpg";
import { TripEssentials } from "@/components/destination/TripEssentials";
import { estimatedFrom } from "@/lib/data/servicePhotos";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { VrboSearchWidget } from "@/components/destination/VrboSearchWidget";
import { HarvestHostsCard } from "@/components/destination/HarvestHostsCard";
import { TravelpayoutsCards, TourTicketCards } from "@/components/destination/TravelpayoutsCards";
import { GetYourGuideWidget } from "@/components/destination/PartnerWidget";
import { ViatorPlaceBlock } from "@/components/destination/ViatorPlaceBlock";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Coffee,
  CreditCard,
  DollarSign,
  Fuel,
  Heart,
  Hotel,
  Luggage,
  Map,
  MapPin,
  Mountain,
  Navigation,
  Ruler,
  Shield,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Star,
  Sun,
  Tent,
  Trees,
  Truck,
  Users,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { STAY_CHOICES } from "@/lib/data/stayChoices";
import { BookingStepsStrip } from "@/components/guides/BookingStepsStrip";
import { JumpBar, TripRadar, formatDrive } from "@/components/destination/TripRadar";
import routes from "@/data/routes.json";
import { TravelFlow, LocalIntel } from "@/components/destination/TravelFlow";
import { DestinationAnswers } from "@/components/destination/DestinationAnswers";

const RoadTripMap = lazy(() => import("@/components/destination/RoadTripMap"));
const ROUTES = routes as unknown as Record<string, [number, number][]>;

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDestinationPageData,
  type DestinationView,
  type OfferView,
} from "@/lib/data/destinations.functions";
import { enrichDestination, type EnrichResult } from "@/lib/ai/enrich.functions";
import { trackAndRedirect } from "@/lib/affiliates/track.functions";
import { getOrCreateSessionId } from "@/lib/affiliates/session";
import { outboundLinkTitle, partnerLabel } from "@/lib/affiliates/compliance";
import { buildDestinationJsonLd } from "@/lib/seo/destinationJsonLd";
import { flyDriveSlug } from "@/lib/seo/flyDrive";
import { isNoReservationEligible, isRvEligible, loopsForDestination } from "@/lib/seo/guides";
import { CORRIDORS } from "@/lib/seo/corridors";
import { saveTripPlan } from "@/lib/plans/savePlan.functions";
import { getCapturedEmail, setCapturedEmail } from "@/lib/plans/session";
import { getPublicLandingPagesForDestination } from "@/lib/data/landingPages.functions";
import { LANDING_TYPE_LABEL } from "@/lib/data/landingTypes";
import { offerPhoto, type Photo } from "@/lib/data/destinationCardPhotos";
import { ROAD_PREPARATION_PARTNERS, preparationLink } from "@/lib/affiliates/travelpayouts";

// Search snippet: tagline plus the matching guide topics, kept within ~160 chars.
function seoDescription(name: string, tagline: string | null, bestSeason: string | null): string {
  const base = (tagline ?? "").trim().replace(/[.!]?$/, ".");
  const extras = [
    bestSeason ? ` Best time: ${bestSeason}.` : "",
    ` Things to do, itinerary & glamping in ${name}.`,
    " Stays, RV rentals & road trip map.",
  ];
  let out = base;
  for (const e of extras) if ((out + e).length <= 160) out += e;
  return out.trim();
}

export const Route = createFileRoute("/destinations/$slug")({
  loader: async ({ params }): Promise<{ dest: DestinationView }> => {
    const dest = await getDestinationPageData({ data: { slug: params.slug } });
    if (!dest) throw notFound();
    return { dest };
  },
  head: ({ loaderData }) => {
    const d = loaderData?.dest;
    if (!d) return { meta: [{ title: "Destination — Minialife" }] };
    const title = `${d.name} Travel Guide — Minialife`;
    const description = seoDescription(d.name, d.tagline, d.bestSeason);
    const pageUrl = `https://minialife.com/destinations/${d.slug}`;
    const jsonLd = buildDestinationJsonLd(d, pageUrl);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: d.heroImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: d.heroImage },
        // Thin pages (no tagline or hero yet) stay out of search indexes.
        ...(d.tagline && d.heroImage ? [] : [{ name: "robots", content: "noindex, follow" }]),
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }],
    };
  },
  component: DestinationPage,
  notFoundComponent: DestinationNotFound,
});

function DestinationNotFound() {
  const { slug } = Route.useParams();
  return (
    <div className="bg-beige/30">
      <Header />
      <main className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">
          Destination not found
        </p>
        <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
          We couldn't find "{slug}"
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          That destination isn't in our guide yet — it may have been renamed, or the link might be
          off. Try searching again or explore our other destinations.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-off-white hover:bg-ink"
          >
            Explore destinations
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Report a broken link
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* =========================================================
   PAGE
   Flow: Stay -> Rent -> Explore -> Prepare -> Go
========================================================= */
function DestinationPage() {
  const { dest } = Route.useLoaderData() as { dest: DestinationView };
  const enrich = useServerFn(enrichDestination);

  const { data: ai, isLoading: aiLoading } = useQuery({
    queryKey: ["enrich", dest.slug],
    queryFn: () => enrich({ data: { slug: dest.slug } }),
    staleTime: Infinity,
    retry: false,
  });

  return (
    <div className="bg-beige/40">
      <Header />

      <Hero dest={dest} />
      <TripSnapshot trip={dest} />
      <TripQuickNav />

      <main className="container-page space-y-14 py-10 md:space-y-16">
        <div id="trip-plan"><TripRadar dest={dest} /></div>
        <div id="trip-booking"><BookingStepsStrip slug={dest.slug} name={dest.name} airportCode={dest.airportCode} /></div>
        <DestinationAnswers slug={dest.slug} />

        {/* Booking order: flight (strip above) → vehicle → stay → tours */}
        <RentBeforeYouGo dest={dest} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <TopStays dest={dest} />
          <TripBudget ai={ai} loading={aiLoading} />
        </div>

        {dest.travelPlan ? <TravelFlow name={dest.name} plan={dest.travelPlan} /> : <TripFlow dest={dest} />}

        <RoadTrip dest={dest} ai={ai} />

        {/* Tours & services — one section */}
        <section id="trip-tours" className="scroll-mt-24">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
            <ThingsToDo dest={dest} />
            <TravelServices dest={dest} />
          </div>
        </section>

        <TripEssentials context={{ slug: dest.slug, name: dest.name, places: [dest] }} />

        <PlanDeeper dest={dest} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <SimilarDestinations dest={dest} />
          <FinalCta dest={dest} />
        </div>
      </main>

      <Footer />
    </div>
  );
}


/* =========================================================
   1 — HERO
========================================================= */
function Hero({ dest }: { dest: DestinationView }) {
  const [region, sub] = dest.region.split(",").map((s) => s.trim());

  const stats: { label: string; value: string }[] = [];
  if (dest.bestSeason) stats.push({ label: "Best time", value: dest.bestSeason });
  if (dest.tripDurationDays) stats.push({ label: "Duration", value: dest.tripDurationDays });
  if (dest.avgDailyBudget != null)
    stats.push({ label: "Avg. budget", value: `$${dest.avgDailyBudget} / day` });
  if (dest.scenicScore != null)
    stats.push({ label: "Scenic score", value: `${dest.scenicScore} / 10` });
  if (dest.campingScore != null)
    stats.push({ label: "Camping score", value: `${dest.campingScore} / 10` });

  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={dest.heroImage}
        alt={dest.name}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />

      <div className="container-page relative grid gap-10 py-14 md:py-20 ">
        <div className="text-off-white">
          <nav className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-off-white/70">
            <Link to="/" className="hover:text-off-white">
              Home
            </Link>
            <span className="opacity-50">›</span>
            <span>{region}</span>
            {sub && (
              <>
                <span className="opacity-50">›</span>
                <span className="text-off-white">{sub}</span>
              </>
            )}
          </nav>

          <h1 className="mt-5 max-w-xl font-display text-4xl leading-[1.05] md:text-6xl">
            {dest.name}
          </h1>
          <p className="mt-5 max-w-lg text-base text-off-white/85">{dest.tagline}</p>

          {stats.length > 0 && (
            <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-5">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-off-white/60">
                    {s.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-off-white">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#stays"
              className="inline-flex items-center justify-center min-h-12 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              See places to stay
            </a>
            <a
              href="#road-trip"
              className="inline-flex items-center justify-center min-h-12 rounded-md border border-off-white/50 px-6 py-3 text-sm font-semibold text-off-white transition hover:bg-off-white/10"
            >
              Explore the trip
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

// Card imagery comes from remote sources that can 404; fall back to a neutral
// surface instead of showing a broken-image glyph inside a premium card.
function CardImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // An image streamed during SSR can already have errored before React
  // attaches onError, so re-check the decoded state once on mount.
  useEffect(() => {
    const el = ref.current;
    if (el?.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) {
    return <div className={`${className ?? ""} bg-beige`} aria-hidden />;
  }
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

/* =========================================================
   SHARED — offer helpers
========================================================= */
function PriceTag({
  offer,
  fallbackUnit,
  className = "font-serif text-lg font-semibold text-foreground",
}: {
  offer: OfferView;
  fallbackUnit: string;
  className?: string;
}) {
  if (offer.priceValue != null) {
    const unit = offer.priceUnit ?? fallbackUnit;
    return (
      <span className={className}>
        ${offer.priceValue}
        <span className="whitespace-nowrap text-xs font-normal text-muted-foreground">
          {" "}
          / {unit}
        </span>
      </span>
    );
  }
  if (offer.priceDisplay) return <span className={className}>{offer.priceDisplay}</span>;
  return <span className="text-xs font-normal text-muted-foreground">{estimatedFrom(`${offer.title ?? ""} ${offer.subcategory ?? ""} ${offer.partner ?? ""}`)} · estimate</span>;
}

function useTrackedRedirect(offer: OfferView, destinationSlug: string) {
  const track = useServerFn(trackAndRedirect);
  const [pending, setPending] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pending || !offer.externalUrl) return;
    const externalUrl = offer.externalUrl;
    setPending(true);

    const newTab = window.open("", "_blank");

    try {
      const { redirectUrl } = await track({
        data: {
          offerId: offer.id,
          destinationSlug,
          sessionId: getOrCreateSessionId(),
          referrerPage: window.location.pathname,
        },
      });
      if (newTab) newTab.location.href = redirectUrl;
    } catch (err) {
      console.error("[useTrackedRedirect] trackAndRedirect failed", err);
      if (newTab) newTab.location.href = externalUrl;
    } finally {
      setPending(false);
    }
  };

  return { handleClick, pending };
}

// The single, consistent commercial CTA used by every offer card on the page.
function OfferCta({
  offer,
  label,
  destinationSlug,
  size = "md",
}: {
  offer: OfferView;
  label: string;
  destinationSlug: string;
  size?: "sm" | "md";
}) {
  const { handleClick, pending } = useTrackedRedirect(offer, destinationSlug);
  const pad = size === "sm" ? "px-4 text-xs" : "px-4 text-sm";

  if (!offer.externalUrl) {
    return (
      <span
        title="Not bookable yet"
        className={`rounded-full border border-border bg-muted ${pad} font-semibold text-muted-foreground`}
      >
        Coming soon
      </span>
    );
  }

  return (
    <span className="flex w-full flex-col items-stretch gap-1.5">
      <a
        href={offer.externalUrl}
        target="_blank"
        rel={offer.network === "awin" ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
        title={outboundLinkTitle(offer.partner, offer.externalUrl, offer.network === "awin")}
        onClick={handleClick}
        aria-disabled={pending}
        className={`inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-md bg-primary ${pad} text-center font-semibold text-primary-foreground transition hover:bg-primary/90 ${
          pending ? "pointer-events-none opacity-70" : ""
        }`}
      >
        {label}
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
      <span className="text-center text-[10px] leading-tight text-muted-foreground">
        {`Partner link · ${partnerLabel(offer.partner) ?? "External partner"}`}
      </span>
    </span>
  );
}

function SectionHeader({ title, action, id, step }: { title: string; action?: ReactNode; id?: string; step?: number }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3" id={id}>
      <h2 className="font-display text-2xl text-foreground md:text-[28px]">{step && <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary align-middle font-sans text-sm font-semibold text-primary-foreground">{step}</span>}{title}</h2>
      {action}
    </div>
  );
}

function TextLink({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex cursor-default items-center gap-1 text-xs font-semibold text-foreground/70">
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </span>
  );
}

/* =========================================================
   2 — WHERE YOU'LL WANT TO SLEEP
========================================================= */
const BEST_FOR_BY_SUBCATEGORY: Record<string, string> = {
  campground: "Tent camping",
  glamping: "Comfort in nature",
  cabin: "Privacy & cooler nights",
  "rv park": "RV travelers",
  rv_park: "RV travelers",
  hotel: "Easy access",
  lodge: "First-time visitors",
};

function bestForLine(offer: OfferView): string {
  const key = offer.subcategory?.trim().toLowerCase();
  return (key && BEST_FOR_BY_SUBCATEGORY[key]) || "Most travelers";
}


function StayChooser({ name }: { name: string }) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-3" aria-label={`Where to stay near ${name}`}>
      {STAY_CHOICES.map((c) => (
        <div key={c.label} className="rounded-lg border border-border bg-card p-3">
          <Thumb src={c.label.toLowerCase().includes("rv") ? carImage : c.label.toLowerCase().includes("cabin") ? stayImage : roadImage} size={48} className="mb-3" />
          <p className="text-sm font-semibold text-foreground">{c.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{c.why}</p>
          <p className="mt-1.5 text-xs font-semibold text-foreground">{c.price} <span className="font-normal text-muted-foreground">· typical</span></p>
        </div>
      ))}
    </div>
  );
}

function TopStays({ dest }: { dest: DestinationView }) {
  const cats = useMemo(
    () =>
      Array.from(
        new Set(dest.stays.map((s) => s.subcategory).filter((c): c is string => Boolean(c))),
      ),
    [dest],
  );
  const [tab, setTab] = useState("All");
  const filtered = tab === "All" ? dest.stays : dest.stays.filter((s) => s.subcategory === tab);
  const pick = filtered[0];
  const rest = filtered.slice(1, 4);


  return (
    <section id="stays" className="scroll-mt-24">
      <SectionHeader
        step={3}
        title="Where you'll want to sleep"
        
      />
      <p className="-mt-3 mb-4 text-[11px] text-muted-foreground">
        Checks availability with the partner directly — not a confirmed booking on our end.
      </p>

      <StayChooser name={dest.name} />

      <div className="flex flex-wrap items-center gap-2">
        {["All", ...cats].map((c) => (
          <Button
            variant="outline"
            key={c}
            onClick={() => setTab(c)}
            className={
              "rounded-full px-4 py-1.5 text-xs font-medium transition " +
              (tab === c
                ? "bg-ink text-off-white"
                : "border border-border bg-card text-foreground/70 hover:bg-muted")
            }
          >
            {c}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No stays listed for this filter yet." />
      ) : (
        <div className="travel-card-row mt-5 sm:grid-cols-2 xl:grid-cols-4">
           {pick && <StayCard offer={pick} destinationSlug={dest.slug} featured photo={offerPhoto(dest.slug, "stay", 0, `${pick.title} ${pick.subcategory ?? ""} ${pick.partner ?? ""}`)} />}
           {rest.map((s, index) => (
             <StayCard key={s.id} offer={s} destinationSlug={dest.slug} photo={offerPhoto(dest.slug, "stay", index + 1, `${s.title} ${s.subcategory ?? ""} ${s.partner ?? ""}`)} />
          ))}
        </div>
      )}

      <VrboSearchWidget destinationName={dest.name} />
      <HarvestHostsCard destinationName={dest.name} />

      <p className="mt-5 text-[11px] text-muted-foreground">
        Minialife may earn a commission when you book through links on this page, at no extra cost
        to you.{" "}
        <Link to="/affiliate-disclosure" className="underline underline-offset-2">
          Learn more
        </Link>
      </p>
    </section>
  );
}

function StayCard({
  offer,
  destinationSlug,
  featured = false,
  photo,
}: {
  offer: OfferView;
  destinationSlug: string;
  featured?: boolean;
  photo?: Photo;
}) {
  return (
    <article
      className={
        "group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:shadow-lift " +
        (featured
          ? "border-foreground/15 shadow-soft"
          : "border-border")
      }
    >
      <div className="relative aspect-[4/3] bg-beige/50">
        <CardImg src={photo?.url ?? ""} alt={photo ? `${photo.subject}, illustrative accommodation photo` : ""} className="h-full w-full object-cover" />
        {photo && <PhotoCredit photo={photo} />}
        {parkTag(offer) && (
          <span
            className={
              "absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-off-white " +
              (parkTag(offer) === "inside" ? "bg-copper" : "bg-forest")
            }
          >
            {parkTag(offer) === "inside" ? "Inside the park · books up fast" : "Outside the park · easier to book"}
          </span>
        )}
        {featured && (
          <span className="absolute left-0 top-4 rounded-r-full bg-ink/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-off-white">
            Minialife's pick
          </span>
        )}

      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg leading-snug text-foreground">{offer.title}</h3>
        {offer.subcategory && (
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            {offer.subcategory}
          </p>
        )}
        <p className="mt-3 text-xs font-medium text-foreground/80">
          Best for: <span className="font-normal">{bestForLine(offer)}</span>
        </p>
        {(offer.whyRecommended || offer.description) && (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {offer.whyRecommended ?? offer.description}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3">
          <PriceTag offer={offer} fallbackUnit="night" />
          <OfferCta offer={offer} label={offerCtaLabel(offer.category)} destinationSlug={destinationSlug} />
        </div>
      </div>
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
      {message}
    </div>
  );
}

/* =========================================================
   3 — TRIP BUDGET
========================================================= */
function TripBudget({ ai, loading }: { ai?: EnrichResult; loading: boolean }) {
  const [showNote, setShowNote] = useState(false);

  const items = ai
    ? [
        {
          icon: <Hotel className="h-4 w-4" />,
          label: "Accommodation",
          value: ai.budget.accommodation,
        },
        { icon: <Truck className="h-4 w-4" />, label: "Rental", value: ai.budget.rental },
        { icon: <UtensilsCrossed className="h-4 w-4" />, label: "Food", value: ai.budget.food },
        { icon: <Fuel className="h-4 w-4" />, label: "Fuel", value: ai.budget.fuel },
        {
          icon: <Mountain className="h-4 w-4" />,
          label: "Activities",
          value: ai.budget.activities,
        },
        {
          icon: <ShoppingBasket className="h-4 w-4" />,
          label: "Gear & essentials",
          value: ai.budget.equipment,
        },
      ]
    : [];
  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <>
    {ai && (
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-soft lg:hidden">
        <span className="text-xs text-muted-foreground">Est. trip budget · 4 days, 2 people</span>
        <span className="font-serif text-lg font-semibold text-foreground">${total.toLocaleString()}</span>
      </div>
    )}
    <aside className="hidden rounded-lg border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24 lg:block">
      <h2 className="font-display text-lg text-foreground">Your trip budget</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Estimated for 4 days · 2 travelers</p>

      {loading ? (
        <Skeleton className="mt-5 h-9 w-32" />
      ) : !ai ? (
        <p className="mt-5 text-xs text-muted-foreground">
          Budget estimate isn't available for this destination right now.
        </p>
      ) : (
        <>
          <p className="mt-5 font-serif text-3xl font-semibold text-foreground">
            ${total.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Estimated total</p>

          <ul className="mt-5 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-foreground/80">
                  <Thumb src={i.label === "Accommodation" ? stayImage : i.label === "Rental" ? carImage : i.label === "Gear & essentials" ? gearImage : roadImage} size={32} />
                  <span className="text-xs">{i.label}</span>
                </span>
                <span className="text-xs font-semibold text-foreground">
                  ${i.value.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setShowNote((v) => !v)}
            className="mt-6 w-full rounded-full border border-border py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            See ways to save
          </button>
          {showNote && (
            <p className="mt-3 rounded-xl bg-beige/70 p-3 text-[11px] leading-relaxed text-foreground/80">
              {ai.budget.note}
            </p>
          )}
        </>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Prices are averages and may vary based on season and preferences.
      </p>
    </aside>
    </>
  );
}

/* =========================================================
   4 — RENT BEFORE YOU GO
========================================================= */
function RentBeforeYouGo({ dest }: { dest: DestinationView }) {
  const rentals = dest.rentals.filter((r) => r.partner === "motorhome_republic").slice(0, 5);

  return (
    <section id="rentals" className="scroll-mt-24">
      <SectionHeader
        step={2}
        title={dest.airportCode ? `RVs, campervans & cars near ${dest.airportCode}` : "RVs, campervans & cars for this trip"}
        
      />
      <p className="-mt-3 mb-4 text-[11px] text-muted-foreground">
        Checks availability with the partner directly — not a confirmed booking on our end.
      </p>
      {rentals.length > 0 && (
        <div className="travel-card-row sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
           {rentals.map((r, index) => (
             <RentalTile key={r.id} offer={r} destinationSlug={dest.slug} photo={offerPhoto(dest.slug, "rental", index, `${r.title} ${r.subcategory ?? ""} ${r.partner ?? ""}`)} />
          ))}
        </div>
      )}
      <TravelpayoutsCards slug={dest.slug} name={dest.name} airportCode={dest.airportCode} />
    </section>
  );
}

function RentalTile({ offer, destinationSlug, photo }: { offer: OfferView; destinationSlug: string; photo?: Photo }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-[4/3] bg-beige/30">
        <CardImg src={photo?.url ?? ""} alt={photo ? `${photo.subject}, illustrative rental photo` : ""} className="h-full w-full object-cover" />
        {photo && <PhotoCredit photo={photo} />}
      </div>
      <div className="flex-1 border-b border-border p-4">
          <p className="font-display text-lg leading-snug text-foreground">{offer.title}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {offer.priceValue != null
              ? `From $${offer.priceValue} / ${offer.priceUnit ?? "day"}`
              : (offer.priceDisplay ?? `${estimatedFrom(`${offer.title} ${offer.subcategory ?? ""} ${offer.partner ?? ""}`)} · estimate`)}
          </p>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {offer.subcategory ?? "Rental"}
        </span>
        <OfferCta
          offer={offer}
          label={offerCtaLabel(offer.category)}
          size="sm"
          destinationSlug={destinationSlug}
        />
      </div>
    </article>
  );
}

/* =========================================================
   5 — THINGS TO DO
========================================================= */
function ThingsToDo({ dest }: { dest: DestinationView }) {
  return (
    <section className="scroll-mt-24">
      <SectionHeader step={4} title="The moments you came for" />
      <ViatorPlaceBlock slug={dest.slug} name={dest.name} className="mt-6" anchored={false} />
      <TourTicketCards slug={dest.slug} name={dest.name} />
      <GetYourGuideWidget query={dest.name} />
    </section>
  );
}

/* =========================================================
   6 — TRAVEL SERVICES
========================================================= */
const SERVICE_META: Record<string, { icon: ReactNode; sub: string }> = {
  car_rental: { icon: <Navigation className="h-4 w-4" />, sub: "Compare prices from top brands" },
  insurance: { icon: <ShieldCheck className="h-4 w-4" />, sub: "Protect your trip and gear" },
  esim: { icon: <Wifi className="h-4 w-4" />, sub: "Stay connected anywhere" },
  park_pass: { icon: <Trees className="h-4 w-4" />, sub: "Official park passes & info" },
  travel_card: { icon: <CreditCard className="h-4 w-4" />, sub: "Spend without foreign fees" },
  offline_maps: {
    icon: <Luggage className="h-4 w-4" />,
    sub: "Drop bags in the gateway city for the day",
  },
};

function TravelServices({ dest }: { dest: DestinationView }) {
  const services = dest.globalServices.filter((service) => !(service.category in ROAD_PREPARATION_PARTNERS));
  const preparationDetails = {
    insurance: { title: "Travel insurance", brand: "EKTA", sub: "Medical cover for international visitors" },
    esim: { title: "US eSIM data", brand: "Airalo", sub: "Get online on landing, no SIM swap" },
    offline_maps: { title: "Luggage storage", brand: "Radical Storage", sub: "Drop bags in the gateway city for the day" },
    car_rental: { title: "Car Rental", brand: "Airport Rentals", sub: "Compare standard cars and SUVs at the airport" },
  };

  return (
    <aside className="rounded-lg border border-border bg-card p-6 shadow-soft">
      <h2 className="font-display text-lg text-foreground">Before you hit the road</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        The few things worth sorting out in advance.
      </p>

      <ul className="mt-4 divide-y divide-border">
          {Object.entries(ROAD_PREPARATION_PARTNERS).map(([category, brand]) => {
            const detail = preparationDetails[category as keyof typeof preparationDetails];
            const href = preparationLink(brand, dest.slug);
            return (
              <li key={category}>
                <a href={href} target="_blank" rel="sponsored nofollow noopener noreferrer"
                  title={`Opens ${detail.brand} in a new tab — partner link`}
                  className="flex items-start gap-3 py-3.5 transition hover:opacity-80"
                  onClick={(event) => {
                    event.preventDefault();
                    window.open(href, "_blank", "noopener,noreferrer");
                  }}>
                  <Thumb src={category === "car_rental" ? carImage : category === "insurance" ? planImage : category === "esim" ? mapImage : gearImage} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-foreground">{detail.title}</span>
                    <span className="block text-[11px] text-muted-foreground">{detail.sub}</span>
                    <span className="mt-1 block text-[10px] text-muted-foreground">Partner link · {detail.brand}</span>
                  </span>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-foreground/30" />
                </a>
              </li>
            );
          })}
          {services.map((s) => (
            <li key={s.id}>
              <ServiceRow service={s} destinationSlug={dest.slug} />
            </li>
          ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted-foreground">Partner links via Travelpayouts and Webjet Group. Minialife may earn a commission at no extra cost to you.</p>
    </aside>
  );
}

function ServiceRow({ service, destinationSlug }: { service: OfferView; destinationSlug: string }) {
  const meta = SERVICE_META[service.category] ?? {
    icon: <Shield className="h-4 w-4" />,
    sub: "",
  };
  const { handleClick, pending } = useTrackedRedirect(service, destinationSlug);

  const inner = (
    <>
      <Thumb src={service.category === "car_rental" ? carImage : planImage} size={40} />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-foreground">{service.title}</span>
        <span className="block text-[11px] text-muted-foreground">
          {service.priceDisplay ?? meta.sub}
        </span>
      </span>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-foreground/30" />
    </>
  );

  const rowClass = "flex items-start gap-3 py-3.5 transition hover:opacity-80";

  if (!service.externalUrl) {
    return (
      <div className={`${rowClass} opacity-60`} title="Coming soon">
        {inner}
      </div>
    );
  }

  return (
    <a
      href={service.externalUrl}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      title={outboundLinkTitle(service.partner, service.externalUrl)}
      onClick={service.commissionable ? handleClick : undefined}
      aria-disabled={pending}
      className={`${rowClass} ${pending ? "pointer-events-none opacity-70" : ""}`}
    >
      {inner}
    </a>
  );
}

/* =========================================================
   7 — ROAD TRIP
   Free stack: OpenFreeMap tiles + routes precomputed once with OSRM
   (src/data/routes.json). Visitors never trigger a paid map API.
========================================================= */
function RoadTrip({ dest, ai }: { dest: DestinationView; ai?: EnrichResult }) {
  const hasGeo =
    dest.lat != null && dest.lng != null && dest.airportLat != null && dest.airportLng != null;
  const from: [number, number] | null = dest.airportLng != null && dest.airportLat != null ? [dest.airportLng, dest.airportLat] : null;
  const to: [number, number] | null = dest.lng != null && dest.lat != null ? [dest.lng, dest.lat] : null;
  const route = ROUTES[dest.slug] ?? null;
  const directions = hasGeo
    ? `https://www.google.com/maps/dir/?api=1&origin=${dest.airportLat},${dest.airportLng}&destination=${dest.lat},${dest.lng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest.name)}`;
  const nearbyStays = dest.stays.slice(0, 3);

  return (
    <section id="road-trip" className="scroll-mt-24">
      <SectionHeader title="Plan your road trip" />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 rounded-lg border border-border bg-card p-4 shadow-soft sm:p-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-border bg-beige/60">
          {from && to ? (
            <ClientOnly fallback={<Skeleton className="h-[300px] w-full" />}>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <RoadTripMap route={route} from={from} to={to} stops={dest.travelPlan?.markers} />
              </Suspense>
            </ClientOnly>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
              <Thumb src={mapImage} size={64} />
              <p className="text-sm font-semibold text-foreground">Route map coming soon</p>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          {dest.airportCode && (
            <div className="rounded-xl bg-beige/50 p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                From {dest.airportName}
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold text-foreground">
                {dest.driveMinutes != null ? formatDrive(dest.driveMinutes) : "—"}
              </p>
              {dest.driveMiles != null && (
                <p className="text-xs text-muted-foreground">
                  about {Math.round(dest.driveMiles)} miles by car · times vary with traffic and
                  road closures
                </p>
              )}
            </div>
          )}
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-off-white transition hover:bg-ink"
          >
            <Navigation className="h-4 w-4" /> Get directions
          </a>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Airport-to-destination drive; sightseeing stops are separate markers.
          </p>
          {nearbyStays.length > 0 && (
            <>
              <p className="mt-5 text-xs font-semibold text-foreground">Stays near the end of your drive</p>
              <ul className="mt-2 space-y-2">
                {nearbyStays.map((s) => (
                  <li key={s.id}>
                    <a
                      href="#stays"
                      className="flex items-center gap-3 rounded-xl border border-border bg-beige/40 px-3 py-2.5 text-xs text-foreground/80 hover:bg-muted"
                    >
                      <Thumb src={stayImage} size={32} />
                      <span className="truncate">{s.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {dest.travelPlan ? <LocalIntel plan={dest.travelPlan} /> : <FieldIntel dest={dest} ai={ai} />}
    </section>
  );
}

/* =========================================================
   FIELD INTEL — bite-size local know-how under the map.
   Uses the AI insight snapshot when loaded; static tips
   cover signal, fuel and timing either way.
========================================================= */
function FieldIntel({ dest, ai }: { dest: DestinationView; ai?: EnrichResult }) {
  const tips: { icon: ReactNode; label: string; text: string }[] = [
    {
      icon: <Wifi className="h-4 w-4" />,
      label: "Signal",
      text:
        ai?.insights.cellCoverage ??
        "Cell signal drops inside and around the park — download offline maps before you leave the gateway town.",
    },
    {
      icon: <Fuel className="h-4 w-4" />,
      label: "Last fuel",
      text: dest.airportName
        ? `Fill up in the gateway town after leaving ${dest.airportName} — fuel near the entrance is pricier and stations are sparse.`
        : "Fill up in the gateway town — fuel near the entrance is pricier and stations are sparse.",
    },
    {
      icon: <Sun className="h-4 w-4" />,
      label: "Beat the crowds",
      text:
        ai?.insights.crowdLevels ??
        "Arrive at headline sights before 9 AM; parking lots at the popular trailheads fill first.",
    },
    {
      icon: <Mountain className="h-4 w-4" />,
      label: "Wildlife",
      text:
        ai?.insights.wildlife ??
        "Dawn and dusk are prime wildlife hours — drive slowly and never approach animals for a photo.",
    },
  ];

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tips.map((t) => (
        <div key={t.label} className="rounded-lg border border-border bg-card p-4 shadow-soft">
          <Thumb src={t.label === "Signal" ? mapImage : roadImage} size={40} />
          <p className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {t.label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/80">{t.text}</p>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   PARK TAG / PLAN B / LEAD MAGNET helpers
========================================================= */
// Only label stays we can classify honestly; otherwise show no tag.
function parkTag(o: OfferView): "inside" | "outside" | null {
  const url = (o.externalUrl ?? "").toLowerCase();
  if (url.includes("recreation.gov") || url.includes("nps.gov")) return "inside";
  if (o.partner === "campspot" || o.partner === "roverpass" || o.partner === "harvest_hosts")
    return "outside";
  return null;
}

/* =========================================================
   9 — CURATED 3–4 DAY FLOW
   Deterministic day-by-day flow built from data we already
   store (trip duration, airport, drive time, activities).
   No AI generation, no invented place names.
========================================================= */
function parseTripDays(raw: string | null): number {
  if (!raw) return 3;
  const nums = (raw.match(/\d+/g) ?? []).map(Number);
  if (nums.length === 0) return 3;
  return Math.min(4, Math.max(2, Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)));
}

function TripFlow({ dest }: { dest: DestinationView }) {
  const days = parseTripDays(dest.tripDurationDays);
  const stops = dest.activities.map((a) => a.title).filter(Boolean);

  const plan: { day: string; title: string; detail: string; start: string }[] = [];
  plan.push({
    day: "Day 1",
    title: "Arrive & settle in",
    detail: dest.airportCode
      ? `Land at ${dest.airportCode}, pick up your rental, and take the ${dest.driveMinutes != null ? formatDrive(dest.driveMinutes) : "scenic"} drive in. Stock up on groceries and fuel in the gateway town before prices rise near the park.`
      : "Arrive, pick up your rental, and stock up on groceries and fuel in the gateway town before heading in.",
    start: "Start: midday arrival",
  });
  const middleDays = days - 2;
  for (let i = 0; i < middleDays; i++) {
    const anchor = stops[i];
    plan.push({
      day: `Day ${i + 2}`,
      title: i === 0 ? "The iconic core" : "Beyond the crowds",
      detail: anchor
        ? `Head out early for ${anchor}. ${i === 0 ? "The headline sights are quietest before 9 AM — save the flexible stops for the afternoon." : "Use today for the stops most day-trippers skip; afternoons are yours to slow down."}`
        : i === 0
          ? "Head out early for the headline sights — they are quietest before 9 AM. Save flexible stops for the afternoon."
          : "Use today for the stops most day-trippers skip; afternoons are yours to slow down.",
      start: "Start: before 8 AM",
    });
  }
  plan.push({
    day: `Day ${days}`,
    title: "Golden hour & departure",
    detail:
      "Keep the last morning light for one final viewpoint, then loop back at your own pace. Leave buffer for the drive out — weekend traffic builds after lunch.",
    start: "Start: sunrise",
  });

  return (
    <section id="flow" className="scroll-mt-24">
      <SectionHeader title={`Your ${days}-day ${dest.name.split(" ")[0]} flow`} />
      <p className="-mt-3 mb-5 text-[11px] text-muted-foreground">
        A suggested rhythm, not a fixed schedule — swap days around the weather and your energy.
      </p>
      <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plan.map((p, i) => (
          <li
            key={p.day}
            className="relative flex flex-col rounded-lg border border-border bg-card p-5 shadow-soft"
          >
            <span className="inline-flex w-fit items-center rounded-full bg-forest/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-forest">
              {p.day}
            </span>
            <h3 className="mt-3 font-display text-lg text-foreground">{p.title}</h3>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{p.detail}</p>
            <p className="mt-4 border-t border-border pt-3 text-[11px] font-semibold text-foreground/70">
              {p.start}
            </p>
            {i < plan.length - 1 && (
              <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-foreground/30 xl:block" />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* =========================================================
   11 — SIMILAR DESTINATIONS
========================================================= */
function SimilarDestinations({ dest }: { dest: DestinationView }) {
  const similar = dest.similar.slice(0, 4);
  return (
    <section>
      <SectionHeader
        title="More destinations you'll love"
        action={<Link to="/destinations" className="inline-flex min-h-12 items-center text-sm font-semibold text-primary">All destinations <ArrowRight className="ml-1 h-4 w-4" /></Link>}
      />
      {similar.length === 0 ? (
        <EmptyState message="No related destinations yet." />
      ) : (
        <SwipeRow className="md:grid-cols-2 xl:grid-cols-4">
          {similar.map((d) => <PlaceCard key={d.slug} to="/destinations/$slug" params={{ slug: d.slug }} image={d.heroImage} alt={d.name} title={d.name} info={d.region} />)}
        </SwipeRow>
      )}
    </section>
  );
}

/* =========================================================
   12 — FINAL CTA
========================================================= */
type SaveState = "idle" | "prompt" | "saving" | "saved" | "error";

function FinalCta({ dest }: { dest: DestinationView }) {
  const save = useServerFn(saveTripPlan);
  const [state, setState] = useState<SaveState>("idle");
  const [email, setEmail] = useState("");

  const doSave = async (candidate: string) => {
    setState("saving");
    try {
      await save({ data: { email: candidate, destinationSlug: dest.slug } });
      setCapturedEmail(candidate);
      setState("saved");
    } catch (err) {
      console.error("[FinalCta] saveTripPlan failed", err);
      setState("error");
    }
  };

  const start = () => {
    const captured = getCapturedEmail();
    if (captured) {
      void doSave(captured);
      return;
    }
    setState("prompt");
  };

  return (
    <aside className="rounded-lg bg-ink p-6 text-off-white shadow-lift">
      <Thumb src={planImage} size={64} />
      <h2 className="mt-4 font-display text-xl">Ready to build your trip?</h2>
      <p className="mt-2 text-xs leading-relaxed text-off-white/80">
        Save places, compare options, and plan every detail in one place.
      </p>

      {state === "prompt" || state === "error" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void doSave(email.trim());
          }}
          className="mt-5 space-y-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-full bg-off-white px-4 py-2.5 text-xs text-ink outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-off-white px-4 py-2.5 text-xs font-semibold text-copper"
          >
            Save my trip plan
          </button>
          {state === "error" && (
            <p className="text-[11px] text-off-white/80">Something went wrong. Please try again.</p>
          )}
        </form>
      ) : state === "saved" ? (
        <p className="mt-5 rounded-full bg-off-white/15 px-4 py-2.5 text-center text-xs font-semibold">
          Trip plan saved ✓
        </p>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={state === "saving"}
          className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-off-white px-4 py-2.5 text-xs font-semibold text-copper transition hover:bg-off-white/90 disabled:opacity-70"
        >
          {state === "saving" ? "Saving…" : "Build my trip"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-[10px] text-off-white/60">
        
        Free — no account needed
      </p>
    </aside>
  );
}

// Links to this destination's search pages (best time, things to do, ...).
function PlanDeeper({ dest }: { dest: DestinationView }) {
  const arrivalSlug = flyDriveSlug(dest);
  const fetchPages = useServerFn(getPublicLandingPagesForDestination);
  const { data } = useQuery({
    queryKey: ["landing-pages", dest.id],
    queryFn: () => fetchPages({ data: { destinationId: dest.id } }),
    staleTime: 5 * 60 * 1000,
  });
  const noRes = isNoReservationEligible(dest);
  const rv = isRvEligible(dest);
  const loops = loopsForDestination(dest.slug);
  const gatewayTrips = CORRIDORS.filter((c) => c.stops.includes(dest.slug));
  const pill = "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted";
  if (!arrivalSlug && !noRes && !rv && loops.length === 0 && gatewayTrips.length === 0 && (!data || data.length === 0)) return null;
  return (
    <section className="border-y border-border py-6">
      <h2 className="font-display text-2xl text-foreground">Plan deeper</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {arrivalSlug && (
          <Link to="/fly-and-drive/$slug" params={{ slug: arrivalSlug }} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Fly into {dest.airportCode}: flights, car & first night
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        {noRes && (
          <Link to="/no-reservation/$slug" params={{ slug: dest.slug }} className={pill}>
            No reservation? Entry rules & backup plans <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        {rv && (
          <Link to="/rv-camping/$slug" params={{ slug: dest.slug }} className={pill}>
            By RV: campgrounds & RV parks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        {gatewayTrips.map((c) => (
          <Link key={c.slug} to="/corridors/$slug" params={{ slug: c.slug }} className={pill}>
            Airport road trip: {c.title} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
        {loops.map((l) => (
          <Link key={l.slug} to="/road-trips/$slug" params={{ slug: l.slug }} className={pill}>
            Road trip: {l.title} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
        {(data ?? []).map((p) => (
          <Link
            key={p.id}
            to="/$landing"
            params={{ landing: p.path.slice(1) }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {dest.name.replace(" National Park", "")}: {LANDING_TYPE_LABEL[p.pageType] ?? p.pageType}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}
