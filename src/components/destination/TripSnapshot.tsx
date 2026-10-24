import { CalendarDays, Car, Clock, Plane, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDriveShort } from '@/lib/seo/flyDrive';

type Trip = { airportCode?: string | null; driveMinutes?: number | null; tripDurationDays?: string | null; bestSeason?: string | null; permitLevel?: string | null; travelPlan?: { vehicle?: string | null } | null };
export function TripSnapshot({ trip, airport, days, stops }: { trip?: Trip; airport?: string | null; days?: string; stops?: number }) {
  const demand: Record<string, string> = { high: 'High · check entry notes', moderate: 'Moderate · check entry notes', none: 'Lower · check current rules' };
  const facts = [
    { icon: Plane, label: 'Arrival airport', value: airport ?? trip?.airportCode },
    { icon: Clock, label: 'Airport drive', value: trip?.driveMinutes != null ? `${formatDriveShort(trip.driveMinutes)} · estimate` : null },
    { icon: CalendarDays, label: 'Suggested stay', value: days ?? trip?.tripDurationDays },
    { icon: ShieldAlert, label: 'Reservation demand', value: trip?.permitLevel ? demand[trip.permitLevel] : stops ? `${stops} stops · check each guide` : null },
    { icon: Car, label: trip?.travelPlan?.vehicle ? 'Vehicle notes' : 'Best season', value: trip?.travelPlan?.vehicle ?? trip?.bestSeason },
  ].filter(f => f.value);
  return <section aria-label="Trip snapshot" className="border-b border-border bg-card">
    <div className="container-page py-6"><p className="mb-4 text-xs font-semibold uppercase text-sage-deep">Trip snapshot</p><dl className="grid grid-cols-2 gap-5 lg:grid-cols-5">{facts.map(f => <div key={f.label} className="min-w-0"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><f.icon className="h-4 w-4 shrink-0" />{f.label}</dt><dd className="mt-2 text-sm font-semibold leading-relaxed">{f.value}</dd></div>)}</dl></div>
  </section>;
}
export function TripQuickNav() {
  return <nav aria-label="Trip quick navigation" className="trip-quick-nav sticky top-20 z-30 md:top-24"><div className="container-page flex gap-2 overflow-x-auto py-2">{[{ id: 'trip-plan', label: 'Plan & route' }, { id: 'trip-booking', label: 'Flights, vehicles & stays' }, { id: 'trip-tours', label: 'Tours' }, { id: 'trip-gear', label: 'Trip essentials' }].map(l => <Button key={l.id} asChild variant="ghost" className="h-12 shrink-0"><a href={`#${l.id}`}>{l.label}</a></Button>)}</div></nav>;
}