import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Download,
  Facebook,
  Heart,
  Instagram,
  Link2,
  Map,
  MapPin,
  Mountain,
  Navigation,
  PawPrint,
  Shield,
  ShieldCheck,
  Signal,
  Sparkles,
  Star,
  Sun,
  Tent,
  
  Trees,
  Users,
  Wifi,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDestinationPageData,
  type DestinationView,
  type OfferView,
} from "@/lib/data/destinations.functions";
import { enrichDestination, type EnrichResult } from "@/lib/ai/enrich.functions";

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
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: d.heroImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: d.heroImage },
      ],
    };
  },
  component: DestinationPage,
});

function DestinationPage() {
  const { dest } = Route.useLoaderData() as { dest: DestinationView };
  const enrich = useServerFn(enrichDestination);

  const { data: ai, isLoading: aiLoading } = useQuery({
    queryKey: ["enrich", dest.slug],
    queryFn: () => enrich({ data: { slug: dest.slug } }),
    staleTime: Infinity,
  });

  return (
    <div className="bg-beige/30">
      <Header />

      <main className="container-page py-6 space-y-6">
        <Hero dest={dest} />
        <BeforeYouGo />
        <TopStays dest={dest} />
        <RentBeforeYouGo dest={dest} />
        <ThingsToDoAndBudget dest={dest} ai={ai} loading={aiLoading} />
        <RoadTripInfo dest={dest} />
        <DestinationInsights ai={ai} loading={aiLoading} />
        <PackingSeasonalEssentials dest={dest} ai={ai} loading={aiLoading} />
        <ShareAndSimilar dest={dest} />
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   HERO
========================================================= */
function Hero({ dest }: { dest: DestinationView }) {
  const [region, sub] = dest.region.split(",").map((s) => s.trim());
  const stats: { icon: ReactNode; label: string; value: string }[] = [];
  if (dest.bestSeason)
    stats.push({ icon: <Sun className="h-4 w-4" />, label: "Best season", value: dest.bestSeason });
  if (dest.scenicScore != null)
    stats.push({ icon: <Star className="h-4 w-4" />, label: "Scenic score", value: `${dest.scenicScore}/10` });
  if (dest.campingScore != null)
    stats.push({ icon: <Tent className="h-4 w-4" />, label: "Camping score", value: `${dest.campingScore}/10` });
  if (dest.avgDailyBudget != null)
    stats.push({ icon: <DollarSign className="h-4 w-4" />, label: "Budget", value: `$${dest.avgDailyBudget} / day` });
  if (dest.tripDurationDays)
    stats.push({ icon: <Calendar className="h-4 w-4" />, label: "Ideal duration", value: dest.tripDurationDays });


  const snapshotItems = [
    "Best for first-time campers",
    "RV & pet friendly",
    "Great for families",
    "Excellent photography",
    "Moderate budget",
    ...(dest.bestSeason ? [`Best in ${dest.bestSeason.split("–")[0].trim()}`] : []),
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl">
      <img
        src={dest.heroImage}
        alt={dest.name}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/30" />

      <div className="relative grid gap-8 p-8 md:p-12 lg:grid-cols-[1.4fr_1fr] lg:gap-10 lg:p-14">
        {/* Left */}
        <div className="flex min-h-[480px] flex-col justify-between text-off-white">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-off-white/80">
            {sub ?? region}
            <span className="opacity-50">›</span>
            <span className="opacity-90">{region}</span>
          </p>

          <div className="mt-6">
            <h1 className="font-display text-4xl leading-[1.05] md:text-6xl lg:text-7xl">
              {dest.name}
            </h1>
            <p className="mt-5 max-w-xl text-base text-off-white/90 md:text-lg">
              {dest.tagline}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <HeroStat key={s.label} icon={s.icon} label={s.label} value={s.value} />
            ))}
          </div>
        </div>

        {/* AI Trip Snapshot */}
        <aside className="self-start rounded-2xl bg-ink/70 p-6 text-off-white shadow-lift backdrop-blur-md ring-1 ring-off-white/15">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ember" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
              AI Trip Snapshot
            </h2>
            <span className="ml-auto rounded-sm bg-ember px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Beta
            </span>
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            {snapshotItems.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                <span className="text-off-white/90">{t}</span>
              </li>
            ))}
          </ul>
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-ember px-4 py-2.5 text-sm font-semibold text-off-white hover:bg-ember/90">
            <Sparkles className="h-4 w-4" /> Customize my trip
          </button>
        </aside>
      </div>
    </section>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-ember">{icon}<span className="text-[11px] uppercase tracking-[0.14em] text-off-white/70">{label}</span></div>
      <p className="mt-1 text-sm font-medium text-off-white">{value}</p>
    </div>
  );
}

