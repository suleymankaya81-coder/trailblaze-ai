import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlaceExperiences, tourCategory } from "@/lib/affiliates/viatorPlace.functions";
import { SafeImage } from "@/components/shared/SafeImage";
import { hasViatorRating } from "@/lib/affiliates/viatorDisplay";

/** Iconic places whose top real Viator listing is shown on the homepage. */
export const HOME_TOUR_PLACES = [
  { slug: "grand-canyon", name: "Grand Canyon" },
  { slug: "yellowstone", name: "Yellowstone" },
  { slug: "antelope-canyon", name: "Antelope Canyon" },
  { slug: "yosemite", name: "Yosemite" },
  { slug: "zion", name: "Zion" },
  { slug: "arches", name: "Arches" },
];

// Noindexed frame: Viator provider content must stay out of indexable pages.
export const Route = createFileRoute("/experiences/home")({
  head: () => ({ meta: [
    { title: "Top Viator Experiences — MiniaLife" },
    { name: "description", content: "Current top Viator experiences at iconic MiniaLife destinations." },
    { property: "og:title", content: "Top Viator Experiences — MiniaLife" },
    { property: "og:description", content: "Provider-sourced bucket-list experiences." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow, nosnippet" },
  ] }),
  component: () => <ClientOnly fallback={null}><HomeTours /></ClientOnly>,
});

function HomeTours() {
  const ref = useRef<HTMLDivElement>(null);
  const results = useQueries({ queries: HOME_TOUR_PLACES.map((p) => ({ queryKey: ["viator-place", p.slug], queryFn: () => getPlaceExperiences({ data: { slug: p.slug } }), staleTime: 15 * 60 * 1000, retry: false })) });
  const pending = results.some((r) => r.isPending);
  // One photo-led listing per place, first four places with results.
  const items = HOME_TOUR_PLACES.flatMap((p, i) => {
    const item = (results[i].data?.items ?? []).find((x) => Boolean(x.image));
    return item ? [{ place: p.name, item }] : [];
  }).slice(0, 4);
  useEffect(() => {
    const status = pending ? "loading" : items.length ? "results" : "empty";
    const send = () => window.parent.postMessage({ type: "viator-home", status, height: status === "empty" ? 0 : ref.current?.scrollHeight ?? 120 }, window.location.origin);
    send();
    if (!ref.current) return;
    const ro = new ResizeObserver(send);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [pending, items.length]);
  if (pending) return <div className="grid grid-cols-2 gap-4 p-1 lg:grid-cols-4">{[1, 2, 3, 4].map((n) => <div key={n} className="h-80 animate-pulse rounded-xl bg-muted" />)}</div>;
  return <div ref={ref} className="bg-background p-1">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ place, item }) => <article key={item.code} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative">
          <SafeImage src={item.image} alt={item.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground">{place}</span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.category ?? tourCategory(item.title)}</p>
          <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold leading-snug text-foreground">{item.title}</h3>
          {hasViatorRating(item.rating, item.reviews) && <p className="mt-2 flex items-center gap-1 text-xs text-foreground"><Star className="h-3.5 w-3.5 text-amber" />{item.rating.toFixed(1)} <span className="text-muted-foreground">({item.reviews.toLocaleString("en-US")} reviews)</span></p>}
          {item.freeCancellation && <p className="mt-2 text-[11px] font-medium text-foreground">✓ Free cancellation</p>}
          <p className="mb-4 mt-2 text-lg font-semibold text-foreground">{item.price !== null ? `From ${new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency }).format(item.price)}` : "Check current price"}</p>
          <Button asChild size="sm" className="mt-auto min-h-12 rounded-full"><a href={item.url} target="_blank" rel="sponsored nofollow noopener noreferrer">View on Viator<ArrowUpRight /></a></Button>
        </div>
      </article>)}
    </div>
    <p className="mt-3 text-[11px] text-muted-foreground">Photos, prices and ratings supplied by Viator.</p>
  </div>;
}
