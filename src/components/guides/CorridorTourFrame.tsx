import { useEffect, useRef, useState } from "react";

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
      const next = Number(event.data.height);
      if (Number.isFinite(next) && next > 0) setHeight(next);
    };
    window.addEventListener("message", receive);
    return () => { window.clearInterval(timer); window.removeEventListener("message", receive); };
  }, [slug]);
  return <iframe ref={frame} src={`/experiences/${slug}`} title={`Viator experiences along the ${title}`} loading="lazy" style={{ height }} className="w-full border-0 bg-background" />;
}