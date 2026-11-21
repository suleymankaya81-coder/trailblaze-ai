import { T } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";
import { validViatorHeight } from "@/lib/affiliates/viatorDisplay";
import { Button } from "@/components/ui/button";

/** Live Viator tours for a destination, loaded in a noindexed frame that reports its height (hidden when empty). */
export function ViatorPlaceBlock({ slug, name, className = "", anchored = true }: { slug: string; name: string; className?: string; anchored?: boolean }) {
  const [height, setHeight] = useState<number | null>(null);
  const [status, setStatus] = useState("loading");
  const frame = useRef<HTMLIFrameElement>(null);
  const requestMeasurement = () => frame.current?.contentWindow?.postMessage({ type: "viator-place-measure", slug }, window.location.origin);
  useEffect(() => {
    setHeight(null);
    setStatus("loading");
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow || e.data?.type !== "viator-place" || e.data.slug !== slug) return;
      const next = validViatorHeight(e.data.height);
      if (next === null || !["loading", "error", "empty", "results"].includes(e.data.status)) return;
      setHeight(next);
      setStatus(e.data.status);
    };
    window.addEventListener("message", onMsg);
    requestMeasurement();
    return () => { window.removeEventListener("message", onMsg); };
  }, [slug]);
  return (
    <section id={anchored ? "trip-tours" : undefined} className={className} aria-label={`Tours near ${name}`}>
      <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Viator</p>
      <h3 className="mb-2 font-display text-xl font-semibold text-foreground">Tours & experiences near {name}</h3>
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground"><T>{status === "empty" ? `No matching Viator tours are currently listed for ${name}.` : status === "error" ? "Viator listings are temporarily unavailable. Retry below or open the listings separately." : `Explore guided activities around ${name}. Check the meeting point, dates and availability on Viator before booking.`}</T></p>
      <iframe ref={frame} onLoad={requestMeasurement} src={`/experiences/place/${slug}`} title={`Viator tours near ${name}`} loading="lazy" style={{ height: height ?? 360 }} className="w-full border-0 bg-background" />
      {status !== "empty" && <Button asChild variant="outline" className="mt-3 min-h-12"><a href={`/experiences/place/${slug}`} target="_blank" rel="nofollow noopener noreferrer"><T>Open tour listings separately</T></a></Button>}
    </section>
  );
}
