import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Bike, Car, Plane, Ticket, Building2 } from "lucide-react";
import { tpLink, nearGoCity, type TpBrand } from "@/lib/affiliates/travelpayouts";
import { getFlightPrice } from "@/lib/affiliates/flights.functions";
import { servicePhoto, type ServicePhotoCategory } from "@/lib/data/servicePhotos";
import { PartnerPhotoCard } from "./PartnerPhotoCard";
import { offerPhoto } from "@/lib/data/destinationCardPhotos";
import { AirportRentalsCards } from "./AirportRentalsCards";

type Item = { brand: TpBrand; name: string; title: string; sub: string; icon: typeof Plane };

function Card({ item, slug }: { item: Item; slug: string }) {
  const Icon = item.icon;
  const categories: Partial<Record<TpBrand, ServicePhotoCategory>> = { aviasales: "flight", economybookings: "car", qeeq: "car", bikesbooking: "bike", klook: "tour", tiqets: "attraction", gocity: "attraction" };
  const category = categories[item.brand];
  const photo = item.brand === "klook" ? offerPhoto(slug, "activity", 0) ?? servicePhoto("tour", slug) : category ? servicePhoto(category, slug, item.brand === "qeeq" || item.brand === "gocity" ? 1 : 0) : undefined;
  if (photo) return <PartnerPhotoCard brand={item.name} title={item.title} href={tpLink(item.brand, slug)} photo={photo} detail={item.brand === "aviasales" && item.sub.startsWith("Recent fares") ? item.sub : undefined} />;
  return (
    <a
      href={tpLink(item.brand, slug)}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      title={`Opens ${item.name} in a new tab`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:shadow-soft"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-1 text-sm font-semibold text-foreground">{item.title}</p>
      <p className="mt-1 flex-1 text-xs text-muted-foreground">{item.sub}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        Check on {item.name} <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}

function Group({ title, items, slug, airportCode, rentals = false }: { title: string; items: Item[]; slug: string; airportCode?: string | null; rentals?: boolean }) {
  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="travel-card-row sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => <Card key={i.brand} item={i} slug={slug} />)}
        {rentals && <AirportRentalsCards slug={slug} airportCode={airportCode} />}
      </div>
    </div>
  );
}

/** Flight + airport car cards as bare grid items, so they sit in the same row as the RV cards. */
export function GettingThereItems({ slug, name, airportCode }: { slug: string; name: string; airportCode: string | null }) {
  const { data: fare } = useQuery({
    queryKey: ["flight-price", airportCode],
    queryFn: () => airportCode ? getFlightPrice({ data: { airport: airportCode } }) : Promise.resolve(null),
    enabled: !!airportCode,
    staleTime: 60 * 60 * 1000,
  });
  const at = airportCode ? ` ${airportCode}` : "";
  const flightSub = fare?.price
    ? `Recent fares from ~$${Math.round(fare.price)}${fare.origin ? ` (from ${fare.origin})` : ""} · estimate`
    : `Compare fares into${at || " the nearest airport"}`;
  const item: Item = { brand: "aviasales", name: "Aviasales", title: `Flights to${at || ` ${name}`}`, sub: flightSub, icon: Plane };
  return (
    <>
      <Card item={item} slug={slug} />
      <AirportRentalsCards slug={slug} airportCode={airportCode} />
    </>
  );
}

export function TravelpayoutsCards({ slug, name, airportCode }: { slug: string; name: string; airportCode: string | null }) {
  return (
    <div className="mt-8">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Getting there & getting around</h3>
      <div className="travel-card-row sm:grid-cols-2 lg:grid-cols-4"><GettingThereItems slug={slug} name={name} airportCode={airportCode} /></div>
    </div>
  );
}

// Typical "from" prices, always labelled as typical on the card.
const TOUR_PRICE: Partial<Record<TpBrand, string>> = { klook: "Est. from $35", tiqets: "Est. from $20", gocity: "Est. from $79" };

/** Tour/ticket partner cards as bare grid items for the activities row. */
export function TourTicketItems({ slug, name }: { slug: string; name: string }) {
  const doIt: Item[] = [
    { brand: "klook", name: "Klook", title: `Tours near ${name}`, sub: "Guided tours, day trips and attraction deals", icon: Ticket },
    { brand: "tiqets", name: "Tiqets", title: "Tickets & attractions", sub: "Instant mobile tickets for nearby sights", icon: Ticket },
    ...(nearGoCity(slug) ? [{ brand: "gocity" as const, name: "Go City", title: "City attraction pass", sub: "One pass for the gateway city's top sights", icon: Building2 }] : []),
  ];
  return <>{doIt.map((i) => <TourCard key={i.brand} item={i} slug={slug} />)}</>;
}

function TourCard({ item, slug }: { item: Item; slug: string }) {
  const categories: Partial<Record<TpBrand, ServicePhotoCategory>> = { klook: "tour", tiqets: "attraction", gocity: "attraction" };
  const photo = item.brand === "klook" ? offerPhoto(slug, "activity", 0) ?? servicePhoto("tour", slug) : servicePhoto(categories[item.brand] ?? "attraction", slug, item.brand === "gocity" ? 1 : 0);
  if (!photo) return <Card item={item} slug={slug} />;
  return <PartnerPhotoCard brand={item.name} title={item.title} href={tpLink(item.brand, slug)} photo={photo} detail={item.sub} price={TOUR_PRICE[item.brand]} />;
}

export function TourTicketCards({ slug, name }: { slug: string; name: string }) {
  return (
    <div className="mt-8">
      <h3 className="mb-3 text-sm font-semibold text-foreground">More tours & ticket partners</h3>
      <div className="travel-card-row sm:grid-cols-2 lg:grid-cols-4"><TourTicketItems slug={slug} name={name} /></div>
    </div>
  );
}
