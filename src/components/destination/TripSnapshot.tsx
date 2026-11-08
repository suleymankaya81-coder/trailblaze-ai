import { T } from "@/lib/i18n";
import { CalendarDays, Car, Clock, Plane, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDriveShort } from '@/lib/seo/flyDrive';
import { Thumb } from '@/components/ui-kit';
import flightImg from '@/assets/thumbs/flight.jpg';
import roadImg from '@/assets/thumbs/road.jpg';
import planImg from '@/assets/thumbs/plan.jpg';
import mapImg from '@/assets/thumbs/map.jpg';
import carImg from '@/assets/thumbs/car.jpg';

type Trip = { airportCode?: string | null; driveMinutes?: number | null; tripDurationDays?: string | null; bestSeason?: string | null; permitLevel?: string | null; travelPlan?: { vehicle?: string | null } | null };
export function TripSnapshot({ trip, airport, days, stops }: { trip?: Trip; airport?: string | null; days?: string; stops?: number }) {
  const demand: Record<string, string> = { high: 'High · check entry notes', moderate: 'Moderate · check entry notes', none: 'Lower · check current rules' };
  const facts = [
    { image: flightImg, label: 'Arrival airport', value: airport ?? trip?.airportCode },
    { image: roadImg, label: 'Airport drive', value: trip?.driveMinutes != null ? `${formatDriveShort(trip.driveMinutes)} · estimate` : null },
    { image: planImg, label: 'Suggested stay', value: days ?? trip?.tripDurationDays },
    { image: mapImg, label: 'Reservation demand', value: trip?.permitLevel ? demand[trip.permitLevel] : stops ? `${stops} stops · check each guide` : null },
    { image: carImg, label: trip?.travelPlan?.vehicle ? 'Vehicle notes' : 'Best season', value: trip?.travelPlan?.vehicle ?? trip?.bestSeason },
  ].filter(f => f.value);
  return <section aria-label="Trip snapshot" className="border-b border-border bg-card">
    <div className={`container-page ${compact ? "py-3" : "py-6"}`}>{!compact && <p className="mb-4 text-xs font-semibold uppercase text-sage-deep"><T>Trip snapshot</T></p>}<dl className="grid grid-cols-2 gap-5 lg:grid-cols-5">{facts.map(f => <div key={f.label} className="min-w-0"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Thumb src={f.image} size={compact ? 28 : 40} /><T>{f.label}</T></dt><dd className={`${compact ? "mt-1 line-clamp-1" : "mt-2 line-clamp-3"} text-sm`} data-x=" font-semibold leading-relaxed" title={String(f.value)}>{typeof f.value === "string" ? <T>{f.value}</T> : f.value}</dd></div>)}</dl></div>
  </section>;
}
export function TripQuickNav({ booking = true }: { booking?: boolean }) {
  return <nav aria-label="Trip quick navigation" className="trip-quick-nav sticky top-20 z-30 md:top-24"><div className="container-page flex gap-2 overflow-x-auto py-2">{[{ id: 'trip-plan', label: 'Plan & route' }, ...(booking ? [{ id: 'trip-booking', label: 'Flights, vehicles & stays' }] : []), { id: 'trip-tours', label: 'Tours' }, { id: 'trip-gear', label: 'Trip essentials' }].map(l => <Button key={l.id} asChild variant="ghost" className="h-12 shrink-0"><a href={`#${l.id}`}><T>{l.label}</T></a></Button>)}</div></nav>;
}
/** Destination booking bar: one jump link per booking stage, in booking order. */
export function BookingBar() {
  const links = [{ id: 'trip-flights', label: 'Flights' }, { id: 'trip-vehicles', label: 'Vehicle & RV' }, { id: 'stays', label: 'Stays' }, { id: 'trip-tours', label: 'Tours' }, { id: 'trip-gear', label: 'Gear' }, { id: 'flow', label: 'Itinerary' }];
  return <nav aria-label="Booking bar" className="trip-quick-nav sticky top-20 z-30 md:top-24"><div className="container-page flex h-14 items-center gap-1 overflow-x-auto">{links.map(l => <Button key={l.id} asChild variant="ghost" className="h-11 shrink-0 px-3"><a href={`#${l.id}`}><T>{l.label}</T></a></Button>)}</div></nav>;
}
