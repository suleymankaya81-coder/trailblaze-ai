import { useEffect, useRef, useState } from "react";
import { Car, Truck } from "lucide-react";
import { motorhomeRepublicLink, airportRentalsLink } from "@/lib/affiliates/webjet";

const TABS = {
  rv: { label: "RV & Campervan", icon: Truck, brand: "Motorhome Republic", host: "www.motorhomerepublic.com", extra: "&country=", fallback: motorhomeRepublicLink(), blurb: "Compare motorhomes and campervans from professional rental fleets across the USA." },
  car: { label: "Car Rental", icon: Car, brand: "Airport Rentals", host: "www.airportrentals.com", extra: "", fallback: airportRentalsLink(), blurb: "Compare airport car rentals and return to the same airport to avoid one-way fees." },
} as const;
type Tab = keyof typeof TABS;

/** Live Webjet search forms (affiliate=minialife), loaded only when the section scrolls into view. */
export function RentalSearch() {
  const [tab, setTab] = useState<Tab>("rv");
  const [visible, setVisible] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrap.current) return;
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { setVisible(true); io.disconnect(); } }, { rootMargin: "300px" });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = `VehicleSearchForm-${tab}`;
    const el = document.getElementById(id);
    if (!el || el.dataset.loaded) return;
    el.dataset.loaded = "1";
    const t = TABS[tab];
    const s = document.createElement("script");
    s.src = `https://${t.host}/widget/searchform.js?element_id=${id}&affiliate=minialife&target=_blank&pickup_country=US&pickup_location=&dropoff_location=${t.extra}&language=en`;
    s.async = true;
    document.body.appendChild(s);
  }, [visible, tab]);

  return (
    <div ref={wrap} className="mb-5 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="flex border-b border-border">
        {(Object.keys(TABS) as Tab[]).map((k) => {
          const T = TABS[k];
          return (
            <button key={k} type="button" onClick={() => setTab(k)} aria-pressed={tab === k}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition ${tab === k ? "bg-forest text-off-white" : "text-foreground hover:bg-beige"}`}>
              <T.icon className="h-4 w-4" />{T.label}
            </button>
          );
        })}
      </div>
      <div className="p-6 md:p-8">
        {(Object.keys(TABS) as Tab[]).map((k) => (
          <div key={k} hidden={tab !== k}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">Live search · {TABS[k].brand}</p>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{TABS[k].blurb}</p>
            <div id={`VehicleSearchForm-${k}`} className="webjet-form mt-5 min-h-[180px] w-full" />
            <a href={TABS[k].fallback} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-3 inline-block text-xs text-muted-foreground underline">
              Form not loading? Search on {TABS[k].brand}
            </a>
          </div>
        ))}
        <p className="mt-4 text-[11px] text-muted-foreground">Partner links · MiniaLife may earn a commission. Prices and availability are confirmed on the partner site.</p>
      </div>
    </div>
  );
}
