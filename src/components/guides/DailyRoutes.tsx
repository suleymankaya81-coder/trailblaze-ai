import type { DestinationView } from "@/lib/data/destinations.functions";
import { DayRouteActions } from "@/components/ui-kit/DayRouteActions";
import { dayPoints, type RoutePoint } from "@/lib/routes/dayRoute";
import { T } from "@/lib/i18n";

/** The stored daily stop order, reused by every place-guide family. */
export function DailyRoutes({ dest, arrival = false }: { dest: DestinationView; arrival?: boolean }) {
  const plan = dest.travelPlan;
  if (!plan) return null;
  const arrivalPoints: RoutePoint[] = dest.airportCode && dest.airportLat != null && dest.airportLng != null && dest.lat != null && dest.lng != null
    ? [{ name: dest.airportCode, lat: dest.airportLat, lng: dest.airportLng, query: dest.airportName ?? dest.airportCode }, { name: dest.name, lat: dest.lat, lng: dest.lng, query: `${dest.name}, ${dest.region}` }]
    : [];
  return <section className="container-page py-8">
    <h2 className="mb-5 font-display text-2xl text-foreground"><T>Your route</T></h2>
    {arrival && <DayRouteActions title={`${dest.name} airport arrival`} points={arrivalPoints} mapsLabel="Open route in Google Maps" />}
    <ol className="grid gap-5 md:grid-cols-2">
      {plan.days.map((day, i) => <li key={i} className="border-b border-border py-4">
        <h3 className="text-lg text-foreground"><T>Day</T> {i + 1} · <T>{day.title}</T></h3>
        <p className="mt-2 text-sm text-muted-foreground">{day.stops.map(s => s.name).join(" → ")}</p>
        <DayRouteActions title={`${dest.name} day ${i + 1}`} points={dayPoints(day, plan.markers, dest.name, dest.region, dest.slug)} />
      </li>)}
    </ol>
  </section>;
}