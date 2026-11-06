import { T } from "@/lib/i18n";
import { hreflangLinks } from "@/lib/seo/hreflang";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { LOOPS } from "@/lib/seo/guides";
import { HUB_SEO } from "@/lib/seo/hubSeo";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { servicePhoto, type ServicePhotoCategory } from "@/lib/data/servicePhotos";
import { PhotoCredit } from "@/components/shared/PhotoCredit";
import { RentalsFeature } from "@/components/home/RentalsFeature";
import { HomeExperiences } from "@/components/home/HomeExperiences";
import { StartHere } from "@/components/home/StartHere";
import { HomeHero } from "@/components/home/HomeHero";
import { TripEssentials } from "@/components/destination/TripEssentials";
import { EditorialCard, PlaceCard, SectionHead, SectionLink, SwipeRow, Thumb } from "@/components/ui-kit";
import planImg from "@/assets/thumbs/plan.jpg";
import mapImg from "@/assets/thumbs/map.jpg";
import carImg from "@/assets/thumbs/car.jpg";
import roadImg from "@/assets/thumbs/road.jpg";
import flightImg from "@/assets/thumbs/flight.jpg";
import rvImg from "@/assets/thumbs/rv.jpg";
import {
  getHomepageDestinations,
  type HomepageDestination,
} from "@/lib/data/destinations.functions";

export const Route = createFileRoute("/")({
  loader: async (): Promise<{ homeDestinations: HomepageDestination[] }> => ({
    homeDestinations: await getHomepageDestinations().catch((err) => {
      console.error("[/] getHomepageDestinations failed", err);
      return [];
    }),
  }),
  head: () => ({
    meta: [
      { title: HUB_SEO.home.title },
      { name: "description", content: HUB_SEO.home.description },
      { property: "og:title", content: HUB_SEO.home.title },
      { property: "og:description", content: HUB_SEO.home.description },
      { property: "og:url", content: "https://minialife.com/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://minialife.com/" }, ...hreflangLinks("/", ["en", "de"])],
  }),
  component: HomePage,
});




const stayTypes: { name: string; category: ServicePhotoCategory; tag: string; why: string; price: string }[] = [
  { name: <T>In or by the park</T>, category: "hotel", tag: "national_park", why: <T>Shortest drive to trailheads; books up first.</T>, price: <T>Est. from $110/night</T> },
  { name: <T>Nearby town cabin</T>, category: "cabin", tag: "mountain", why: <T>More space and a kitchen for groups.</T>, price: <T>Est. from $120/night</T> },
  { name: <T>RV & camping</T>, category: "rvpark", tag: "rv_road_trip", why: <T>Outdoor sites for tents and RVs; facilities and fees vary.</T>, price: <T>Est. from $35/night</T> },
];

const why = [
  { img: planImg, title: <T>Free trip plans</T>, text: <T>Day-by-day itineraries you can use without an account.</T> },
  { img: mapImg, title: <T>Real route maps</T>, text: <T>Airport drives and stops drawn on an actual map.</T> },
  { img: carImg, title: <T>Trusted partners</T>, text: <T>Rentals, stays and tours from approved travel partners.</T> },
  { img: roadImg, title: <T>Independent guides</T>, text: <T>Written by MiniaLife, not paid placements.</T> },
];

