import { T } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Car, Caravan, Compass, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { corridorPartnerLinks } from "@/lib/affiliates/corridorPartners";
import { estimatedFrom } from "@/lib/data/servicePhotos";
import { isMhrBlackFridayLive } from "@/lib/affiliates/mhrBlackFriday";
import { validViatorHeight } from "@/lib/affiliates/viatorDisplay";
import bfArt from "@/assets/rv_black_friday_2026.png.asset.json";

/** First-screen two-up showcase: vehicles & RVs (left) and the top real Viator tour for this place (right). */
export function TopShowcase({ slug, name, airportCode, vehicleNote }: { slug: string; name: string; airportCode: string | null; vehicleNote?: string | null }) {
  return (
    <section id="trip-vehicles" aria-label={`Vehicles and tours for ${name}`} className="scroll-mt-40 grid gap-5 md:grid-cols-2 md:items-stretch">
      {isMhrBlackFridayLive() ? <BlackFridayShowcase slug={slug} /> : <VehicleShowcase slug={slug} airportCode={airportCode} vehicleNote={vehicleNote} />}
      <TourShowcase slug={slug} name={name} />
    </section>
  );
}

/** During the MHR Black Friday window the vehicle card is replaced by the campaign visual alone. */
function BlackFridayShowcase({ slug }: { slug: string }) {
  const l = corridorPartnerLinks(slug);
  return (
    <a href={l.motorhome} target="_blank" rel="sponsored nofollow noopener noreferrer" className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <img src={bfArt.url} alt="Black Friday sale: save up to 35% off motorhome rentals" loading="lazy" className="w-full object-contain" />
      <span className="block bg-secondary px-4 py-3 text-xs text-muted-foreground"><T>Black Friday · ends 2 Dec — Cruise America & Cruise Canada up to 35% off. Selected dates & T&Cs apply.</T></span>
    </a>
  );
}

function VehicleShowcase({ slug, airportCode, vehicleNote }: { slug: string; airportCode: string | null; vehicleNote?: string | null }) {
  const l = corridorPartnerLinks(slug);
  const rows = [
    { icon: Car, label: "Standard car", price: estimatedFrom("standard car"), brand: "Airport Rentals", href: l.car },
    { icon: Truck, label: "SUV", price: estimatedFrom("suv"), brand: "Airport Rentals", href: l.car },
    { icon: Caravan, label: "RV / motorhome", price: estimatedFrom("rv"), brand: "Motorhome Republic", href: l.motorhome },
  ];
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-deep"><T>Vehicle & RV</T></p>
      <h2 className="mt-1 font-display text-2xl leading-tight text-foreground"><T>{airportCode ? `Pick up at ${airportCode} airport` : "Choose your vehicle"}</T></h2>
      <ul className="mt-4 divide-y divide-border">
        {rows.map((r) => (
          <li key={r.label}>
            <a href={r.href} target="_blank" rel="sponsored nofollow noopener noreferrer" className="flex min-h-14 items-center gap-3 py-3 transition hover:text-primary">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground"><r.icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground"><T>{r.label}</T></span>
                <span className="block text-xs text-muted-foreground">{r.brand}{r.brand === "Motorhome Republic" && isMhrBlackFridayLive() && <span className="ml-2 rounded-sm bg-accent px-1.5 py-0.5 font-semibold text-accent-foreground"><T>Black Friday: up to 35% off</T></span>}</span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-semibold text-foreground"><T>{r.price}</T></span>
                <span className="block text-[10px] text-muted-foreground"><T>typical rate</T></span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/40" />
            </a>
          </li>
        ))}
      </ul>
      {vehicleNote && <div className="mt-4 rounded-lg bg-secondary/60 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-deep"><T>Which vehicle?</T></p><p className="mt-1 text-sm leading-relaxed text-foreground"><T>{vehicleNote}</T></p></div>}
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Button asChild className="min-h-12 flex-1"><a href={l.car} target="_blank" rel="sponsored nofollow noopener noreferrer"><T>See vehicles & prices</T><ArrowUpRight /></a></Button>
        <Button asChild variant="outline" className="min-h-12"><a href="#rentals"><T>All vehicle options</T></a></Button>
      </div>
    </div>
  );
}

function TourShowcase({ slug, name }: { slug: string; name: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    setHeight(null); setStatus("loading");
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow || e.data?.type !== "viator-place-top" || e.data.slug !== slug) return;
      const next = validViatorHeight(e.data.height);
      if (next === null || !["loading", "error", "empty", "results"].includes(e.data.status)) return;
      setHeight(next); setStatus(e.data.status);
    };
    // Same-origin fallback: measure the frame directly in case a message arrived before this listener.
    const timer = window.setInterval(() => {
      const body = frame.current?.contentDocument?.body;
      const next = body?.textContent?.trim() ? validViatorHeight(Math.ceil(body.scrollHeight)) : null;
      if (next) { setHeight(next); setStatus("results"); }
    }, 1000);
    window.addEventListener("message", onMsg);
    return () => { window.clearInterval(timer); window.removeEventListener("message", onMsg); };
  }, [slug]);
  const empty = status === "empty" || status === "error";
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-deep"><T>Top tour</T></p>
      <h2 className="mt-1 font-display text-2xl leading-tight text-foreground"><T>{`Most popular experience near ${name}`}</T></h2>
      {empty ? (
        <div className="mt-4 flex flex-1 flex-col items-start justify-center gap-3 rounded-lg bg-secondary/50 p-5">
          <Compass className="h-6 w-6 text-sage-deep" />
          <p className="text-sm text-muted-foreground"><T>{`See guided tours and tickets near ${name}.`}</T></p>
          <Button asChild variant="outline" className="min-h-12"><a href="#trip-tours"><T>Tours near this place</T></a></Button>
        </div>
      ) : (
        <iframe ref={frame} src={`/experiences/place/${slug}?limit=1`} title={`Top Viator tour near ${name}`} style={{ height: height ?? 420 }} className="mt-4 w-full border-0 bg-background" />
      )}
    </div>
  );
}
