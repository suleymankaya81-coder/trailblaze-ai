import { CategoryTile, SectionHead, Thumb } from '@/components/ui-kit';
import mapImg from '@/assets/thumbs/map.jpg';
import planImg from '@/assets/thumbs/plan.jpg';
import carImg from '@/assets/thumbs/car.jpg';
import flightImg from '@/assets/thumbs/flight.jpg';
import rvImg from '@/assets/thumbs/rv.jpg';
import gearImg from '@/assets/thumbs/gear.jpg';
import roadImg from '@/assets/thumbs/road.jpg';

const steps = [
  { img: mapImg, title: 'Choose a park or route', text: '500+ outdoor places, 30 multi-park loops and 24 road trips that start at an airport.' },
  { img: planImg, title: 'See your plan on one page', text: 'Day-by-day stops, a route map, arrival airport, reservation notes and where to stay.' },
  { img: carImg, title: 'Book with the partner', text: 'Compare flights, cars, RVs, stays and tours, then check the final price on the partner site.' },
];

/** Homepage "who we are / how it works" band plus five photo entry squares. */
export function StartHere({ parkImage }: { parkImage?: string }) {
  const entries = [
    { to: '/destinations', image: parkImage ?? roadImg, title: 'National parks', detail: 'Find your place' },
    { to: '/road-trips', image: roadImg, title: 'Road trip loops', detail: 'Connect the parks' },
    { to: '/corridors', image: flightImg, title: 'Fly-in road trips', detail: 'Start at an airport' },
    { to: '/rv-camping', image: rvImg, title: 'RV & camping', detail: 'Plan your nights' },
    { to: '/gear', image: gearImg, title: 'Trip essentials', detail: 'Gear for the road' },
  ];
  return <>
    <section id="how-it-works" className="section-y border-b border-border bg-card">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-deep">What is MiniaLife?</p>
          <h2 className="mt-2 text-[26px] leading-tight md:text-4xl">Free U.S. road trip plans, ready to book.</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">We write independent self-drive guides for national parks and outdoor places. You pick the trip; you book directly with trusted travel partners.</p>
        </div>
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => <li key={s.title} className="flex gap-4 md:flex-col">
            <Thumb src={s.img} alt="" size={72} />
            <div><p className="text-xs font-semibold text-sage-deep">Step {i + 1}</p><h3 className="mt-1 text-lg leading-snug">{s.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p></div>
          </li>)}
        </ol>
      </div>
    </section>
    <section className="section-y container-page" aria-labelledby="start-title">
      <SectionHead kicker="Start here" title="Where would you like to start?" />
      <div className="grid grid-cols-3 gap-x-3 gap-y-6 md:grid-cols-5 md:gap-5">
        {entries.map(e => <CategoryTile key={e.to} to={e.to} image={e.image} label={e.title} detail={e.detail} />)}
      </div>
    </section>
  </>;
}
