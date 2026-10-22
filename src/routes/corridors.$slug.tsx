import { createFileRoute, Link, notFound, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { CalendarDays, Globe2, MapPin, Plane, Route as RouteIcon, ShieldAlert } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { GuideFaq, GuideHero, GuideSection, HeroChip } from "@/components/guides/GuideSections";
import { Skeleton } from "@/components/ui/skeleton";
import { getLoopStops } from "@/lib/data/guides.functions";
import { SITE } from "@/lib/seo/flyDrive";
import { haversineMiles, suggestedDays } from "@/lib/seo/guides";
import { getCorridor } from "@/lib/seo/corridors";

const RoadTripMap = lazy(() => import("@/components/destination/RoadTripMap"));

export const Route = createFileRoute("/corridors/$slug")({
  loader: async ({ params }) => {
    const corridor = getCorridor(params.slug);
    if (!corridor) throw notFound();
    const stops = await getLoopStops({ data: { slugs: corridor.stops } });
    if (stops.length < 3) throw notFound();
    return { corridor, stops, url: `${SITE}/corridors/${corridor.slug}` };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Unavailable — MiniaLife" }, { name: "robots", content: "noindex" }] };
    const { corridor, url } = loaderData;
    const title = `${corridor.title}: ${corridor.idealDays} Road Trip for International Visitors — MiniaLife`;
    const description = corridor.intro.slice(0, 300);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(corridor.pilot ? [{ name: "robots", content: "noindex" }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: Page,
  notFoundComponent: () => <div className="container-page py-20">This route does not exist.</div>,
});

function Page() {
  const { corridor, stops } = Route.useLoaderData();
  const loop = [...stops, stops[0]];
  const miles = Math.round(loop.slice(1).reduce((m, s, i) => m + haversineMiles([loop[i].lng, loop[i].lat], [s.lng, s.lat]), 0));
  const line = loop.map((s) => [s.lng, s.lat] as [number, number]);
  const markers = stops.slice(1).map((s) => ({ name: s.name, lng: s.lng, lat: s.lat, sourceUrl: `${SITE}/destinations/${s.slug}` }));
  const first = stops[0];
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <GuideHero image={stops[1]?.heroImage ?? first.heroImage} kicker={`International entry route · ${corridor.region}`} title={corridor.title} crumbs={<><Link to="/" className="hover:underline">Home</Link> / <Link to="/road-trips" className="hover:underline">Road trips</Link></>}>
          <HeroChip icon={<Plane className="h-4 w-4" />}>Fly into {corridor.gateway.code}</HeroChip>
          <HeroChip icon={<CalendarDays className="h-4 w-4" />}>{corridor.idealDays}</HeroChip>
          <HeroChip icon={<RouteIcon className="h-4 w-4" />}>~{miles} mi loop (straight-line)</HeroChip>
        </GuideHero>

        <GuideSection title="Who this route is for" intro={corridor.audience}>
          <div className="relative h-[360px] overflow-hidden rounded-3xl border border-border bg-muted">
            <ClientOnly fallback={<Skeleton className="h-full w-full" />}>
              <Suspense fallback={<Skeleton className="h-full w-full" />}>
                <RoadTripMap route={line} from={[first.lng, first.lat]} to={[first.lng, first.lat]} stops={markers} />
              </Suspense>
            </ClientOnly>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{corridor.intro}</p>
        </GuideSection>

        <GuideSection title="Before you fly: essentials for overseas visitors">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {corridor.essentials.map((e) => (
              <div key={e.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <Globe2 className="h-5 w-5 text-forest" />
                <p className="mt-3 font-display text-lg font-semibold text-foreground">{e.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.text}</p>
              </div>
            ))}
          </div>
        </GuideSection>

        <GuideSection title="The loop, stop by stop">
          <ol className="space-y-4">
            {stops.map((s, i) => {
              const leg = i > 0 ? Math.round(haversineMiles([stops[i - 1].lng, stops[i - 1].lat], [s.lng, s.lat])) : null;
              const d = suggestedDays(s.tripDurationDays);
              return (
                <li key={s.slug}>
                  {leg != null && <p className="mb-2 ml-6 flex items-center gap-2 text-xs text-muted-foreground"><RouteIcon className="h-3.5 w-3.5" /> ~{leg} mi straight-line from {stops[i - 1].name}</p>}
                  <Link to="/destinations/$slug" params={{ slug: s.slug }} className="group grid grid-cols-[96px_minmax(0,1fr)] gap-4 overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-soft transition hover:shadow-lg sm:grid-cols-[160px_minmax(0,1fr)]">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted sm:aspect-[4/3]">
                      {s.heroImage && <img src={s.heroImage} alt={s.name} loading="lazy" className="h-full w-full object-cover" />}
                      <span className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-card/90 font-display text-sm font-bold text-forest">{i + 1}</span>
                    </div>
                    <div className="py-1">
                      <p className="font-display text-lg font-semibold text-foreground group-hover:underline">{s.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Suggested: {d} day{d > 1 ? "s" : ""}</p>
                      {(s.permitLevel === "high" || s.permitLevel === "moderate") && s.permitHeadline && (
                        <p className="mt-2 inline-flex items-start gap-1.5 text-xs text-copper"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />{s.permitHeadline}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
            <li className="ml-6 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> Return to {first.name} and drop the car at {corridor.gateway.code}.</li>
          </ol>
        </GuideSection>

        <GuideSection title="Quick answers"><GuideFaq faqs={corridor.faqs} /></GuideSection>
      </main>
      <Footer />
    </div>
  );
}
