import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Baby,
  Calendar,
  Camera,
  ChevronRight,
  Coffee,
  CreditCard,
  DollarSign,
  Flame,
  Footprints,
  Fuel,
  Heart,
  Hotel,
  Map,
  MapPin,
  Mountain,
  Navigation,
  PawPrint,
  Ruler,
  Shield,
  ShieldCheck,
  ShoppingBasket,
  Shirt,
  Signal,
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
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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
import { saveTripPlan } from "@/lib/plans/savePlan.functions";
import { getCapturedEmail, setCapturedEmail } from "@/lib/plans/session";

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
    const description = d.tagline;
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
        { "script:ld+json": jsonLd },
        // Thin pages (no tagline or hero yet) stay out of search indexes.
        ...(d.tagline && d.heroImage ? [] : [{ name: "robots", content: "noindex, follow" }]),
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
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

      <main className="container-page space-y-14 py-12 md:space-y-16">
        <AffiliateNotice />

        {/* 2 + 3 — Stays with the budget rail beside them on desktop */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <TopStays dest={dest} />
          <TripBudget ai={ai} loading={aiLoading} />
        </div>

        {/* 4 */}
        <RentBeforeYouGo dest={dest} />

        {/* 5 + 6 */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <ThingsToDo dest={dest} />
          <TravelServices dest={dest} />
        </div>

        {/* 7 */}
        <RoadTrip dest={dest} />

        {/* 8 + 9 */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:items-start">
          <PackForTrip dest={dest} ai={ai} loading={aiLoading} />
          <Essentials dest={dest} />
        </div>

        {/* 10 */}
        <Toolkit dest={dest} ai={ai} loading={aiLoading} />

        {/* 11 + 12 */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <SimilarDestinations dest={dest} />
          <FinalCta dest={dest} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Visible, above-the-fold disclosure required before any commercial link.
function AffiliateNotice() {
  return (
    <aside className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
      <span>
        This page contains partner links. If you book or buy through them we may earn a commission,
        at no extra cost to you. Prices shown are estimates and are set by the partner.
      </span>
      <Link to="/affiliate-disclosure" className="font-semibold text-forest underline underline-offset-2">
        Affiliate disclosure
      </Link>
    </aside>
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

  const glance: { icon: ReactNode; label: string; value: string }[] = [
    { icon: <MapPin className="h-4 w-4" />, label: "Location", value: dest.region || "—" },
  ];
  if (dest.bestSeason)
    glance.push({
      icon: <Sun className="h-4 w-4" />,
      label: "Best season",
      value: dest.bestSeason,
    });
  if (dest.tripDurationDays)
    glance.push({
      icon: <Calendar className="h-4 w-4" />,
      label: "Ideal duration",
      value: dest.tripDurationDays,
    });
  if (dest.scenicScore != null)
    glance.push({
      icon: <Ruler className="h-4 w-4" />,
      label: "Scenic score",
      value: `${dest.scenicScore} / 10`,
    });
  if (dest.avgDailyBudget != null)
    glance.push({
      icon: <DollarSign className="h-4 w-4" />,
      label: "Average budget",
      value: `$${dest.avgDailyBudget} per day`,
    });

  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={dest.heroImage}
        alt={dest.name}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />

      <div className="container-page relative grid gap-10 py-14 md:py-20 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-14">
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
              className="inline-flex items-center justify-center rounded-full bg-copper px-6 py-3 text-sm font-semibold text-off-white transition hover:bg-copper/90"
            >
              See places to stay
            </a>
            <a
              href="#road-trip"
              className="inline-flex items-center justify-center rounded-full border border-off-white/50 px-6 py-3 text-sm font-semibold text-off-white transition hover:bg-off-white/10"
            >
              Explore the trip
            </a>
          </div>
        </div>

        {/* At a glance — desktop only, compact */}
        <aside className="hidden rounded-2xl border border-border/60 bg-card/95 p-5 shadow-lift backdrop-blur lg:block">
          <p className="text-sm font-semibold text-foreground">At a glance</p>
          <ul className="mt-3 divide-y divide-border">
            {glance.map((g) => (
              <li key={g.label} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 text-foreground/50">{g.icon}</span>
                <span className="min-w-0">
                  <span className="block text-[11px] text-muted-foreground">{g.label}</span>
                  <span className="block text-xs font-medium text-foreground">{g.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>
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
  return <span className="text-xs font-normal text-muted-foreground">Price on request</span>;
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
  const pad = size === "sm" ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs";

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
    <span className="inline-flex flex-col items-start gap-1">
      <a
        href={offer.externalUrl}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        title={outboundLinkTitle(offer.partner, offer.externalUrl)}
        onClick={handleClick}
        aria-disabled={pending}
        className={`inline-flex items-center gap-1.5 rounded-full bg-copper ${pad} font-semibold text-off-white transition hover:bg-copper/90 ${
          pending ? "pointer-events-none opacity-70" : ""
        }`}
      >
        {label}
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
      <span className="text-[10px] leading-tight text-muted-foreground">
        {partnerLabel(offer.partner)
          ? `Partner link · ${partnerLabel(offer.partner)}`
          : "Partner link"}
      </span>
    </span>
  );
}

function SectionHeader({ title, action, id }: { title: string; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3" id={id}>
      <h2 className="font-display text-2xl text-foreground md:text-[28px]">{title}</h2>
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
        title="Where you'll want to sleep"
        action={<TextLink>View all stays</TextLink>}
      />
      <p className="-mt-3 mb-4 text-[11px] text-muted-foreground">
        Checks availability with the partner directly — not a confirmed booking on our end.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {["All", ...cats].map((c) => (
          <button
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
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No stays listed for this filter yet." />
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pick && <StayCard offer={pick} destinationSlug={dest.slug} featured />}
          {rest.map((s) => (
            <StayCard key={s.id} offer={s} destinationSlug={dest.slug} />
          ))}
        </div>
      )}

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
}: {
  offer: OfferView;
  destinationSlug: string;
  featured?: boolean;
}) {
  return (
    <article
      className={
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:shadow-lift " +
        (featured
          ? "border-foreground/15 shadow-soft md:col-span-2 xl:col-span-1"
          : "border-border")
      }
    >
      <div className={"relative overflow-hidden " + (featured ? "aspect-[4/3]" : "aspect-[4/3]")}>
        <CardImg
          src={offer.image ?? ""}
          alt={offer.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {featured && (
          <span className="absolute left-0 top-4 rounded-r-full bg-ink/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-off-white">
            Minialife's pick
          </span>
        )}
        <button
          aria-label="Save this stay"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-off-white/90 text-foreground/60 transition hover:text-foreground"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-foreground">{offer.title}</h3>
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
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
          <PriceTag offer={offer} fallbackUnit="night" />
          <OfferCta offer={offer} label="Check availability" destinationSlug={destinationSlug} />
        </div>
      </div>
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
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
    <aside className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
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
                  <span className="text-foreground/45">{i.icon}</span>
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
  );
}

/* =========================================================
   4 — RENT BEFORE YOU GO
========================================================= */
function RentBeforeYouGo({ dest }: { dest: DestinationView }) {
  const rentals = dest.rentals.slice(0, 5);

  return (
    <section>
      <SectionHeader
        title="Don't bring everything — rent what makes sense here"
        action={<TextLink>View all rentals</TextLink>}
      />
      <p className="-mt-3 mb-4 text-[11px] text-muted-foreground">
        Checks availability with the partner directly — not a confirmed booking on our end.
      </p>
      {rentals.length === 0 ? (
        <EmptyState message="No rental partners listed for this destination yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {rentals.map((r) => (
            <RentalTile key={r.id} offer={r} destinationSlug={dest.slug} />
          ))}
        </div>
      )}
    </section>
  );
}

function RentalTile({ offer, destinationSlug }: { offer: OfferView; destinationSlug: string }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <CardImg
          src={offer.image ?? ""}
          alt={offer.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-sm font-semibold text-off-white">{offer.title}</p>
          <p className="mt-1 text-[11px] text-off-white/80">
            {offer.priceValue != null
              ? `From $${offer.priceValue} / ${offer.priceUnit ?? "day"}`
              : (offer.priceDisplay ?? "Price on request")}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <span className="truncate text-[11px] text-muted-foreground">
          {offer.subcategory ?? "Rental"}
        </span>
        <OfferCta
          offer={offer}
          label="See rental options"
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
  const activities = dest.activities.slice(0, 6);

  return (
    <section>
      <SectionHeader
        title="The moments you came for"
        action={<TextLink>View all activities</TextLink>}
      />
      {activities.length === 0 ? (
        <EmptyState message="No activities listed for this destination yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activities.map((a) => (
            <article
              key={a.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lift"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <CardImg
                  src={a.image ?? ""}
                  alt={a.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                {a.duration && (
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {a.duration}
                  </p>
                )}
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {a.whyRecommended ?? a.description}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                  <PriceTag
                    offer={a}
                    fallbackUnit="person"
                    className="font-serif text-base font-semibold text-foreground"
                  />
                  <OfferCta
                    offer={a}
                    label="Explore activity"
                    size="sm"
                    destinationSlug={dest.slug}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
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
    icon: <Map className="h-4 w-4" />,
    sub: "Download trails before you lose signal",
  },
};

function TravelServices({ dest }: { dest: DestinationView }) {
  const services = dest.globalServices;

  return (
    <aside className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-display text-lg text-foreground">Before you hit the road</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        The few things worth sorting out in advance.
      </p>

      {services.length === 0 ? (
        <p className="mt-5 text-xs text-muted-foreground">No travel services available yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {services.map((s) => (
            <li key={s.id}>
              <ServiceRow service={s} destinationSlug={dest.slug} />
            </li>
          ))}
        </ul>
      )}
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
      <span className="mt-0.5 text-foreground/50">{meta.icon}</span>
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
   No routing/map provider is connected, so we show a clearly
   labelled fallback instead of inventing stops or distances.
========================================================= */
const ON_THE_WAY = [
  { icon: <Fuel className="h-4 w-4" />, label: "Fuel & EV charging" },
  { icon: <Coffee className="h-4 w-4" />, label: "Coffee & food" },
  { icon: <Tent className="h-4 w-4" />, label: "Rest stops" },
  { icon: <Hotel className="h-4 w-4" />, label: "Hotels & lodging" },
  { icon: <Truck className="h-4 w-4" />, label: "RV services" },
  { icon: <ShoppingBasket className="h-4 w-4" />, label: "Grocery stores" },
];

function RoadTrip({ dest }: { dest: DestinationView }) {
  return (
    <section id="road-trip" className="scroll-mt-24">
      <SectionHeader title="Plan your road trip" />
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-soft lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-xl border border-border bg-beige/60">
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-8 text-center">
            <Map className="h-7 w-7 text-foreground/40" />
            <p className="text-sm font-semibold text-foreground">
              Route map for {dest.name} is coming soon
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              We only show driving routes, stops and distances once they come from a live mapping
              provider — we won't estimate them for you.
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-foreground">On the way you'll find</p>
          <ul className="mt-3 space-y-2.5">
            {ON_THE_WAY.map((o) => (
              <li
                key={o.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-beige/40 px-3 py-2.5"
              >
                <span className="text-foreground/50">{o.icon}</span>
                <span className="text-xs text-foreground/80">{o.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {dest.region || dest.name}
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   8 — PACK FOR THE TRIP
========================================================= */
type PackKey = keyof EnrichResult["packing"] | "hiking";

const PACK_CATEGORIES: { key: PackKey; label: string; icon: ReactNode; hint: string }[] = [
  { key: "clothing", label: "Clothing", icon: <Shirt className="h-5 w-5" />, hint: "Layer up" },
  { key: "camping", label: "Camping", icon: <Tent className="h-5 w-5" />, hint: "Sleep system" },
  {
    key: "cooking",
    label: "Cooking",
    icon: <Flame className="h-5 w-5" />,
    hint: "Stove & cookware",
  },
  {
    key: "photography",
    label: "Photography",
    icon: <Camera className="h-5 w-5" />,
    hint: "Capture it",
  },
  {
    key: "hiking",
    label: "Hiking",
    icon: <Footprints className="h-5 w-5" />,
    hint: "Boots & poles",
  },
  { key: "kids", label: "Kids", icon: <Baby className="h-5 w-5" />, hint: "Family must-haves" },
  { key: "pets", label: "Pets", icon: <PawPrint className="h-5 w-5" />, hint: "Travel with pets" },
];

function PackForTrip({
  dest,
  ai,
  loading,
}: {
  dest: DestinationView;
  ai?: EnrichResult;
  loading: boolean;
}) {
  const [active, setActive] = useState<PackKey>("clothing");
  const items =
    ai && active !== "hiking" ? ai.packing[active as keyof EnrichResult["packing"]] : undefined;

  const download = () => {
    if (!ai) return;
    const lines = Object.entries(ai.packing).flatMap(([group, list]) => [
      group.toUpperCase(),
      ...list.map((i) => `  [ ] ${i}`),
      "",
    ]);
    const blob = new Blob([`Packing list — ${dest.name}\n\n${lines.join("\n")}`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dest.slug}-packing-list.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl text-foreground">
          Pack for {dest.name.split(" ")[0]}
        </h2>
        <button
          type="button"
          onClick={download}
          disabled={!ai}
          className="inline-flex items-center gap-1 text-xs font-semibold text-foreground/70 disabled:opacity-40"
        >
          Download checklist
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-4">
        {PACK_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setActive(c.key)}
            className={
              "flex flex-col items-center gap-1.5 rounded-xl border px-1.5 py-3 text-center transition " +
              (active === c.key
                ? "border-foreground/25 bg-beige/70"
                : "border-border hover:bg-beige/40")
            }
          >
            <span className="text-foreground/60">{c.icon}</span>
            <span className="text-[10px] font-semibold text-foreground">{c.label}</span>
            <span className="text-[9px] leading-tight text-muted-foreground">{c.hint}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-beige/50 p-4">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        ) : active === "hiking" ? (
          <p className="text-xs text-muted-foreground">
            Boots, trekking poles, daypack, 2L water and a printed trail map — check conditions at
            the ranger station before heading out.
          </p>
        ) : items && items.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {items.map((i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
                {i}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            The packing list for this destination isn't ready yet.
          </p>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   9 — ESSENTIALS WORTH HAVING
========================================================= */
function Essentials({ dest }: { dest: DestinationView }) {
  const items = dest.essentials.slice(0, 5);

  return (
    <section>
      <SectionHeader title="Essentials worth having" action={<TextLink>View all gear</TextLink>} />
      {items.length === 0 ? (
        <EmptyState message="No gear recommendations for this destination yet." />
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((e) => (
            <article
              key={e.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lift"
            >
              <div className="relative aspect-square overflow-hidden bg-beige/50">
                <CardImg
                  src={e.image ?? ""}
                  alt={e.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <h3 className="text-xs font-semibold text-foreground">{e.title}</h3>
                <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">
                  {e.whyRecommended ?? e.description}
                </p>
                <div className="mt-auto flex flex-col items-start gap-2 border-t border-border pt-3">
                  <PriceTag
                    offer={e}
                    fallbackUnit="item"
                    className="font-serif text-sm font-semibold text-foreground"
                  />
                  <OfferCta offer={e} label="View" size="sm" destinationSlug={dest.slug} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   10 — DESTINATION INFORMATION TOOLKIT
========================================================= */
type ToolkitKey = "insights" | "seasonal" | "checklist" | "before";

function Toolkit({
  dest,
  ai,
  loading,
}: {
  dest: DestinationView;
  ai?: EnrichResult;
  loading: boolean;
}) {
  const [open, setOpen] = useState<ToolkitKey | null>(null);

  const cards: { key: ToolkitKey; title: string; sub: string; cta: string; img: string }[] = [
    {
      key: "insights",
      title: "Destination insights",
      sub: "Weather, crowds, wildlife, cell service & safety.",
      cta: "Read guide",
      img: dest.gallery[0] ?? dest.heroImage,
    },
    {
      key: "seasonal",
      title: "Seasonal guide",
      sub: "Best times to visit and what to expect each season.",
      cta: "See seasons",
      img: dest.gallery[1] ?? dest.heroImage,
    },
    {
      key: "checklist",
      title: "Packing checklist",
      sub: "Everything to bring, grouped by category.",
      cta: "Get checklist",
      img: dest.gallery[2] ?? dest.heroImage,
    },
    {
      key: "before",
      title: "Before you go",
      sub: "Passes, reservations and rules to sort out early.",
      cta: "See guide",
      img: dest.gallery[3] ?? dest.heroImage,
    },
  ];

  return (
    <section>
      <SectionHeader title="Everything else you need to know" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setOpen(open === c.key ? null : c.key)}
            className="group relative overflow-hidden rounded-2xl border border-border text-left"
          >
            <div className="relative aspect-[4/3]">
              <CardImg
                src={c.img}
                alt={c.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-ink/10" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-semibold text-off-white">{c.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-off-white/75">{c.sub}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-off-white">
                  {open === c.key ? "Close" : c.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
          {open === "insights" && <InsightsPanel ai={ai} loading={loading} />}
          {open === "seasonal" && <SeasonalPanel ai={ai} loading={loading} dest={dest} />}
          {open === "checklist" && <ChecklistPanel ai={ai} loading={loading} />}
          {open === "before" && <BeforeYouGoPanel dest={dest} />}
        </div>
      )}
    </section>
  );
}

function InsightsPanel({ ai, loading }: { ai?: EnrichResult; loading: boolean }) {
  const rows: { icon: ReactNode; label: string; key: keyof EnrichResult["insights"] }[] = [
    { icon: <Sun className="h-4 w-4" />, label: "Weather", key: "weather" },
    { icon: <Users className="h-4 w-4" />, label: "Crowd levels", key: "crowdLevels" },
    { icon: <PawPrint className="h-4 w-4" />, label: "Wildlife", key: "wildlife" },
    { icon: <Signal className="h-4 w-4" />, label: "Cell coverage", key: "cellCoverage" },
    { icon: <Shield className="h-4 w-4" />, label: "Safety", key: "safety" },
    { icon: <Heart className="h-4 w-4" />, label: "Family friendly", key: "familyFriendly" },
    { icon: <PawPrint className="h-4 w-4" />, label: "Pet friendly", key: "petFriendly" },
  ];

  if (loading) return <Skeleton className="h-24 w-full" />;
  if (!ai)
    return (
      <p className="text-xs text-muted-foreground">
        Destination insights aren't available right now.
      </p>
    );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((r) => (
        <div key={r.label} className="rounded-xl border border-border bg-beige/40 p-3">
          <div className="flex items-center gap-1.5 text-foreground/60">
            {r.icon}
            <span className="text-[10px] font-semibold uppercase tracking-wide">{r.label}</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/80">
            {ai.insights[r.key]}
          </p>
        </div>
      ))}
    </div>
  );
}

function SeasonalPanel({
  ai,
  loading,
  dest,
}: {
  ai?: EnrichResult;
  loading: boolean;
  dest: DestinationView;
}) {
  if (loading) return <Skeleton className="h-20 w-full" />;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border bg-beige/40 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Best season
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">{dest.bestSeason ?? "—"}</p>
      </div>
      <div className="rounded-xl border border-border bg-beige/40 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Best time to visit
        </p>
        <p className="mt-1 text-xs leading-relaxed text-foreground/80">
          {ai?.insights.bestTimeToVisit ?? "Not available yet."}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-beige/40 p-4 sm:col-span-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          What the weather does
        </p>
        <p className="mt-1 text-xs leading-relaxed text-foreground/80">
          {ai?.insights.weather ?? "Not available yet."}
        </p>
      </div>
    </div>
  );
}

function ChecklistPanel({ ai, loading }: { ai?: EnrichResult; loading: boolean }) {
  if (loading) return <Skeleton className="h-20 w-full" />;
  if (!ai)
    return <p className="text-xs text-muted-foreground">The checklist isn't available yet.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(ai.packing).map(([group, list]) => (
        <div key={group}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {group}
          </p>
          <ul className="mt-2 space-y-1.5">
            {list.map((i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function BeforeYouGoPanel({ dest }: { dest: DestinationView }) {
  if (dest.globalServices.length === 0)
    return <p className="text-xs text-muted-foreground">Nothing here yet.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {dest.globalServices.map((s) => (
        <div key={s.id} className="rounded-xl border border-border bg-beige/40 p-4">
          <p className="text-xs font-semibold text-foreground">{s.title}</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {s.whyRecommended ?? s.description ?? SERVICE_META[s.category]?.sub}
          </p>
          {!s.commissionable && (
            <span className="mt-2 inline-block rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
              Official link
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   11 — SIMILAR DESTINATIONS
========================================================= */
function SimilarDestinations({ dest }: { dest: DestinationView }) {
  const similar = dest.similar.slice(0, 6);
  return (
    <section>
      <SectionHeader
        title="More destinations you'll love"
        action={<TextLink>View all destinations</TextLink>}
      />
      {similar.length === 0 ? (
        <EmptyState message="No related destinations yet." />
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
          {similar.map((d) => (
            <Link
              key={d.slug}
              to="/destinations/$slug"
              params={{ slug: d.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border"
            >
              <div className="relative aspect-[3/4]">
                <CardImg
                  src={d.heroImage}
                  alt={d.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="text-xs font-semibold leading-snug text-off-white">{d.name}</p>
                  <p className="mt-0.5 text-[10px] text-off-white/75">{d.region}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
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
    <aside className="rounded-2xl bg-ink p-6 text-off-white shadow-lift">
      <Sparkles className="h-6 w-6 text-off-white/70" />
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
        <Star className="h-3 w-3" />
        Free — no account needed
      </p>
    </aside>
  );
}
