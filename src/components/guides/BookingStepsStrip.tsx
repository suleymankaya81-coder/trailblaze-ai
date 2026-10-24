import { Thumb, SwipeRow } from "@/components/ui-kit";
import flightImg from "@/assets/thumbs/flight.jpg";
import carImg from "@/assets/thumbs/car.jpg";
import stayImg from "@/assets/thumbs/stay.jpg";
import roadImg from "@/assets/thumbs/road.jpg";
import gearImg from "@/assets/thumbs/gear.jpg";
import { ArrowUpRight } from "lucide-react";
import { corridorPartnerLinks } from "@/lib/affiliates/corridorPartners";
import { buildVrboSearchUrl } from "@/lib/affiliates/vrbo";

/** Shared five-stage booking path. Cars and RVs are alternatives within one stage. */
export function BookingStepsStrip({ slug, name, airportCode }: { slug: string; name: string; airportCode: string | null }) {
  const l = corridorPartnerLinks(slug);
  const steps = [
    { number: 1, label: airportCode ? `Find flights to ${airportCode}` : "Choose your arrival", brand: airportCode ? "Aviasales" : "Route & arrival notes", href: airportCode ? l.flight : "#trip-plan", external: !!airportCode },
    { number: 2, label: airportCode ? `Compare cars at ${airportCode}` : "Compare rental cars", brand: "Airport Rentals", href: l.car, external: true, alternative: l.motorhome },
    { number: 3, label: `Search stays near ${name}`, brand: "Vrbo", href: buildVrboSearchUrl(name), external: true },
    { number: 4, label: "Choose your tours", brand: "Tours & experiences", href: "#trip-tours", external: false },
    { number: 5, label: "Choose trip essentials", brand: "Four route-matched picks", href: "#trip-gear", external: false },
  ];
  return (
    <section aria-label="Book your trip in this order" className="border-y border-border py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Book in this order</p>
      <SwipeRow className="mt-3 md:grid-cols-2 lg:grid-cols-5">
        {steps.map((s) => (
          <div key={s.label}>
            <a href={s.href} target={s.external ? "_blank" : undefined} rel={s.external ? "sponsored nofollow noopener noreferrer" : undefined}
              onClick={(e) => { if (s.external) { e.preventDefault(); window.open(s.href, "_blank", "noopener,noreferrer"); } }}
              className="flex min-h-12 items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm font-semibold text-foreground transition hover:border-primary">
              <Thumb src={[flightImg, carImg, stayImg, roadImg, gearImg][s.number - 1]} size={40} />
              <span className="min-w-0 flex-1"><span className="block text-[10px] uppercase text-sage-deep">Step {s.number}</span>{s.label}<span className="block text-[11px] font-normal text-muted-foreground">{s.brand}{s.external ? " · partner link" : ""}</span></span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" />
            </a>
            {s.alternative && <a href={s.alternative} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-1 flex min-h-12 items-center px-3 text-xs font-semibold text-primary">Or choose an RV · Motorhome Republic <ArrowUpRight className="ml-1 h-3 w-3" /></a>}
          </div>
        ))}
      </SwipeRow>
      <p className="mt-3 text-[11px] text-muted-foreground">Live prices and availability are on each partner's site. We may earn a commission, at no extra cost to you.</p>
    </section>
  );
}
