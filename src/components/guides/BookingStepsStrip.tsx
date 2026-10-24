import { ArrowUpRight } from "lucide-react";
import { corridorPartnerLinks } from "@/lib/affiliates/corridorPartners";
import { buildVrboSearchUrl } from "@/lib/affiliates/vrbo";

/** Compact numbered booking order for one destination: flight → car/RV → stay → data. */
export function BookingStepsStrip({ slug, name, airportCode }: { slug: string; name: string; airportCode: string | null }) {
  const l = corridorPartnerLinks(slug);
  const steps = [
    airportCode && { label: `Find flights to ${airportCode}`, brand: "Aviasales", href: l.flight },
    { label: airportCode ? `Compare cars at ${airportCode}` : "Compare rental cars", brand: "Airport Rentals", href: l.car },
    { label: "Or compare RVs & campervans", brand: "Motorhome Republic", href: l.motorhome },
    { label: `Search stays near ${name}`, brand: "Vrbo", href: buildVrboSearchUrl(name) },
    { label: "Get a U.S. eSIM", brand: "Airalo", href: l.esim },
  ].filter(Boolean) as { label: string; brand: string; href: string }[];
  return (
    <section aria-label="Book your trip in this order" className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Book in this order</p>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((s, i) => (
          <li key={s.label}>
            <a href={s.href} target="_blank" rel="sponsored nofollow noopener noreferrer"
              onClick={(e) => { e.preventDefault(); window.open(s.href, "_blank", "noopener,noreferrer"); }}
              className="flex h-full items-start gap-2 rounded-xl border border-border bg-background p-3 text-sm font-semibold text-foreground transition hover:border-primary">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>
              <span className="min-w-0 flex-1">{s.label}<span className="block text-[11px] font-normal text-muted-foreground">{s.brand} · partner link</span></span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" />
            </a>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-muted-foreground">Live prices and availability are on each partner's site. We may earn a commission, at no extra cost to you.</p>
    </section>
  );
}
