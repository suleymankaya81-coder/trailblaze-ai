import { useEffect, useRef, useState } from "react";

// GetYourGuide partner ID (public, issued on approval). Empty = no widget,
// the tours section keeps its link cards only.
const GYG_PARTNER_ID = import.meta.env.VITE_GYG_PARTNER_ID as string | undefined;
const GYG_SCRIPT = "https://widget.getyourguide.com/dist/pa.umd.production.min.js";

export function GetYourGuideWidget({ query }: { query: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!GYG_PARTNER_ID || !ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || document.querySelector(`script[src="${GYG_SCRIPT}"]`)) return;
    const s = document.createElement("script");
    s.src = GYG_SCRIPT;
    s.async = true;
    s.dataset.gygPartnerId = GYG_PARTNER_ID;
    document.body.appendChild(s);
  }, [visible]);

  if (!GYG_PARTNER_ID) return null;
  return (
    <div ref={ref} className="mt-6">
      {visible && (
        <div
          data-gyg-widget="auto"
          data-gyg-partner-id={GYG_PARTNER_ID}
          data-gyg-q={query}
          data-gyg-number-of-items="4"
        />
      )}
    </div>
  );
}
