import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Plane, ShieldAlert } from "lucide-react";
import type { DestinationView } from "@/lib/data/destinations.functions";
import { getFlightPrice } from "@/lib/affiliates/flights.functions";
import { tpLink } from "@/lib/affiliates/travelpayouts";

const PERMIT_COPY = {
  high: { label: "High", note: "Campsites & entry permits sell out months ahead" },
  moderate: { label: "Moderate", note: "Book peak-season stays early" },
  none: { label: "None", note: "Usually no advance permit needed" },
} as const;

export function formatDrive(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} h ${m ? `${m} min` : ""}`.trim() : `${m} min`;
}

/** Permit pressure + nearest airport strip shown right under the hero.
 *  The airport cell is a flight-search gateway: it links to Aviasales
 *  (tracked partner link) and shows the cached fare estimate when available. */
export function TripRadar({ dest }: { dest: DestinationView }) {
  const { data: fare } = useQuery({
    queryKey: ["flight-price", dest.airportCode],
    queryFn: () =>
      dest.airportCode
        ? getFlightPrice({ data: { airport: dest.airportCode } })
        : Promise.resolve(null),
    enabled: !!dest.airportCode,
    staleTime: 60 * 60 * 1000,
  });

  if (!dest.permitLevel && !dest.airportCode) return null;
  const permit = dest.permitLevel ? PERMIT_COPY[dest.permitLevel] : null;
  const flightsHref = dest.airportCode ? tpLink("aviasales", dest.slug) : null;

  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-2">
      {permit && (
        <div className="flex items-start gap-3">
          <span
            className={
              "grid h-9 w-9 shrink-0 place-items-center rounded-full " +
              (dest.permitLevel === "high"
                ? "bg-copper/15 text-copper"
                : dest.permitLevel === "moderate"
                  ? "bg-sand text-foreground"
                  : "bg-sage/20 text-forest")
            }
          >
            <ShieldAlert className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Reservation needed
            </p>
            <p className="text-sm font-semibold text-foreground">{permit.label}</p>
            <p className="text-xs text-muted-foreground">{permit.note}</p>
          </div>
        </div>
      )}
      {dest.airportCode && flightsHref && (
        <a
          href={flightsHref}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          title="Opens Aviasales flight search in a new tab — partner link, we may earn a commission"
          className="group flex items-start gap-3 rounded-xl p-2 -m-2 transition hover:bg-muted"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage/20 text-forest">
            <Plane className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Nearest airport
            </p>
            <p className="text-sm font-semibold text-foreground">
              {dest.airportCode}
              {dest.driveMinutes != null && ` · ${formatDrive(dest.driveMinutes)} drive`}
            </p>
            <p className="text-xs text-muted-foreground">{dest.airportName}</p>
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Find flights to {dest.airportCode}
              {fare?.price != null && (
                <span className="font-normal text-muted-foreground">
                  · recent fares from ~${Math.round(fare.price)} (estimate)
                </span>
              )}
              <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </p>
            <p className="text-[10px] text-muted-foreground">Partner link · Aviasales</p>
          </div>
        </a>
      )}
    </div>
  );
}

const JUMPS = [
  { href: "#stays", label: "Stays" },
  { href: "#rentals", label: "RV & Car Rentals" },
  { href: "#flow", label: "3-Day Flow" },
  { href: "#road-trip", label: "Route" },
  { href: "#tours", label: "Tours" },
];

export function JumpBar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-page flex gap-2 overflow-x-auto py-2.5">
        {JUMPS.map((j) => (
          <a
            key={j.href}
            href={j.href}
            className="shrink-0 rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-foreground/80 transition hover:bg-muted hover:text-foreground"
          >
            {j.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
