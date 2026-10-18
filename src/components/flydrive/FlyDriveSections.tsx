import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BedDouble, Car, Clock, Luggage, MapPin, Plane, Route as RouteIcon, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import type { DestinationView } from "@/lib/data/destinations.functions";
import type { FlyDriveSibling } from "@/lib/data/flyDrive.functions";
import { getFlightPrice } from "@/lib/affiliates/flights.functions";
import { tpLink } from "@/lib/affiliates/travelpayouts";
import { InlineOfferCta } from "@/components/landing/LandingOfferCard";
import { permitFallback } from "@/components/destination/TripRadar";
import { formatDriveShort, type Faq } from "@/lib/seo/flyDrive";

const PERMIT_LABEL = { high: "Reservations: high demand", moderate: "Reservations: moderate", none: "No entry permit" } as const;

export function FlyDriveHero({ dest }: { dest: DestinationView }) {
  return (
    <section className="relative isolate overflow-hidden">
      {dest.heroImage && (
        <img src={dest.heroImage} alt={`${dest.name} scenery`} className="absolute inset-0 -z-10 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/20" />
      <div className="container-page py-20 md:py-28">
        <nav className="mb-6 text-xs text-off-white/80">
          <Link to="/" className="hover:underline">Home</Link> /{" "}
          <Link to="/destinations/$slug" params={{ slug: dest.slug }} className="hover:underline">{dest.name}</Link> / Fly & Drive
        </nav>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-off-white/80">Fly & Drive guide</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-[1.05] text-off-white md:text-6xl">
          Fly into {dest.airportCode}, drive to {dest.name}
        </h1>
        <div className="mt-8 flex flex-wrap gap-2">
          {dest.driveMinutes != null && (
            <Chip icon={<Clock className="h-4 w-4" />}>{formatDriveShort(dest.driveMinutes)} drive</Chip>
          )}
          {dest.driveMiles != null && <Chip icon={<RouteIcon className="h-4 w-4" />}>{Math.round(dest.driveMiles)} miles</Chip>}
          {dest.permitLevel && <Chip icon={<ShieldAlert className="h-4 w-4" />}>{PERMIT_LABEL[dest.permitLevel]}</Chip>}
        </div>
      </div>
    </section>
  );
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-off-white/25 bg-off-white/15 px-4 py-2 text-sm font-medium text-off-white backdrop-blur">
      {icon}
      {children}
    </span>
  );
}

export function RouteCard({ dest }: { dest: DestinationView }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Your route</p>
      <div className="mt-4 flex items-center gap-4">
        <div>
          <p className="font-display text-5xl font-bold tracking-tight text-foreground">{dest.airportCode}</p>
          <p className="mt-1 max-w-[12rem] text-xs text-muted-foreground">{dest.airportName}</p>
        </div>
        <span className="relative h-px flex-1 border-t-2 border-dashed border-forest/30">
          <Car className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-forest" />
        </span>
        <div className="text-right">
          <MapPin className="ml-auto h-8 w-8 text-copper" />
          <p className="mt-1 text-sm font-semibold text-foreground">{dest.name}</p>
        </div>
      </div>
      {dest.driveMinutes != null && (
        <p className="mt-5 text-sm text-muted-foreground">
          About {formatDriveShort(dest.driveMinutes)}
          {dest.driveMiles != null && ` · ${Math.round(dest.driveMiles)} mi`} by car, no stops. Estimate only.
        </p>
      )}
    </div>
  );
}

function StepCard({ n, icon, title, body, href, cta, brand }: { n: number; icon: ReactNode; title: string; body: string; href: string; cta: string; brand: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      title={`Opens ${brand} in a new tab — partner link, we may earn a commission`}
      className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage/20 text-forest">{icon}</span>
        <span className="font-display text-3xl font-bold text-foreground/10">0{n}</span>
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5">
        {cta} <ArrowUpRight className="h-4 w-4" />
      </span>
      <p className="mt-2 text-[10px] text-muted-foreground">Partner link · {brand}</p>
    </a>
  );
}

