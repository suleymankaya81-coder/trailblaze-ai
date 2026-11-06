import { T } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { CORRIDORS } from "@/lib/seo/corridors";
import { LOOPS } from "@/lib/seo/guides";

const pill =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted";

const MAX = 6;

// Sideways links between route pages: routes sharing a stop come first, then
// the rest of the list fills up to MAX. Server-rendered for crawlers.
export function MoreRoutes({ stops, currentLoop, currentCorridor }: { stops: string[]; currentLoop?: string; currentCorridor?: string }) {
  const shares = (s: string[]) => s.some((x) => stops.includes(x));
  const rank = <T extends { slug: string; stops: string[] }>(list: T[], current?: string) => {
    const pool = list.filter((x) => x.slug !== current);
    return [...pool.filter((x) => shares(x.stops)), ...pool.filter((x) => !shares(x.stops))].slice(0, MAX);
  };
  const loops = rank(LOOPS, currentLoop);
  const corridors = rank(CORRIDORS.filter((c) => !c.pilot), currentCorridor);
  return (
    <section className="container-page pb-14" aria-labelledby="more-routes-title">
      <div className="border-y border-border py-6">
        <h2 id="more-routes-title" className="font-display text-2xl text-foreground">More road trips</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {loops.map((l) => (
            <Link key={l.slug} to="/road-trips/$slug" params={{ slug: l.slug }} className={pill}>
              <T>{l.title}</T> <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ))}
          {corridors.map((c) => (
            <Link key={c.slug} to="/corridors/$slug" params={{ slug: c.slug }} className={pill}>
              From the airport: {c.title} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
