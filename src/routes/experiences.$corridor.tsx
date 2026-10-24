import { ClientOnly, createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCorridorExperiences } from "@/lib/affiliates/corridorExperiences.functions";
import { getCorridor } from "@/lib/seo/corridors";
import { useEffect, useRef } from "react";
import { SwipeRow } from "@/components/ui-kit";
import { SafeImage } from "@/components/shared/SafeImage";
import { hasViatorRating } from "@/lib/affiliates/viatorDisplay";

// An independently noindexed document keeps restricted provider content out of the original guide's indexable body.
export const Route = createFileRoute("/experiences/$corridor")({
  beforeLoad: ({ params }) => { const c = getCorridor(params.corridor); if (!c || c.pilot) throw notFound(); },
  head: () => ({ meta: [
    { title: "Gateway Road Trip Viator Experiences — MiniaLife" },
    { name: "description", content: "Current Viator experiences along this gateway road trip, with provider photos and booking links." },
    { property: "og:title", content: "Gateway Road Trip Viator Experiences — MiniaLife" },
    { property: "og:description", content: "Provider-sourced tours along MiniaLife gateway road trips." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow, nosnippet" },
  ] }),
  component: () => { const { corridor } = Route.useParams(); return <ClientOnly fallback={<Loading />}><Experiences slug={corridor} /></ClientOnly>; },
});

function Loading() { return <div className="grid gap-4 p-1 sm:grid-cols-3" aria-label="Loading experiences">{[1, 2, 3].map((n) => <div key={n} className="h-[460px] animate-pulse rounded-lg bg-muted" />)}</div>; }

function Experiences({ slug }: { slug: string }) {
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ["corridor-viator", slug], queryFn: () => getCorridorExperiences({ data: { slug } }), staleTime: 15 * 60 * 1000, retry: false });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const send = () => window.parent.postMessage({ type: "viator-corridor", slug, height: ref.current?.scrollHeight ?? 0 }, window.location.origin);
    const observer = new ResizeObserver(send);
    observer.observe(ref.current);
    send();
    return () => observer.disconnect();
  }, [slug, isPending, isError, data]);
  if (isPending) return <Loading />;
  if (isError || !data?.items.length) return <div className="p-5 text-sm text-muted-foreground"><p>Viator experiences are temporarily unavailable.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Try again</Button></div>;
  return <div ref={ref} className="bg-background p-1">
    <SwipeRow className="md:grid-cols-3">
      {data.items.map((item) => <article key={item.code} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
        <SafeImage src={item.image} alt={item.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        <div className="flex flex-1 flex-col p-4">
          <p className="text-[10px] uppercase text-muted-foreground">{item.stop}</p>
          <h3 className="mt-2 font-display text-base font-semibold leading-snug text-foreground">{item.title}</h3>
          {hasViatorRating(item.rating, item.reviews) && <p className="mt-3 flex items-center gap-1 text-xs text-foreground"><Star className="h-3.5 w-3.5 text-amber" />{item.rating.toFixed(1)} <span className="text-muted-foreground">({item.reviews.toLocaleString("en-US")} reviews · Viator / Tripadvisor)</span></p>}
          <p className="mt-3 text-lg font-semibold text-foreground">{item.price !== null ? `From ${new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency }).format(item.price)}` : "Check current price"}</p>
          <p className="mb-4 mt-1 text-[11px] text-muted-foreground">Starting price; check your dates and options on Viator.</p>
          <Button asChild size="sm" className="mt-auto min-h-12 rounded-lg"><a href={item.url} target="_blank" rel="sponsored nofollow noopener noreferrer">View on Viator<ArrowUpRight /></a></Button>
        </div>
      </article>)}
    </SwipeRow>
    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Photos, prices and ratings supplied by Viator. Availability is confirmed on Viator. Partner links · MiniaLife may earn a commission.{slug === "grand-circle-from-las-vegas" && " The helicopter tour visits Grand Canyon West, not the national park’s South Rim; plan it from Las Vegas."}</p>
  </div>;
}