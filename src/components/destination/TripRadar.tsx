import { CalendarClock, Plane, ShieldAlert, Tent } from "lucide-react";
import type { DestinationView } from "@/lib/data/destinations.functions";

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

/** Permit pressure + nearest airport strip shown right under the hero. */
export function TripRadar({ dest }: { dest: DestinationView }) {
  if (!dest.permitLevel && !dest.airportCode) return null;
  const permit = dest.permitLevel ? PERMIT_COPY[dest.permitLevel] : null;
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
      {dest.airportCode && (
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage/20 text-forest">
            <Plane className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Nearest airport
            </p>
            <p className="text-sm font-semibold text-foreground">
              {dest.airportCode}
              {dest.driveMinutes != null && ` · ${formatDrive(dest.driveMinutes)} drive`}
            </p>
            <p className="text-xs text-muted-foreground">{dest.airportName}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const JUMPS = [
  { href: "#stays", label: "Stays" },
  { href: "#rentals", label: "RV & Car Rentals" },
  { href: "#tours", label: "Tours" },
  { href: "#checklist", label: "Checklist" },
  { href: "#road-trip", label: "Route" },
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function firstMonth(season: string | null): number | null {
  if (!season) return null;
  const s = season.toLowerCase();
  let best: { i: number; pos: number } | null = null;
  FULL.forEach((m, i) => {
    const pos = Math.min(
      ...[s.indexOf(m), s.indexOf(MONTHS[i].toLowerCase())].filter((p) => p >= 0),
      Infinity,
    );
    if (pos !== Infinity && (!best || pos < best.pos)) best = { i, pos };
  });
  if (best) return (best as { i: number }).i;
  if (s.includes("summer")) return 6;
  if (s.includes("spring")) return 3;
  if (s.includes("fall") || s.includes("autumn")) return 8;
  if (s.includes("winter")) return 11;
  return null;
}

/** "Sold out?" Plan B box: points to private campsites/glamping near the park. */
export function PlanB({
  dest,
  alternatives,
}: {
  dest: DestinationView;
  alternatives: React.ReactNode;
}) {
  const m = firstMonth(dest.bestSeason);
  const at = (back: number) => MONTHS[(((m ?? 0) - back) % 12 + 12) % 12];
  const showSoldOut = dest.permitLevel === "high" || dest.permitLevel === "moderate";

  return (
    <section className="min-w-0 rounded-2xl border border-copper/30 bg-copper/5 p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <Tent className="mt-0.5 h-5 w-5 shrink-0 text-copper" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl text-foreground">
            {showSoldOut
              ? `${dest.name.split(" ")[0]} campgrounds sold out? You still have options.`
              : `Book your ${dest.name.split(" ")[0]} stay without the stress`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Private campsites and glamping just outside the park often stay open when park
            campgrounds are full. Availability is set by each partner.
          </p>
          {alternatives}
        </div>
      </div>

      {m != null && (
        <div className="mt-5 flex items-start gap-3 border-t border-copper/20 pt-4">
          <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
          <p className="text-sm text-foreground/85">
            <span className="font-semibold">Going in {MONTHS[m]}?</span> Book campsites around{" "}
            {at(6)}, any entry permit around {at(4)}, and your RV or car around {at(2)}. Always
            check official park rules for exact release dates.
          </p>
        </div>
      )}
    </section>
  );
}
