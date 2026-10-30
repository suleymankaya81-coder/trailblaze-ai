import { useEffect, useRef, useState } from "react";
import { validViatorHeight } from "@/lib/affiliates/viatorDisplay";
import { SectionHead } from "@/components/ui-kit";

/** Homepage "Top bucket-list experiences": four real Viator listings in a noindexed frame; hidden when empty. */
export function HomeExperiences() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow || e.data?.type !== "viator-home") return;
      const next = validViatorHeight(e.data.height);
      if (next === null) return;
      setHeight(next);
      setStatus(e.data.status);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  if (status === "empty") return null;
  return (
    <section className="section-y" aria-label="Top bucket-list experiences">
      <div className="container-page">
        <SectionHead kicker="Viator experiences" title="Top bucket-list experiences" />
        <p className="-mt-2 mb-5 max-w-2xl text-sm text-muted-foreground">Guided tours travelers book most at America's icons. Check dates and meeting points on Viator.</p>
        <iframe ref={frame} src="/experiences/home" title="Top Viator experiences" loading="lazy" style={{ height: height ?? 460 }} className="w-full border-0 bg-background" />
      </div>
    </section>
  );
}
