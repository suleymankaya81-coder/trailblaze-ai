import { ArrowUpRight, Car, Plane, Smartphone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { servicePhoto } from "@/lib/data/servicePhotos";
import { corridorPartnerLinks } from "@/lib/affiliates/corridorPartners";

export function CorridorBookings({ slug, airport, city }: { slug: string; airport: string; city: string }) {
  const links = corridorPartnerLinks(slug);
  const items = [
    { key: "flight", icon: Plane, title: `Flights to ${city} · ${airport}`, brand: "Aviasales", detail: "Compare arrival dates before fixing your first night.", href: links.flight, photo: servicePhoto("flight", slug) },
    { key: "motorhome", icon: Truck, title: "Take the loop by motorhome", brand: "Motorhome Republic", detail: "Compare professional fleets; check pickup hours and park vehicle limits.", href: links.motorhome, photo: servicePhoto("rv", slug) },
    { key: "car", icon: Car, title: "Prefer a car + hotel road trip?", brand: "EconomyBookings", detail: `Choose ${airport} pickup and return for your loop. Check the rental terms.`, href: links.car, photo: servicePhoto("car", slug) },
    { key: "airport", icon: Car, title: `Airport car rental at ${airport}`, brand: "Airport Rentals", detail: "Compare airport desks and on-site pickup for a same-airport return.", href: links.airportRentals },
    { key: "esim", icon: Smartphone, title: "Mobile data for your U.S. trip", brand: "Airalo", detail: "Check phone compatibility and U.S. coverage. Download maps before entering the parks.", href: links.esim },
  ];
  return <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => <article key={item.key} className={`flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card ${item.key === "motorhome" ? "border-primary" : "border-border"}`}>
        {item.photo ? <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img src={item.photo.url} alt={`${item.photo.subject} — illustrative, not rental inventory`} loading="lazy" className="h-full w-full object-cover" />
          {item.key === "motorhome" && <span className="absolute left-3 top-3 rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">RV & campervan choice</span>}
        </div> : <div className="flex aspect-[16/9] items-center justify-center bg-sky/15"><Smartphone className="h-12 w-12 text-primary" /></div>}
        <div className="flex flex-1 flex-col p-4">
          <p className="text-[10px] uppercase text-muted-foreground">Partner link · {item.brand}</p>
          <h3 className="mt-2 font-display text-base font-semibold text-foreground">{item.title}</h3>
          <p className="mb-5 mt-2 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
          <Button asChild size="sm" className="mt-auto h-auto min-h-9 whitespace-normal rounded-lg py-2 text-center"><a href={item.href} target="_blank" rel="sponsored nofollow noopener noreferrer" onClick={(e) => { e.preventDefault(); window.open(item.href, "_blank", "noopener,noreferrer"); }}>Check {item.brand}<ArrowUpRight /></a></Button>
        </div>
        {item.photo && <p className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">Illustrative · <a href={item.photo.source} target="_blank" rel="noopener noreferrer" className="underline">{item.photo.credit} · {item.photo.license}</a></p>}
      </article>)}
    </div>
    <p className="mt-4 text-xs text-muted-foreground">We may earn a commission from partner links, at no extra cost to you. Select {city} on the provider’s site; prices and availability are confirmed there.</p>
  </>;
}