function HomePage() {
  const { homeDestinations } = Route.useLoaderData();
  const featured = homeDestinations.slice(0, 5);
  const used = new Set(featured.map((d) => d.heroImage));
  const fallbacks = [roadImg, mapImg, rvImg, flightImg];
  const loopImage = (stops: readonly string[], i: number) => { const hit = homeDestinations.find((d) => stops.includes(d.slug) && !used.has(d.heroImage))?.heroImage; if (hit) { used.add(hit); return hit; } return fallbacks[i % fallbacks.length]; };

  return (
    <div className="bg-background">
      <Header />
      <HomeHero />
      <StartHere parkImage={homeDestinations[0]?.heroImage} />

      {featured.length > 0 && (
        <section id="destinations" className="section-y border-t border-border">
          <div className="container-page">
            <SectionHead kicker={<T>Popular right now</T>} title={<T>Where travelers are headed</T>} action={<SectionLink to="/destinations"><T>All destinations</T></SectionLink>} />
            <SwipeRow className="md:grid-cols-4 md:grid-rows-2">
              {featured.map((d, i) => (
                <div key={d.slug} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
                  <PlaceCard to="/destinations/$slug" params={{ slug: d.slug }} image={d.heroImage} alt={d.name} large={i === 0}
                    badges={[d.bestSeason ? `Best: ${d.bestSeason}` : null, d.tripDurationDays].filter((x): x is string => !!x)}
                    title={d.name} info={d.region} action={<T>See the plan</T>} />
                </div>
              ))}
            </SwipeRow>
          </div>
        </section>
      )}

      <HomeExperiences />

      <section className="section-y bg-card">
        <div className="container-page">
          <SectionHead kicker={<T>Road trip loops</T>} title={<T>Multi-park routes, planned for you</T>} action={<SectionLink to="/road-trips"><T>All loops</T></SectionLink>} />
          <SwipeRow className="md:grid-cols-2 lg:grid-cols-4">
            {LOOPS.slice(0, 4).map((l, i) => (
              <PlaceCard key={l.slug} to="/road-trips/$slug" params={{ slug: l.slug }} image={loopImage(l.stops, i)} alt={`${l.title} route scenery`}
                badges={[`${l.stops.length} stops`, l.region]} title={l.title} summary={l.intro} action={<T>See the route</T>} />
            ))}
          </SwipeRow>
        </div>
      </section>

      <section id="rentals-gear" className="section-y">
        <div className="container-page">
          <RentalsFeature />
        </div>
      </section>

      <section id="stay-types" className="section-y bg-card">
        <div className="container-page">
          <SectionHead kicker={<T>Where to stay</T>} title={<T>Pick the stay that fits your trip</T>} action={<SectionLink to="/destinations"><T>Browse places</T></SectionLink>} />
          <SwipeRow className="md:grid-cols-3">
            {stayTypes.map((s) => {
              const photo = servicePhoto(s.category, "homepage-stays");
              return photo ? (
                <figure key={s.name} className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
                  <Link to="/destinations" search={{ tag: s.tag } as never} className="group flex flex-1 flex-col">
                    <div className="aspect-[16/10] overflow-hidden"><img src={photo.url} alt={`${photo.subject} — illustrative photo`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl">{s.name}</h3>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.why}</p>
                      <p className="mt-4 text-lg font-semibold">{s.price} <span className="text-[11px] font-normal text-muted-foreground"><T>typical rate · confirm with partner</T></span></p>
                    </div>
                  </Link>
                  <PhotoCredit photo={photo} className="absolute right-2 top-2" />
                </figure>
              ) : null;
            })}
          </SwipeRow>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <SectionHead kicker={<T>Trip guides</T>} title={<T>Guides for the way you travel</T>} action={<SectionLink to="/trip-guides"><T>All trip guides</T></SectionLink>} />
          <SwipeRow className="md:grid-cols-3">
            <EditorialCard to="/fly-and-drive" image={flightImg} title={<T>Fly & Drive</T>} summary={<T>Land at the nearest airport, pick up a car and reach the park the same day.</T>} action={<T>Plan a fly-in trip</T>} />
            <EditorialCard to="/no-reservation" image={roadImg} title={<T>No reservation needed</T>} summary={<T>Parks you can visit without timed-entry permits, with current notes.</T>} action={<T>See open parks</T>} />
            <EditorialCard to="/rv-camping" image={rvImg} title={<T>RV & camping</T>} summary={<T>Where to pick up an RV and which places suit campers best.</T>} action={<T>Plan an RV trip</T>} />
          </SwipeRow>
        </div>
      </section>

      <section className="section-y bg-card">
        <div className="container-page">
          <TripEssentials context={{ slug: "homepage", name: <T>your road trip</T> }} />
          <div className="mt-2"><SectionLink to="/gear"><T>Go to the Gear Shop</T></SectionLink></div>
        </div>
      </section>

      <section className="section-y border-t border-border">
        <div className="container-page">
          <SectionHead kicker={<T>Why MiniaLife</T>} title={<T>Plan with confidence</T>} />
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((w) => <li key={w.title} className="flex items-start gap-4"><Thumb src={w.img} size={64} /><div><h3 className="text-lg">{w.title}</h3><p className="mt-1 text-sm text-muted-foreground">{w.text}</p></div></li>)}
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* =========================================================
   SHARED
========================================================= */
export function DestinationCard({
  d,
  aspect,
  titleClass,
}: {
  d: HomepageDestination;
  aspect: string;
  titleClass: string;
}) {
  const meta = [d.tripDurationDays, d.bestSeason]
    .filter((v): v is string => Boolean(v))
    .join(" · ");

  return (
    <Link to="/destinations/$slug" params={{ slug: d.slug }} className="group block">
      <div className={`relative ${aspect} overflow-hidden rounded-lg`}>
        <img
          src={d.heroImage}
          alt={d.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-off-white">
          <p className="text-xs uppercase tracking-wider text-off-white/80">{d.region}</p>
          <h3 className={`mt-1 font-bold ${titleClass}`}>{d.name}</h3>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-2 text-sm">
        <span className="text-foreground/70">{meta}</span>
        <span className="font-semibold text-foreground/80 group-hover:text-foreground group-hover:underline">
          <T>Plan a trip</T> <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
