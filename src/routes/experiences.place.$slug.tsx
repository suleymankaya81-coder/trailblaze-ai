import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlaceExperiences, tourCategory } from "@/lib/affiliates/viatorPlace.functions";

// Noindexed frame: Viator provider content must stay out of indexable pages.
export const Route = createFileRoute("/experiences/place/$slug")({
  head: () => ({ meta: [
    { title: "Viator Tours Near This Destination — MiniaLife" },
    { name: "description", content: "Current Viator tours and experiences near this MiniaLife destination." },
    { property: "og:title", content: "Viator Tours Near This Destination — MiniaLife" },
    { property: "og:description", content: "Provider-sourced tours near MiniaLife destinations." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow, nosnippet" },
  ] }),
  component: () => { const { slug } = Route.useParams(); return <ClientOnly fallback={null}><Place slug={slug} /></ClientOnly>; },
});

function Place({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { data, isPending } = useQuery({ queryKey: ["viator-place", slug], queryFn: () => getPlaceExperiences({ data: { slug } }), staleTime: 15 * 60 * 1000, retry: false });
  const items = data?.items ?? [];
  useEffect(() => {
    if (isPending || !ref.current) return;
    const send = () => window.parent.postMessage({ type: "viator-place", slug, height: items.length ? ref.current?.scrollHeight ?? 0 : 0 }, window.location.origin);
    send();
    const ro = new ResizeObserver(send);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [isPending, items.length, slug]);
  if (isPending) return <div className="grid gap-4 p-1 sm:grid-cols-3">{[1, 2, 3].map((n) => <div key={n} className="h-80 animate-pulse rounded-lg bg-muted" />)}</div>;
  return <div ref={ref} className="bg-background p-1">
    {items.length > 0 && <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => <article key={item.code} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
          <img src={item.image} alt={item.title} loading="lazy" className="aspect-[3/2] w-full object-cover" />
          <div className="flex flex-1 flex-col p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.category ?? tourCategory(item.title)}</p>
            <h3 className="mt-1 font-display text-base font-semibold leading-snug text-foreground">{item.title}</h3>
            {item.summary && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.summary}</p>}
            {item.rating !== null && item.reviews > 0 && <p className="mt-2 flex items-center gap-1 text-xs text-foreground"><Star className="h-3.5 w-3.5 text-amber" />{item.rating.toFixed(1)} <span className="text-muted-foreground">({item.reviews.toLocaleString("en-US")} reviews)</span></p>}
            <p className="mb-4 mt-2 text-lg font-semibold text-foreground">{item.price !== null ? `From ${new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency }).format(item.price)}` : "Check current price"}</p>
            <Button asChild size="sm" className="mt-auto rounded-lg"><a href={item.url} target="_blank" rel="sponsored nofollow noopener noreferrer">View on Viator<ArrowUpRight /></a></Button>
          </div>
        </article>)}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Photos, prices and ratings supplied by Viator; availability confirmed on Viator. Partner links · MiniaLife may earn a commission.</p>
    </>}
  </div>;
}
