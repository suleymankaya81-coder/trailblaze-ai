import { ArrowUpRight, Car, Plane, Smartphone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { servicePhoto, airportRentalPhoto, estimatedFrom } from "@/lib/data/servicePhotos";
import { corridorPartnerLinks } from "@/lib/affiliates/corridorPartners";
import { BOOKING_STEPS } from "@/lib/affiliates/bookingSteps";
import { useQuery } from "@tanstack/react-query";
import { getFlightPrice } from "@/lib/affiliates/flights.functions";
import { flightFareBadge } from "@/lib/affiliates/flightFare";

export function CorridorBookings({ slug, airport, city }: { slug: string; airport: string; city: string }) {
  const links = corridorPartnerLinks(slug);
  const step = (k: (typeof BOOKING_STEPS)[number]["key"]) => BOOKING_STEPS.findIndex((s) => s.key === k) + 1;
  const { data: fare } = useQuery({
    queryKey: ["flight-price", airport],
    queryFn: () => getFlightPrice({ data: { airport } }),
    staleTime: 60 * 60 * 1000,
  });
  const fareBadge = flightFareBadge(fare?.price);
  const badges: Record<string, string[]> = {
    flight: fareBadge ? [fareBadge] : [],
    motorhome: ["Compare RV & campervan suppliers"],
    car: [`Compare suppliers at ${airport}`, "Free cancellation on many rates"],
    esim: [],
  };
  const prices: Record<string, string | null> = { flight: null, motorhome: estimatedFrom("motorhome"), car: estimatedFrom("car"), esim: null };
  const items = [
    { key: "flight", step: step("flight"), icon: Plane, title: `Flights to ${airport}`, brand: "Aviasales", cta: `Find flights to ${airport}`, detail: "Compare arrival dates before fixing your first night.", href: links.flight, photo: servicePhoto("flight", slug) },
    { key: "motorhome", step: step("vehicle"), icon: Truck, title: "Motorhome or campervan", brand: "Motorhome Republic", cta: `Compare RVs near ${airport}`, detail: "Professional fleets; check pickup hours and park vehicle limits.", href: links.motorhome, photo: servicePhoto("rv", slug) },
    { key: "car", step: step("vehicle"), icon: Car, title: `Car or SUV at ${airport}`, brand: "Airport Rentals", cta: `Compare cars at ${airport}`, detail: `Choose ${airport} pickup, dates and a standard car or SUV; live prices on the partner site.`, href: links.car, photo: airportRentalPhoto("car", slug) },
    { key: "esim", step: null, icon: Smartphone, title: "Mobile data for the U.S.", brand: "Airalo", cta: "Get a U.S. eSIM", detail: "Check phone compatibility; download maps before entering the parks.", href: links.esim, photo: null },
  ];
  return <>
    <div className="travel-card-row sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => <article key={item.key} className={`flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card ${item.key === "motorhome" ? "border-primary" : "border-border"}`}>
        {item.photo ? <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img src={item.photo.url} alt={`${item.photo.subject} — illustrative`} loading="lazy" className="h-full w-full object-cover" />
          <a href={item.photo.source} target="_blank" rel="noopener noreferrer" title={`${item.photo.credit} · ${item.photo.license}`} aria-label={`Photo credit: ${item.photo.credit}, ${item.photo.license}`} className="absolute bottom-1.5 right-1.5 rounded bg-background/80 px-1.5 text-[10px] text-muted-foreground">©</a>
        </div> : <div className="flex aspect-[4/3] items-center justify-center bg-muted"><item.icon className="h-12 w-12 text-primary" /></div>}
        <div className="flex flex-1 flex-col p-4">
          <p className="flex items-center gap-2 text-[10px] uppercase text-muted-foreground">{item.step ? <><span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{item.step}</span>Step {item.step} · </> : "Before you go · "}{item.brand}</p>
          {prices[item.key] ? <p className="mt-2 font-display text-base font-semibold text-foreground">{prices[item.key]} <span className="text-[10px] font-normal text-muted-foreground">· typical rate</span></p> : null}
          {badges[item.key]?.length ? <ul className="mt-2 flex flex-wrap gap-1.5">{badges[item.key].map((b) => <li key={b} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">✓ {b}</li>)}</ul> : null}
          <h3 className="mt-2 font-display text-base font-semibold text-foreground">{item.title}</h3>
          <p className="mb-5 mt-2 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
          <Button asChild size="sm" className="mt-auto h-auto min-h-12 whitespace-normal rounded-lg py-2 text-center"><a href={item.href} target="_blank" rel="sponsored nofollow noopener noreferrer" onClick={(e) => { e.preventDefault(); window.open(item.href, "_blank", "noopener,noreferrer"); }}>{item.cta}<ArrowUpRight /></a></Button>
        </div>
      </article>)}
    </div>
    <p className="mt-4 text-xs text-muted-foreground">Next: choose your overnight stops, then tours and trip essentials below. Photos are illustrative. We may earn a commission from partner links, at no extra cost to you; prices and availability are confirmed on the provider's site ({city}).</p>
  </>;
}
