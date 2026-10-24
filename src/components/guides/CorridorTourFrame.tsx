import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { validViatorHeight } from "@/lib/affiliates/viatorDisplay";

export function CorridorTourFrame({ slug, title }: { slug: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(650);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const body = frame.current?.contentDocument?.body;
      if (body) setHeight(Math.max(100, Math.ceil(body.getBoundingClientRect().height)));
    }, 1000);
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.type !== "viator-corridor" || event.data.slug !== slug) return;
      const next = validViatorHeight(event.data.height);
      if (next !== null) setHeight(next);
    };
    window.addEventListener("message", receive);
    return () => { window.clearInterval(timer); window.removeEventListener("message", receive); };
  }, [slug]);
  return <div><iframe ref={frame} src={`/experiences/${slug}`} title={`Viator experiences along the ${title}`} loading="lazy" style={{ height }} className="w-full border-0 bg-background" /><Button asChild variant="outline" className="mt-3 min-h-12"><a href={`/experiences/${slug}`} target="_blank" rel="nofollow noopener noreferrer">Open tour listings separately</a></Button></div>;
}