import { T } from "@/lib/i18n";
import { Thumb, SwipeRow } from "@/components/ui-kit";
import flightImg from "@/assets/thumbs/flight.jpg";
import carImg from "@/assets/thumbs/car.jpg";
import stayImg from "@/assets/thumbs/stay.jpg";
import roadImg from "@/assets/thumbs/road.jpg";
import gearImg from "@/assets/thumbs/gear.jpg";
import { ArrowUpRight } from "lucide-react";
import { corridorPartnerLinks } from "@/lib/affiliates/corridorPartners";
import { buildVrboSearchUrl } from "@/lib/affiliates/vrbo";
import { isNonRoadDestination } from "@/lib/data/destinationAccess";

/** Shared five-stage booking path. Cars and RVs are alternatives within one stage. */
/** compact: tighter spacing and smaller images, for the strip placed directly under a page's short answer. */
export function BookingStepsStrip({ slug, name, airportCode, compact = false }: { slug: string; name: string; airportCode: string | null; compact?: boolean }) {
  const l = corridorPartnerLinks(slug);
  const nonRoad = isNonRoadDestination(slug);
  const steps = [
    { number: 1, label: airportCode ? `Find flights to ${airportCode}` : "Choose your arrival", brand: airportCode ? "Aviasales" : "Route & arrival notes", href: airportCode ? l.flight : "#trip-plan", external: !!airportCode },
    nonRoad ? { number: 2, label: "Arrange expedition transfers", brand: "Official access notes", href: "#trip-plan", external: false } : { number: 2, label: airportCode ? `Compare cars at ${airportCode}` : "Compare rental cars", brand: "Airport Rentals", href: l.car, external: true, alternative: l.motorhome },
    { number: 3, label: `Search stays near ${name}`, brand: "Vrbo", href: buildVrboSearchUrl(name), external: true },
    { number: 4, label: "Choose your tours", brand: "Tours & experiences", href: "#trip-tours", external: false },
    { number: 5, label: "Choose trip essentials", brand: "Four route-matched picks", href: "#trip-gear", external: false },
  ];
  return (
    <section aria-label="Book your trip in this order" className={`border-y border-border ${compact ? "py-3" : "py-5"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"><T>Book in this order</T></p>
      <SwipeRow className={`${compact ? "mt-2" : "mt-3"} md:grid-cols-2 lg:grid-cols-5`}>
        {steps.map((s) => (
          <div key={s.label}>
            <a href={s.href} target={s.external ? "_blank" : undefined} rel={s.external ? "sponsored nofollow noopener noreferrer" : undefined}
              onClick={(e) => { if (s.external) { e.preventDefault(); window.open(s.href, "_blank", "noopener,noreferrer"); } }}
              className="flex min-h-12 items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm font-semibold text-foreground transition hover:border-primary">
              <Thumb src={[flightImg, carImg, stayImg, roadImg, gearImg][s.number - 1]} size={compact ? 28 : 40} />
              <span className="min-w-0 flex-1"><span className="block text-[10px] uppercase text-sage-deep"><T>Step</T> {s.number}</span><T>{s.label}</T><span className="block text-[11px] font-normal text-muted-foreground"><T>{s.brand}</T></span></span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" />
            </a>
            {s.alternative && <a href={s.alternative} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-1 flex min-h-12 items-center px-3 text-xs font-semibold text-primary">Or choose an RV · Motorhome Republic <ArrowUpRight className="ml-1 h-3 w-3" /></a>}
          </div>
        ))}
      </SwipeRow>
    </section>
  );
}
