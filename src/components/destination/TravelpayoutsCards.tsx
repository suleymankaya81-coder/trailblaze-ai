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

export function TravelpayoutsCards({ slug, name, airportCode }: { slug: string; name: string; airportCode: string | null }) {
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

  const getThere: Item[] = [
    { brand: "aviasales", name: "Aviasales", title: `Flights to${at || ` ${name}`}`, sub: flightSub, icon: Plane },
  ];
  return (
    <div className="mt-8">
      <Group title="Getting there & getting around" items={getThere} slug={slug} rentals airportCode={airportCode} />
    </div>
  );
}

export function TourTicketCards({ slug, name }: { slug: string; name: string }) {
  const doIt: Item[] = [
    { brand: "klook", name: "Klook", title: `Tours near ${name}`, sub: "Guided tours, day trips and attraction deals", icon: Ticket },
    { brand: "tiqets", name: "Tiqets", title: "Tickets & attractions", sub: "Instant mobile tickets for nearby sights", icon: Ticket },
    ...(nearGoCity(slug) ? [{ brand: "gocity" as const, name: "Go City", title: "City attraction pass", sub: "One pass for the gateway city's top sights", icon: Building2 }] : []),
  ];
  return (
    <div className="mt-8">
      <Group title="More tours & ticket partners" items={doIt} slug={slug} />
    </div>
  );
}