/* =========================================================
   BEFORE YOU GO
========================================================= */
function BeforeYouGo() {
  const items = [
    { icon: <ShieldCheck className="h-6 w-6" />, title: "Travel Insurance", sub: "Stay protected", cta: "Compare plans" },
    { icon: <Wifi className="h-6 w-6" />, title: "eSIM Data Plans", sub: "Stay connected", cta: "From $4.50" },
    { icon: <Navigation className="h-6 w-6" />, title: "Car Rental", sub: "Explore beyond", cta: "From $29/day" },
    { icon: <Trees className="h-6 w-6" />, title: "Park Pass", sub: "America the Beautiful", cta: "Learn more" },
    { icon: <Map className="h-6 w-6" />, title: "Offline Maps", sub: "Download & explore", cta: "View options" },
    { icon: <CreditCard className="h-6 w-6" />, title: "Travel Card", sub: "No foreign fees", cta: "Learn more" },
  ];
  return (
    <SectionCard
      title="Before you go"
      eyebrow="Everything you need for a smooth trip."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((i) => (
          <a
            key={i.title}
            href="#"
            className="group flex flex-col gap-2 rounded-xl border border-border bg-beige/40 p-4 transition hover:border-forest/40 hover:bg-beige"
          >
            <div className="text-forest">{i.icon}</div>
            <p className="text-sm font-semibold text-foreground">{i.title}</p>
            <p className="text-xs text-muted-foreground">{i.sub}</p>
            <p className="mt-auto text-xs font-medium text-forest group-hover:underline">
              {i.cta}
            </p>
          </a>
        ))}
      </div>
    </SectionCard>
  );
}

/* =========================================================
   OFFER HELPERS (price + CTA shared by Stays / Rentals / Essentials)
========================================================= */
function PriceTag({
  offer,
  fallbackUnit,
  className = "text-sm font-semibold text-foreground",
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
        <span className="text-xs font-normal text-muted-foreground"> / {unit}</span>
      </span>
    );
  }
  if (offer.priceDisplay) return <span className={className}>{offer.priceDisplay}</span>;
  return <span className="text-xs font-normal text-muted-foreground">Price on request</span>;
}

function OfferCta({
  offer,
  label,
  size = "md",
}: {
  offer: OfferView;
  label: string;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-3 py-1" : "px-3 py-1.5";
  if (offer.externalUrl) {
    return (
      <a
        href={offer.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`rounded-md bg-forest ${padding} text-xs font-semibold text-off-white hover:bg-forest/90`}
      >
        {label}
      </a>
    );
  }
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className={`cursor-not-allowed rounded-md border border-border bg-muted ${padding} text-xs font-semibold text-muted-foreground/70`}
    >
      Coming soon
    </button>
  );
}

