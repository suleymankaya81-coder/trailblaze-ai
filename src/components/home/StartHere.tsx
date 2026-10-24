import { Link } from '@tanstack/react-router';
import { ArrowRight, MapPinned, Mountain, Plane, Route, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const entries = [
  { to: '/destinations', icon: Mountain, title: 'Parks & outdoor places', detail: 'Find your destination' },
  { to: '/road-trips', icon: Route, title: 'Multi-park road trips', detail: 'Connect the stops' },
  { to: '/corridors', icon: Plane, title: 'Fly-in road trips', detail: 'Start at an airport' },
  { to: '/rv-camping', icon: Truck, title: 'RV & camping', detail: 'Plan your overnights' },
  { to: '/gear', icon: ShoppingBag, title: 'Curated trip essentials', detail: 'Find gear for the road' },
] as const;

export function StartHere() {
  return <>
    <section id="how-it-works" className="border-b border-border bg-card py-10 md:py-12">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-xs font-semibold uppercase text-sage-deep">MiniaLife · How it works</p>
            <h2 className="mt-2 font-serif text-3xl">Your U.S. road trip, brought together.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">We create free outdoor travel guides and self-drive itineraries. You choose the trip; bookings and payments happen directly with our travel partners.</p>
          </div>
          <Button asChild variant="outline" size="lg"><Link to="/about">About MiniaLife <ArrowRight /></Link></Button>
        </div>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { icon: MapPinned, title: 'Choose a place or route', text: 'Explore national parks, outdoor towns and airport-to-airport loops.' },
            { icon: Route, title: 'Bring your plan together', text: 'See suggested days, maps, arrival options, stays and reservation notes.' },
            { icon: ShoppingBag, title: 'Book with the partner', text: 'Compare cars, RVs, stays and tours. Check final prices and terms before paying.' },
          ].map((s, i) => <li key={s.title} className="flex gap-4 md:border-l md:border-border md:pl-5"><s.icon className="mt-1 h-6 w-6 shrink-0 text-primary" /><div><p className="text-xs font-semibold text-sage-deep">0{i + 1}</p><h3 className="mt-1 text-base">{s.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p></div></li>)}
        </ol>
        <p className="mt-6 text-xs text-muted-foreground">Free to explore · Independent itineraries, not packaged tours · We may earn a commission from partner links.</p>
      </div>
    </section>
    <section className="container-page py-10 md:py-12" aria-labelledby="start-title">
      <h2 id="start-title" className="mb-6 font-serif text-2xl">Where would you like to start?</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{entries.map(e => <Button key={e.to} asChild variant="outline" className="h-auto min-h-32 flex-col whitespace-normal rounded-lg p-4 text-center"><Link to={e.to}><e.icon className="mb-2 size-7" /><span className="text-sm font-semibold">{e.title}</span><span className="text-xs font-normal text-muted-foreground">{e.detail}</span></Link></Button>)}</div>
    </section>
  </>;
}