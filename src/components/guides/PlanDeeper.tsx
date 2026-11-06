import { T } from "@/lib/i18n";
import { Link } from "@/components/site/LocalLink";
import { ArrowRight } from "lucide-react";

import type { DestinationView } from "@/lib/data/destinations.functions";
import type { LandingLink } from "@/lib/data/landingPages.functions";
import { LANDING_TYPE_LABEL } from "@/lib/data/landingTypes";
import { CORRIDORS } from "@/lib/seo/corridors";
import { flyDriveSlug } from "@/lib/seo/flyDrive";
import { isNoReservationEligible, isRvEligible, loopsForDestination } from "@/lib/seo/guides";

export type GuideKind = "destination" | "fly-and-drive" | "no-reservation" | "rv-camping" | "landing";

const pill =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted";

// Every guide for one place, rendered server-side so crawlers see the links.
// `current` hides the page the visitor is already on.
export function PlanDeeper({
  dest,
  landingLinks,
  current,
  currentPath,
}: {
  dest: DestinationView;
  landingLinks: LandingLink[];
  current: GuideKind;
  currentPath?: string;
}) {
  const shortName = dest.name.replace(" National Park", "");
  const arrivalSlug = current === "fly-and-drive" ? null : flyDriveSlug(dest);
  const noRes = current !== "no-reservation" && isNoReservationEligible(dest);
  const rv = current !== "rv-camping" && isRvEligible(dest);
  const loops = loopsForDestination(dest.slug);
  const gatewayTrips = CORRIDORS.filter((c) => c.stops.includes(dest.slug));
  const landing = landingLinks.filter((p) => p.path !== currentPath);
  const showDest = current !== "destination";
  if (!showDest && !arrivalSlug && !noRes && !rv && loops.length === 0 && gatewayTrips.length === 0 && landing.length === 0) return null;
  return (
    <section className="border-y border-border py-6" aria-labelledby="plan-deeper-title">
      <h2 id="plan-deeper-title" className="font-display text-2xl text-foreground">
        <T>{current === "destination" ? "Plan deeper" : `More ${shortName} guides`}</T>
      </h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {showDest && (
          <Link to="/destinations/$slug" params={{ slug: dest.slug }} className={pill}>
            <T>{`${dest.name}: full trip plan`}</T> <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        {arrivalSlug && (
          <Link to="/fly-and-drive/$slug" params={{ slug: arrivalSlug }} className={pill}>
            <T>{`Fly into ${dest.airportCode}: flights, car & first night`}</T> <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        {noRes && (
          <Link to="/no-reservation/$slug" params={{ slug: dest.slug }} className={pill}>
            <T>No reservation? Entry rules & backup plans</T> <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        {rv && (
          <Link to="/rv-camping/$slug" params={{ slug: dest.slug }} className={pill}>
            By RV: campgrounds & RV parks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        {gatewayTrips.map((c) => (
          <Link key={c.slug} to="/corridors/$slug" params={{ slug: c.slug }} className={pill}>
            <T>Airport road trip:</T> {c.title} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
        {loops.map((l) => (
          <Link key={l.slug} to="/road-trips/$slug" params={{ slug: l.slug }} className={pill}>
            <T>Road trip:</T> {l.title} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
        {landing.map((p) => (
          <Link key={p.path} to="/$landing" params={{ landing: p.path.slice(1) }} className={pill}>
            {shortName}: {LANDING_TYPE_LABEL[p.pageType] ?? p.pageType} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}
