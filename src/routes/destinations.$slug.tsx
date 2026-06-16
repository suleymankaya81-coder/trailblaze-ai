import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useServerFn } from "@tanstack/react-query";
import { useServerFn as useSF } from "@tanstack/react-start";
import {
  ArrowRight,
  Calendar,
  Cloud,
  Compass,
  Dog,
  Download,
  DollarSign,
  Heart,
  PawPrint,
  Shield,
  Signal,
  Sparkles,
  Star,
  Sun,
  Tent,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDestination, destinations } from "@/data/destinations";
import { enrichDestination, type EnrichResult } from "@/lib/ai/enrich.functions";

export const Route = createFileRoute("/destinations/$slug")({
  loader: ({ params }) => {
    const dest = getDestination(params.slug);
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
  const { dest } = Route.useLoaderData();
  const enrich = useSF(enrichDestination);

  const { data: ai, isLoading: aiLoading } = useQuery({
    queryKey: ["enrich", dest.slug],
    queryFn: () => enrich({ data: { slug: dest.slug } }),
    staleTime: Infinity,
  });

  return (
    <div className="bg-background">
      <Header />

      {/* HERO */}
      <section className="relative min-h-[88vh]">
        <img
          src={dest.heroImage}
          alt={dest.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/20 to-background" />
        <div className="container-page relative z-10 flex min-h-[88vh] flex-col justify-end pt-32 pb-16">
          <p className="text-xs uppercase tracking-[0.22em] text-off-white/80">{dest.region}</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[1.05] text-off-white md:text-7xl">
            {dest.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base text-off-white/90 md:text-lg">{dest.tagline}</p>

          {/* AI summary */}
          <div className="mt-8 max-w-3xl rounded-3xl border border-off-white/20 bg-background/80 p-6 shadow-lift backdrop-blur">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sage-deep">
              <Sparkles className="h-3.5 w-3.5" /> Trip summary
            </div>
            {aiLoading || !ai ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-9/12" />
              </div>
            ) : (
              <p className="mt-3 text-foreground/90">{ai.summary}</p>
            )}
          </div>

          {/* quick stats */}
          <div className="mt-8 grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-5">
            <StatChip icon={<Sun className="h-4 w-4" />} label="Best season" value={dest.bestSeason} />
            <StatChip icon={<Star className="h-4 w-4" />} label="Scenic" value={`${dest.scenicScore}/10`} />
            <StatChip icon={<Tent className="h-4 w-4" />} label="Camping" value={`${dest.campingScore}/10`} />
            <StatChip icon={<DollarSign className="h-4 w-4" />} label="Budget" value={`$${dest.avgDailyBudget}/day`} />
            <StatChip icon={<Calendar className="h-4 w-4" />} label="Duration" value={dest.tripDurationDays} />
          </div>
        </div>
      </section>

      {/* TOP STAYS */}
      <Section eyebrow="Top stays" title="Where to sleep under the stars.">
        <StaysGrid dest={dest} />
      </Section>

      {/* RENTALS */}
      <Section eyebrow="Rent before you go" title="The right rig for the right trip." bg="beige">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {dest.rentals.map((r) => (
            <article
              key={r.id}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <img
                  src={r.image}
                  alt={r.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs text-foreground backdrop-blur">
                  {r.type}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg text-foreground">{r.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.blurb}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">${r.pricePerDay}/day</span>
                  <Button size="sm" variant="sage">
                    Reserve
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* THINGS TO DO */}
      <Section eyebrow="Things to do" title="The moments you came for.">
        <div className="grid gap-5 md:grid-cols-3">
          {dest.activities.map((a) => (
            <article
              key={a.id}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={a.image}
                  alt={a.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="text-xs text-sage-deep">{a.duration}</p>
                <h3 className="mt-1 font-display text-lg text-foreground">{a.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.blurb}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* AI INSIGHTS */}
      <Section eyebrow="Destination insights" title="What it's really like to be there." bg="beige">
        <InsightsGrid ai={ai} loading={aiLoading} />
      </Section>

      {/* PACKING */}
      <Section eyebrow="Packing checklist" title="Bring exactly what you'll use.">
        <PackingChecklist dest={dest.name} ai={ai} loading={aiLoading} />
      </Section>

      {/* BUDGET */}
      <Section eyebrow="Trip budget" title="A realistic look at the numbers." bg="beige">
        <BudgetSection ai={ai} loading={aiLoading} />
      </Section>

      {/* ESSENTIALS */}
      <Section eyebrow="Essentials" title="Five things worth packing.">
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          {dest.essentials.map((e) => (
            <article
              key={e.id}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
            >
              <div className="relative aspect-square overflow-hidden">
                <img src={e.image} alt={e.name} className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-base text-foreground">{e.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{e.blurb}</p>
                <p className="mt-3 text-sm font-medium text-foreground">${e.price}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* SIMILAR */}
      <Section eyebrow="Similar destinations" title="More places worth the drive." bg="beige">
        <div className="grid gap-5 md:grid-cols-3">
          {dest.similar
            .map((s) => getDestination(s))
            .filter((d): d is NonNullable<typeof d> => Boolean(d))
            .map((d) => (
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
                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs text-muted-foreground">{d.region}</p>
                    <h3 className="mt-1 font-display text-lg text-foreground">{d.name}</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground/70" />
                </div>
              </Link>
            ))}
        </div>
      </Section>

      <Footer />
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
  bg = "background",
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  bg?: "background" | "beige";
}) {
  return (
    <section className={(bg === "beige" ? "bg-beige/40" : "bg-background") + " py-24"}>
      <div className="container-page">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">{eyebrow}</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl text-foreground md:text-4xl">
              {title}
            </h2>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-off-white/20 bg-background/85 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function StaysGrid({ dest }: { dest: ReturnType<typeof getDestination> & {} }) {
  const cats = useMemo(() => Array.from(new Set(dest!.stays.map((s) => s.category))), [dest]);
  const [tab, setTab] = useState<string>("All");
  const filtered = tab === "All" ? dest!.stays : dest!.stays.filter((s) => s.category === tab);
  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {["All", ...cats].map((c) => (
          <button
            key={c}
            onClick={() => setTab(c)}
            className={
              "rounded-full px-4 py-2 text-xs transition " +
              (tab === c
                ? "bg-forest text-off-white"
                : "border border-border bg-background text-foreground/80 hover:bg-muted")
            }
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <article
            key={s.id}
            className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
          >
            <div className="relative aspect-[5/4] overflow-hidden">
              <img
                src={s.image}
                alt={s.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs text-foreground backdrop-blur">
                {s.category}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-display text-lg text-foreground">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              <p className="mt-3 rounded-2xl bg-sage/20 p-3 text-xs text-foreground">
                <span className="font-medium text-sage-deep">Why we recommend it. </span>
                {s.why}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  ${s.pricePerNight}
                  <span className="text-xs text-muted-foreground"> / night</span>
                </span>
                <Button size="sm" variant="hero">
                  Book
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function InsightsGrid({ ai, loading }: { ai?: EnrichResult; loading: boolean }) {
  const rows: { icon: React.ReactNode; label: string; key: keyof EnrichResult["insights"] }[] = [
    { icon: <Sun className="h-4 w-4" />, label: "Best time to visit", key: "bestTimeToVisit" },
    { icon: <Cloud className="h-4 w-4" />, label: "Weather", key: "weather" },
    { icon: <Users className="h-4 w-4" />, label: "Crowd levels", key: "crowdLevels" },
    { icon: <PawPrint className="h-4 w-4" />, label: "Wildlife", key: "wildlife" },
    { icon: <Signal className="h-4 w-4" />, label: "Cell coverage", key: "cellCoverage" },
    { icon: <Shield className="h-4 w-4" />, label: "Safety", key: "safety" },
    { icon: <Heart className="h-4 w-4" />, label: "Family friendly", key: "familyFriendly" },
    { icon: <Dog className="h-4 w-4" />, label: "Pet friendly", key: "petFriendly" },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {rows.map((r) => (
        <div key={r.label} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sage-deep">
            {r.icon}
            <span className="text-xs uppercase tracking-[0.16em]">{r.label}</span>
          </div>
          {loading || !ai ? (
            <div className="mt-3 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-9/12" />
            </div>
          ) : (
            <p className="mt-3 text-sm text-foreground/90">{ai.insights[r.key]}</p>
          )}
        </div>
      ))}
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

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button variant="outline" size="sm" onClick={download} disabled={!ai}>
          <Download className="h-4 w-4" /> Download list
        </Button>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-lg capitalize text-foreground">{g}</h3>
            {loading || !ai ? (
              <div className="mt-4 space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-3 w-full" />
                ))}
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {ai.packing[g].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
                    <span className="mt-1 h-4 w-4 rounded-md border border-border" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function BudgetSection({ ai, loading }: { ai?: EnrichResult; loading: boolean }) {
  if (loading || !ai) {
    return (
      <div className="grid gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-2xl" />
        ))}
      </div>
    );
  }
  const items: { label: string; value: number }[] = [
    { label: "Accommodation", value: ai.budget.accommodation },
    { label: "Activities", value: ai.budget.activities },
    { label: "Food", value: ai.budget.food },
    { label: "Fuel", value: ai.budget.fuel },
    { label: "Rental", value: ai.budget.rental },
    { label: "Equipment", value: ai.budget.equipment },
  ];
  const total = items.reduce((s, i) => s + i.value, 0);
  const max = Math.max(...items.map((i) => i.value));
  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-sage-deep">Estimated total</p>
          <p className="mt-1 font-display text-4xl text-foreground">
            ${total.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">4-day trip · 2 travelers</p>
        </div>
        <Compass className="h-8 w-8 text-sage-deep" />
      </div>
      <div className="mt-8 space-y-4">
        {items.map((i) => (
          <div key={i.label}>
            <div className="flex justify-between text-sm">
              <span className="text-foreground/80">{i.label}</span>
              <span className="font-medium text-foreground">${i.value.toLocaleString()}</span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-beige">
              <div
                className="h-2 rounded-full bg-sage-deep"
                style={{ width: `${(i.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">{ai.budget.note}</p>
    </div>
  );
}
