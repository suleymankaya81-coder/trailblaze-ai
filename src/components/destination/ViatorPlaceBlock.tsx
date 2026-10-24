import { useEffect, useRef, useState } from "react";

/** Live Viator tours for a destination, loaded in a noindexed frame that reports its height (hidden when empty). */
export function ViatorPlaceBlock({ slug, name, className = "", anchored = true }: { slug: string; name: string; className?: string; anchored?: boolean }) {
  const [height, setHeight] = useState<number | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow || e.data?.type !== "viator-place" || e.data.slug !== slug) return;
      setHeight(Number(e.data.height) || 0);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [slug]);
  if (height === 0) return null;
  return (
    <section id={anchored ? "trip-tours" : undefined} className={className} aria-label={`Tours near ${name}`}>
      <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Partner listings · Viator</p>
      <h3 className="mb-2 font-display text-xl font-semibold text-foreground">Tours & experiences near {name}</h3>
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">Guided activities around {name}: guided hikes, scenic drives and day trips, water activities, wildlife and photography tours, and scenic flights where available. Each card shows the tour type and a short summary; prices and availability are confirmed on Viator.</p>
      <iframe ref={frame} src={`/experiences/place/${slug}`} title={`Viator tours near ${name}`} loading="lazy" style={{ height: height ?? 360 }} className="w-full border-0 bg-background" />
    </section>
  );
}
