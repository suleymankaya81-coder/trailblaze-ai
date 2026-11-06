import { T } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";
import { motorhomeRepublicLink, airportRentalsLink } from "@/lib/affiliates/webjet";
import banner from "@/assets/home/rentals-banner.jpg";

const OPTIONS = [
  { title: <T>RVs & motorhomes</T>, text: <T>Room for the whole crew, kitchen and bed included.</T>, price: <T>Est. from $150/day</T>, href: motorhomeRepublicLink(), brand: "Motorhome Republic" },
  { title: <T>Campervans</T>, text: <T>Compact, easy to park, sleeps two on scenic loops.</T>, price: <T>Est. from $95/day</T>, href: motorhomeRepublicLink(), brand: "Motorhome Republic" },
  { title: <T>Airport car rentals</T>, text: <T>Land, pick up your car and start the drive.</T>, price: <T>Est. from $45/day</T>, href: airportRentalsLink(), brand: "Airport Rentals" },
];

/** Step 2 promo band: photo-led, links to approved Webjet partners (no embedded search widget). */
export function RentalsFeature() {
  return (
    <div>
      <div className="grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[minmax(0,5fr)_minmax(0,12fr)]">
        <div className="flex flex-col justify-center gap-4 bg-secondary p-6 md:p-8">
          <span className="w-fit rounded-sm bg-accent px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-accent-foreground"><T>Step 2 · Your wheels</T></span>
          <h2 className="font-display text-3xl leading-tight text-foreground md:text-4xl"><T>RVs, campervans &amp; airport cars</T></h2>
          <p className="text-muted-foreground"><T>Pick the vehicle that fits your route, then compare live prices for your dates on our partner sites.</T></p>
          <div className="flex flex-wrap gap-3">
            <a href={motorhomeRepublicLink()} target="_blank" rel="sponsored noopener" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90"><T>Find an RV</T> <ArrowRight className="h-4 w-4" /></a>
            <a href={airportRentalsLink()} target="_blank" rel="sponsored noopener" className="inline-flex h-11 items-center gap-2 rounded-full border border-primary px-5 font-semibold text-primary hover:bg-primary/5"><T>Rent a car</T></a>
          </div>
        </div>
        <div className="relative min-h-[240px] md:min-h-[380px]">
          <img src={banner} alt="Motorhome, campervan and SUV parked at a canyon overlook" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {OPTIONS.map((o) => (
          <a key={o.title} href={o.href} target="_blank" rel="sponsored noopener" className="group flex flex-col rounded-xl border border-border bg-secondary p-5 transition-colors hover:bg-card">
            <span className="font-display text-lg text-foreground">{o.title}</span>
            <span className="mt-1 text-sm text-muted-foreground">{o.text}</span>
            <span className="mt-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">{o.price} <span className="font-normal text-muted-foreground"><T>· typical</T></span></span>
              <span className="inline-flex items-center gap-1 font-semibold text-primary">{o.brand} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