/* =========================================================
   TOP STAYS
========================================================= */
function TopStays({ dest }: { dest: DestinationView }) {
  const cats = useMemo(
    () =>
      Array.from(
        new Set(dest.stays.map((s) => s.subcategory).filter((c): c is string => Boolean(c))),
      ),
    [dest],
  );
  const [tab, setTab] = useState<string>("All");
  const filtered = tab === "All" ? dest.stays : dest.stays.filter((s) => s.subcategory === tab);
  const aiPicks = ["AI Pick · Best Overall", "AI Pick · Best Glamping", "AI Pick · Best Cabin", "AI Pick · Best RV"];

  return (
    <SectionCard
      title={`Top Stays in ${dest.name.split(" ")[0]}`}
      eyebrow="Handpicked stays for every style and budget."
      right={
        <div className="flex flex-wrap items-center gap-2">
          {["All", ...cats].map((c) => (
            <button
              key={c}
              onClick={() => setTab(c)}
              className={
                "rounded-full px-3 py-1.5 text-xs transition " +
                (tab === c
                  ? "bg-forest text-off-white"
                  : "border border-border bg-background text-foreground/70 hover:bg-muted")
              }
            >
              {c}
            </button>
          ))}
          <Button size="sm" variant="outline" className="ml-2">
            View all stays
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.slice(0, 4).map((s, i) => (
          <article
            key={s.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={s.image ?? ""}
                alt={s.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-sm bg-ink/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-off-white">
                {aiPicks[i] ?? "AI Pick"}
              </span>
              <button
                aria-label="Save"
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-off-white/90 text-forest hover:bg-off-white"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-display text-base text-foreground">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
              {s.whyRecommended && (
                <p className="mt-3 flex items-start gap-1.5 text-xs text-foreground/80">
                  <Sparkles className="mt-0.5 h-3 w-3 text-ember" />
                  <span><span className="font-semibold text-forest">Why we recommend it. </span>{s.whyRecommended}</span>
                </p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <PriceTag offer={s} fallbackUnit="night" />
                <OfferCta offer={s} label="Check availability" size="md" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}

/* =========================================================
   RENTALS
========================================================= */
function RentBeforeYouGo({ dest }: { dest: DestinationView }) {
  return (
    <SectionCard
      title="Rent Before You Go"
      eyebrow="The right gear and ride for the right adventure."
      right={<Button size="sm" variant="outline">View all rentals</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {dest.rentals.slice(0, 5).map((r) => (
          <article
            key={r.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={r.image ?? ""}
                alt={r.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <button
                aria-label="Save"
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-off-white/90 text-forest hover:bg-off-white"
              >
                <Heart className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground">{r.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <PriceTag offer={r} fallbackUnit="day" className="text-xs font-semibold text-foreground" />
                <OfferCta offer={r} label="Reserve" size="sm" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}

/* =========================================================
   THINGS TO DO + BUDGET
========================================================= */
function ThingsToDoAndBudget({
  dest,
  ai,
  loading,
}: {
  dest: DestinationView;
  ai?: EnrichResult;
  loading: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <SectionCard
        title="Things to Do"
        eyebrow={`Unforgettable experiences in ${dest.name.split(" ")[0]}.`}
        right={<Button size="sm" variant="outline">View all activities</Button>}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dest.activities.slice(0, 4).map((a) => (
            <article
              key={a.id}
              className="group overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={a.image ?? ""}
                  alt={a.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-sage-deep">{a.duration}</p>
                <h3 className="mt-1 text-sm font-semibold text-foreground">{a.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{a.description}</p>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <BudgetCard ai={ai} loading={loading} />
    </div>
  );
}

function BudgetCard({ ai, loading }: { ai?: EnrichResult; loading: boolean }) {
  const items = ai
    ? [
        { label: "Accommodation", value: ai.budget.accommodation, color: "#3d5a3d" },
        { label: "Activities", value: ai.budget.activities, color: "#8aa17a" },
        { label: "Food", value: ai.budget.food, color: "#c9a84c" },
        { label: "Fuel", value: ai.budget.fuel, color: "#e8a87c" },
        { label: "Rental", value: ai.budget.rental, color: "#c4654a" },
        { label: "Equipment", value: ai.budget.equipment, color: "#6b3a2a" },
      ]
    : [];
  const total = items.reduce((s, i) => s + i.value, 0);

  // donut math
  let cumulative = 0;
  const radius = 42;
  const circ = 2 * Math.PI * radius;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl text-foreground">Trip Budget</h2>
          <p className="text-xs text-muted-foreground">4-day trip · 2 travelers</p>
        </div>
        {!loading && total > 0 && (
          <svg viewBox="0 0 100 100" className="h-20 w-20 -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-beige)" strokeWidth="14" />
            {items.map((it) => {
              const frac = it.value / total;
              const dash = frac * circ;
              const el = (
                <circle
                  key={it.label}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={it.color}
                  strokeWidth="14"
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={-cumulative}
                />
              );
              cumulative += dash;
              return el;
            })}
          </svg>
        )}
      </div>

      <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">Estimated total</p>
      {loading || !ai ? (
        <Skeleton className="mt-1 h-9 w-32" />
      ) : (
        <p className="font-display text-3xl text-foreground">${total.toLocaleString()}</p>
      )}

      <ul className="mt-5 space-y-2.5 text-sm">
        {loading || !ai
          ? [0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-5 w-full" />)
          : items.map((i) => (
              <li key={i.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground/80">
                  <span className="h-2 w-2 rounded-full" style={{ background: i.color }} />
                  {i.label}
                </span>
                <span className="font-medium text-foreground">${i.value.toLocaleString()}</span>
              </li>
            ))}
      </ul>

      {ai && (
        <p className="mt-5 border-t border-border pt-4 text-[11px] text-muted-foreground">
          {ai.budget.note}
        </p>
      )}
      <button className="mt-4 w-full rounded-md border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted">
        Adjust budget
      </button>
    </section>
  );
}

/* =========================================================
   ROAD TRIP INFO
========================================================= */
function RoadTripInfo({ dest }: { dest: DestinationView }) {
  const stops = [
    { name: "The Groveland Hotel", sub: "Coffee & pastries · Groveland, CA", img: dest.stays[0]?.image ?? dest.heroImage },
    { name: "Hetch Hetchy View", sub: "Scenic viewpoint · CA-120", img: dest.activities[1]?.image ?? dest.heroImage },
    { name: "Tuolumne Gas & Mart", sub: "Fuel stop · Groveland, CA", img: dest.rentals[0]?.image ?? dest.heroImage },
    { name: "The Red Apple Grill", sub: "Great burgers · Groveland, CA", img: dest.stays[2]?.image ?? dest.heroImage },
  ];
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-[1fr_2.2fr]">
        <div>
          <h2 className="font-display text-xl text-foreground">Road Trip Info</h2>
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 text-forest" /> San Francisco → {dest.name.split(" ")[0]}
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> 4h 15m
            <span className="mx-2 h-1 w-1 rounded-full bg-muted-foreground/40" />
            <Navigation className="h-3.5 w-3.5" /> 189 miles
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Best route: CA-120 E</p>
          <Button variant="outline" size="sm" className="mt-5">View full route</Button>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Top Stops Along the Way</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stops.map((s) => (
              <article key={s.name} className="overflow-hidden rounded-xl border border-border">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={s.img} alt={s.name} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground">{s.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   DESTINATION INSIGHTS
========================================================= */
function DestinationInsights({ ai, loading }: { ai?: EnrichResult; loading: boolean }) {
  const rows: { icon: React.ReactNode; label: string; key: keyof EnrichResult["insights"] }[] = [
    { icon: <Sun className="h-4 w-4" />, label: "Weather", key: "weather" },
    { icon: <Users className="h-4 w-4" />, label: "Crowd levels", key: "crowdLevels" },
    { icon: <PawPrint className="h-4 w-4" />, label: "Wildlife", key: "wildlife" },
    { icon: <Signal className="h-4 w-4" />, label: "Cell coverage", key: "cellCoverage" },
    { icon: <Shield className="h-4 w-4" />, label: "Safety", key: "safety" },
    { icon: <Heart className="h-4 w-4" />, label: "Family friendly", key: "familyFriendly" },
    { icon: <PawPrint className="h-4 w-4" />, label: "Pet friendly", key: "petFriendly" },
  ];
  return (
    <section className="rounded-2xl border border-border bg-gradient-to-b from-card to-beige/60 p-6 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-[1fr_3fr] lg:items-start">
        <div>
          <h2 className="font-display text-xl text-foreground">Destination Insights</h2>
          <p className="mt-2 text-xs text-muted-foreground">Everything you should know before you go.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {rows.map((r) => (
            <div key={r.label} className="rounded-xl border border-border bg-card/80 p-3">
              <div className="flex items-center gap-1.5 text-forest">
                {r.icon}
                <span className="text-[11px] font-semibold uppercase tracking-wide">{r.label}</span>
              </div>
              {loading || !ai ? (
                <Skeleton className="mt-2 h-3 w-full" />
              ) : (
                <p className="mt-1.5 text-[11px] text-foreground/80 line-clamp-3">{ai.insights[r.key]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PACKING + SEASONAL + ESSENTIALS
========================================================= */
function PackingSeasonalEssentials({
  dest,
  ai,
  loading,
}: {
  dest: DestinationView;
  ai?: EnrichResult;
  loading: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <PackingChecklist dest={dest.name} ai={ai} loading={loading} />
      <SeasonalGuide />
      <EssentialsList dest={dest} />
    </div>
  );
}

function PackingChecklist({
  dest,
  ai,
  loading,
}: {
  dest: string;
  ai?: EnrichResult;
  loading: boolean;
}) {
  const groups: (keyof EnrichResult["packing"])[] = [
    "camping",
    "clothing",
    "cooking",
    "photography",
    "kids",
    "pets",
  ];
  const [tab, setTab] = useState<keyof EnrichResult["packing"]>("camping");

  const download = () => {
    if (!ai) return;
    const lines = [`Packing checklist — ${dest}`, ""];
    groups.forEach((g) => {
      lines.push(g.toUpperCase());
      ai.packing[g].forEach((i) => lines.push(`  [ ] ${i}`));
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dest.toLowerCase().replace(/\s+/g, "-")}-packing-list.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const items = ai?.packing[tab] ?? [];
  const mid = Math.ceil(items.length / 2);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">Packing Checklist</h2>
          <p className="text-xs text-muted-foreground">Bring exactly what you'll use.</p>
        </div>
        <Button variant="outline" size="sm" onClick={download} disabled={!ai}>
          <Download className="h-3.5 w-3.5" /> Download full list
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setTab(g)}
            className={
              "rounded-md px-3 py-1.5 text-xs capitalize transition " +
              (tab === g
                ? "bg-forest text-off-white"
                : "bg-beige text-foreground/70 hover:bg-beige/70")
            }
          >
            {g}
          </button>
        ))}
      </div>

      {loading || !ai ? (
        <div className="mt-5 space-y-2">
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          {[items.slice(0, mid), items.slice(mid)].map((col, ci) => (
            <ul key={ci} className="space-y-2.5">
              {col.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-sm border border-border bg-beige/60">
                    {ci === 0 && <CheckCircle2 className="h-3 w-3 text-forest" />}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl bg-beige/60 p-4">
        <p className="flex items-start gap-2 text-xs text-foreground/80">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 text-ember" />
          <span>
            <span className="font-semibold text-forest">Tip from AI. </span>
            Even in summer, nights can drop below 40°F in the high country. Pack layers.
          </span>
        </p>
      </div>
    </section>
  );
}

function SeasonalGuide() {
  const seasons = [
    { name: "Spring (May – Jun)", note: "Great waterfalls, cool temps", rating: 5 },
    { name: "Summer (Jul – Aug)", note: "Warm days, busy trails", rating: 5 },
    { name: "Fall (Sep – Oct)", note: "Best weather, fewer crowds", rating: 4 },
    { name: "Winter (Nov – Apr)", note: "Snowy, some roads closed", rating: 2 },
  ];
  const types = [
    { type: "Campground", cost: "$", comfort: 3, nature: 5 },
    { type: "Glamping", cost: "$$$", comfort: 5, nature: 4 },
    { type: "Cabin", cost: "$$$", comfort: 5, nature: 4 },
    { type: "RV Park", cost: "$$", comfort: 4, nature: 3 },
  ];
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-display text-xl text-foreground">Seasonal Guide</h2>
      <p className="text-xs text-muted-foreground">Which season is right for you?</p>

      <ul className="mt-5 space-y-3">
        {seasons.map((s) => (
          <li key={s.name} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{s.name}</p>
              <Stars n={s.rating} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-6 text-sm font-semibold text-foreground">Compare Stay Types</h3>
      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 font-normal">Type</th>
            <th className="py-2 font-normal">Cost</th>
            <th className="py-2 font-normal">Comfort</th>
            <th className="py-2 font-normal">Nature</th>
          </tr>
        </thead>
        <tbody>
          {types.map((t) => (
            <tr key={t.type} className="border-b border-border/60 last:border-0">
              <td className="py-2 font-medium text-foreground">{t.type}</td>
              <td className="py-2 text-foreground/70">{t.cost}</td>
              <td className="py-2"><Stars n={t.comfort} size={3} /></td>
              <td className="py-2"><Stars n={t.nature} size={3} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Stars({ n, size = 3.5 }: { n: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
          className={i <= n ? "fill-ember text-ember" : "text-muted-foreground/30"}
        />
      ))}
    </div>
  );
}

function EssentialsList({ dest }: { dest: DestinationView }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl text-foreground">Essentials</h2>
          <p className="text-xs text-muted-foreground">Five things worth packing.</p>
        </div>
        <Button variant="outline" size="sm">View all gear</Button>
      </div>
      <ul className="mt-5 divide-y divide-border">
        {dest.essentials.slice(0, 5).map((e) => (
          <li key={e.id} className="flex items-center gap-4 py-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-beige">
              <img src={e.image ?? ""} alt={e.title} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{e.title}</p>
              <p className="truncate text-xs text-muted-foreground">{e.description}</p>
            </div>
            <PriceTag offer={e} fallbackUnit="item" />
          </li>
        ))}
      </ul>
    </section>
  );
}

/* =========================================================
   SHARE + SIMILAR
========================================================= */
function ShareAndSimilar({ dest }: { dest: DestinationView }) {
  const similar = dest.similar.slice(0, 4);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl text-foreground">Share Your Trip Plan</h2>
        <p className="text-xs text-muted-foreground">Inspire others. Save your plan.</p>
        <div className="mt-5 flex gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
            <img src={dest.heroImage} alt={dest.name} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{dest.name.split(" ")[0]} Adventure</p>
            <p className="mt-1 text-xs text-muted-foreground">4 Days · 2 Travelers</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
              <div>
                <p className="uppercase tracking-wider">Budget</p>
                <p className="text-foreground">$1,400</p>
              </div>
              <div>
                <p className="uppercase tracking-wider">Stay</p>
                <p className="truncate text-foreground">{dest.stays[0]?.title.split(" ").slice(0, 2).join(" ")}</p>
              </div>
              <div>
                <p className="uppercase tracking-wider">Scenic</p>
                <p className="text-foreground">{dest.scenicScore != null ? `${dest.scenicScore}/10` : "—"}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <button className="rounded-md bg-forest px-4 py-2 text-xs font-semibold text-off-white hover:bg-forest/90">
            Share this plan
          </button>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Link2 className="h-4 w-4" />
            <Instagram className="h-4 w-4" />
            <Facebook className="h-4 w-4" />
            <Camera className="h-4 w-4" />
            <Mountain className="h-4 w-4" />
          </div>
        </div>
      </section>

      <SectionCard
        title="Similar Destinations"
        eyebrow="More places you'll love."
        right={<Button size="sm" variant="outline">View all destinations</Button>}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((d) => (
            <Link
              key={d.slug}
              to="/destinations/$slug"
              params={{ slug: d.slug }}
              className="group overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={d.heroImage}
                  alt={d.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{d.name.split(" ")[0]}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{d.region}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-foreground/60" />
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================================================
   SHARED
========================================================= */
function SectionCard({
  title,
  eyebrow,
  right,
  children,
}: {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl text-foreground md:text-2xl">{title}</h2>
          {eyebrow && <p className="mt-1 text-xs text-muted-foreground">{eyebrow}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
