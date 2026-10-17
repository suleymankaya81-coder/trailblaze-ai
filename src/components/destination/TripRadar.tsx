import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Plane, ShieldAlert } from "lucide-react";
import type { DestinationView } from "@/lib/data/destinations.functions";
import { getFlightPrice } from "@/lib/affiliates/flights.functions";
import { tpLink } from "@/lib/affiliates/travelpayouts";

const PERMIT_COPY = {
  high: { label: "High demand", tone: "border-copper/40 bg-copper/5", badge: "bg-copper/15 text-copper" },
  moderate: { label: "Moderate", tone: "border-border bg-sand/40", badge: "bg-sand text-foreground" },
  none: { label: "Low", tone: "border-sage/40 bg-sage/5", badge: "bg-sage/20 text-forest" },
} as const;

export function formatDrive(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} h ${m ? `${m} min` : ""}`.trim() : `${m} min`;
}

/** Fallback until a place has its own stored note: still names the place and season. */
export function permitFallback(name: string, level: string, season: string | null) {
  const when = season ? ` during ${season.toLowerCase()}` : " in peak season";
  if (level === "high")
    return `Popular campsites, lodges and any entry reservations around ${name} can fill well ahead${when}. Check the official park site for current reservation windows before locking in flights.`;
  if (level === "moderate")
    return `Most visits to ${name} need no entry permit, but nearby campsites and stays get busy${when}. Reserving your first nights early keeps the rest of the trip flexible.`;
  return `${name} usually needs no advance entry permit. Weekends${when} still get busy, so booking a place to sleep a little ahead is the safest move.`;
}

/** Reservation intel + flight gateway shown right under the hero. */
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
  const note =
    dest.permitNote ??
    (dest.permitLevel ? permitFallback(dest.name, dest.permitLevel, dest.bestSeason) : "");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {permit && (
        <div className={`flex flex-col rounded-3xl border p-6 shadow-soft md:p-7 ${permit.tone}`}>
          <div className="flex items-center gap-3">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${permit.badge}`}>
              <ShieldAlert className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Reservations · {permit.label}
              </p>
              <p className="font-display text-xl font-semibold leading-tight text-foreground">
                {dest.permitHeadline ?? `Planning ${dest.name}`}
              </p>
            </div>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">{note}</p>
          {dest.permitSourceUrl && (
            <a
              href={dest.permitSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary hover:underline"
            >
              Check official reservation info <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
      {dest.airportCode && flightsHref && (
        <a
          href={flightsHref}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          title="Opens Aviasales flight search in a new tab — partner link, we may earn a commission"
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-sage/25 via-card to-sand/50 p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg md:p-7"
        >
          <Plane className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rotate-12 text-forest/5" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Fly in · nearest airport</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-display text-4xl font-bold tracking-tight text-foreground">
              {dest.airportCode}
            </span>
            <span className="relative h-px flex-1 border-t-2 border-dashed border-forest/30">
              <Plane className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 text-forest transition group-hover:left-3/4" />
            </span>
            <span className="max-w-[40%] truncate text-right text-sm font-semibold text-foreground">
              {dest.name}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {dest.airportName}
            {dest.driveMinutes != null && ` · ${formatDrive(dest.driveMinutes)} drive`}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
            {fare?.price != null ? (
              <span className="rounded-full bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft">
                recent fares from ~${Math.round(fare.price)} (estimate)
              </span>
            ) : (
              <span />
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition group-hover:gap-3">
              Find flights to {dest.airportCode}
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">Partner link · Aviasales</p>
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
