import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { CalendarDays, MapPin, Route as RouteIcon, ShieldAlert } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { GuideFaq, GuideHero, GuideSection, HeroChip } from "@/components/guides/GuideSections";
import { Skeleton } from "@/components/ui/skeleton";
import { getLoopStops } from "@/lib/data/guides.functions";
import { SITE } from "@/lib/seo/flyDrive";
import { CorridorBookings } from "@/components/guides/CorridorBookings";
import { ViatorPlaceBlock } from "@/components/destination/ViatorPlaceBlock";
import { getLoop, loopGatewayAirport, haversineMiles, jsonLdScript, loopFaqs, loopJsonLd, suggestedDays, validateLoop } from "@/lib/seo/guides";

const RoadTripMap = lazy(() => import("@/components/destination/RoadTripMap"));

export const Route = createFileRoute("/road-trips/$slug")({
  loader: async ({ params }) => {
    const loop = getLoop(params.slug);
    if (!loop) throw notFound();
    const stops = await getLoopStops({ data: { slugs: loop.stops } });
    if (stops.length !== loop.stops.length || !validateLoop(stops)) throw notFound();
    return { loop, stops, faqs: loopFaqs(loop, stops), url: `${SITE}/road-trips/${loop.slug}` };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Unavailable — MiniaLife" }, { name: "robots", content: "noindex" }] };
    const { loop, stops, faqs, url } = loaderData;
    const title = `${loop.title}: ${stops.length} Stops, Days & Route — MiniaLife`;
    const description = `${loop.intro} Suggested days per stop, leg distances and booking notes.`.slice(0, 300);
    const img = stops[0]?.heroImage.startsWith("https://") ? stops[0].heroImage : null;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: jsonLdScript(loopJsonLd(loop, stops, faqs, url)) }],
    };
  },
  component: Page,
  errorComponent: () => <div className="container-page py-20">This road trip could not load. Please try again.</div>,
  notFoundComponent: () => <div className="container-page py-20">This road trip does not exist.</div>,
});

function Page() {
  const { loop, stops, faqs } = Route.useLoaderData();
  const totalDays = stops.reduce((s, x) => s + suggestedDays(x.tripDurationDays), 0);
  const line = stops.map((s) => [s.lng, s.lat] as [number, number]);
  const markers = stops.slice(1, -1).map((s) => ({ name: s.name, lng: s.lng, lat: s.lat, sourceUrl: `${SITE}/destinations/${s.slug}` }));
  const first = stops[0];
  const last = stops[stops.length - 1];
  const gateway = loopGatewayAirport(stops);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <GuideHero image={first.heroImage} kicker={`Road trip · ${loop.region}`} title={loop.title} crumbs={<><Link to="/" className="hover:underline">Home</Link> / <Link to="/road-trips" className="hover:underline">Road trips</Link></>}>
          <HeroChip icon={<MapPin className="h-4 w-4" />}>{stops.length} stops</HeroChip>
          <HeroChip icon={<CalendarDays className="h-4 w-4" />}>About {totalDays} days</HeroChip>
        </GuideHero>

        <GuideSection title="The loop" intro={loop.intro}>
          <div className="relative h-[340px] overflow-hidden rounded-3xl border border-border bg-muted">
            <ClientOnly fallback={<Skeleton className="h-full w-full" />}>
              <Suspense fallback={<Skeleton className="h-full w-full" />}>
                <RoadTripMap route={line} from={[first.lng, first.lat]} to={[last.lng, last.lat]} stops={markers} />
              </Suspense>
            </ClientOnly>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Overview line between stops, not turn-by-turn directions.</p>
        </GuideSection>

        {gateway && (
          <GuideSection title={`Book this loop from ${gateway.code}`} intro={`Fly into ${gateway.name}, pick up your car or RV, then drive the loop.`}>
            <CorridorBookings slug={loop.slug} airport={gateway.code} city={gateway.name} />
          </GuideSection>
        )}

        <GuideSection title="Stop by stop">
          <ol className="space-y-4">
            {stops.map((s, i) => {
              const leg = i > 0 ? Math.round(haversineMiles([stops[i - 1].lng, stops[i - 1].lat], [s.lng, s.lat])) : null;
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
                      <p className="mt-1 text-sm text-muted-foreground">Suggested: {suggestedDays(s.tripDurationDays)} day{suggestedDays(s.tripDurationDays) > 1 ? "s" : ""}{s.tripDurationDays ? ` (full guide: ${s.tripDurationDays})` : ""}</p>
                      {(s.permitLevel === "high" || s.permitLevel === "moderate") && s.permitHeadline && (
                        <p className="mt-2 inline-flex items-start gap-1.5 text-xs text-copper"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />{s.permitHeadline}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </GuideSection>

        <section className="container-page pb-6"><ViatorPlaceBlock slug={first.slug} name={first.name} /></section>

        <GuideSection title="Quick answers"><GuideFaq faqs={faqs} /></GuideSection>
      </main>
      <Footer />
    </div>
  );
}