export function ArrivalPlan({ dest }: { dest: DestinationView }) {
  const { data: fare } = useQuery({
    queryKey: ["flight-price", dest.airportCode],
    queryFn: () => getFlightPrice({ data: { airport: dest.airportCode! } }),
    enabled: !!dest.airportCode,
    staleTime: 60 * 60 * 1000,
  });
  const sub = `fly-drive-${dest.slug}`;
  const firstStay = dest.stays.find((s) => s.externalUrl);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StepCard
        n={1}
        icon={<Plane className="h-6 w-6" />}
        title={`Flights to ${dest.airportCode}`}
        body={fare?.price != null ? `Recent fares from ~$${Math.round(fare.price)} (estimate). Compare dates and airlines.` : `Compare fares into ${dest.airportName}.`}
        href={tpLink("aviasales", sub)}
        cta="Find flights"
        brand="Aviasales"
      />
      <StepCard
        n={2}
        icon={<Car className="h-6 w-6" />}
        title={`Car at ${dest.airportCode}`}
        body={`Pick up at the airport and drive straight to ${dest.name}. Compare rental companies in one search.`}
        href={tpLink("economybookings", sub)}
        cta="Compare rentals"
        brand="EconomyBookings"
      />
      <StepCard
        n={3}
        icon={<Luggage className="h-6 w-6" />}
        title="Store extra bags"
        body="Early arrival or late flight home? Drop luggage nearby and keep the car light for the park."
        href={tpLink("radicalstorage", sub)}
        cta="Find storage"
        brand="Radical Storage"
      />
      {firstStay ? (
        <div className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage/20 text-forest"><BedDouble className="h-6 w-6" /></span>
            <span className="font-display text-3xl font-bold text-foreground/10">04</span>
          </div>
          <h3 className="mt-5 font-display text-lg font-semibold text-foreground">First night</h3>
          <p className="mt-2 text-sm text-muted-foreground">Sleep close after the drive so day one starts in the park.</p>
          <div className="mt-auto pt-5">
            <InlineOfferCta offer={firstStay} destinationSlug={dest.slug} lead="Near the park" />
          </div>
        </div>
      ) : (
        <Link to="/destinations/$slug" params={{ slug: dest.slug }} hash="stays" className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage/20 text-forest"><BedDouble className="h-6 w-6" /></span>
          <h3 className="mt-5 font-display text-lg font-semibold text-foreground">First night</h3>
          <p className="mt-2 text-sm text-muted-foreground">See stays near {dest.name}.</p>
        </Link>
      )}
    </div>
  );
}

export function BeforeYouLand({ dest }: { dest: DestinationView }) {
  const note = dest.permitNote ?? (dest.permitLevel ? permitFallback(dest.name, dest.permitLevel, dest.bestSeason) : null);
  if (!note && !dest.bestSeason) return null;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {note && (
        <div className="rounded-3xl border border-border bg-sand/40 p-6 md:col-span-2 md:p-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Reservations</p>
          <p className="mt-2 font-display text-xl font-semibold text-foreground">{dest.permitHeadline ?? `Planning ${dest.name}`}</p>
          <p className="mt-3 leading-relaxed text-foreground/80">{note}</p>
          {dest.permitSourceUrl && (
            <a href={dest.permitSourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Official reservation info <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
      {dest.bestSeason && (
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Best time to fly in</p>
          <p className="mt-2 font-display text-xl font-semibold text-foreground">{dest.bestSeason}</p>
        </div>
      )}
    </div>
  );
}

export function FlyDriveFaq({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-border rounded-3xl border border-border bg-card">
      {faqs.map((f) => (
        <details key={f.q} className="group p-6" open>
          <summary className="cursor-pointer list-none font-semibold text-foreground">{f.q}</summary>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function RelatedLinks({ dest, siblings }: { dest: DestinationView; siblings: FlyDriveSibling[] }) {
  return (
    <div className="space-y-6">
      <Link to="/destinations/$slug" params={{ slug: dest.slug }} className="flex items-center justify-between rounded-3xl bg-forest p-6 text-off-white md:p-8">
        <span>
          <span className="block text-xs uppercase tracking-wider text-off-white/70">Full guide</span>
          <span className="font-display text-xl font-semibold">Stays, 3-day plan and route map for {dest.name}</span>
        </span>
        <ArrowUpRight className="h-6 w-6 shrink-0" />
      </Link>
      {siblings.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Also reachable from {dest.airportCode}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((s) => (
              <Link key={s.slug} to="/destinations/$slug" params={{ slug: s.slug }} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:shadow-soft">
                {s.heroImage && <img src={s.heroImage} alt={s.name} loading="lazy" className="h-14 w-14 rounded-xl object-cover" />}
                <span>
                  <span className="block text-sm font-semibold text-foreground">{s.name}</span>
                  {s.driveMinutes != null && <span className="text-xs text-muted-foreground">{formatDriveShort(s.driveMinutes)} drive</span>}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
