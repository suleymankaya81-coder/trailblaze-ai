import { ArrowUpRight, BedDouble, Home, MapPin, Mountain, Plane, Trees } from "lucide-react";
import { buildVrboSearchUrl } from "@/lib/affiliates/vrbo";
import { buildExpediaHotelSearchUrl } from "@/lib/affiliates/expedia";

type Point = { icon: typeof Home; text: string };

function StayCard({
  brand,
  title,
  href,
  cta,
  points,
}: {
  brand: string;
  title: string;
  href: string;
  cta: string;
  points: Point[];
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">{brand}</p>
      <h3 className="mt-1 text-lg font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 flex-1 space-y-2.5">
        {points.map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-2.5 text-sm text-muted-foreground">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            {text}
          </li>
        ))}
      </ul>
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        {cta} <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}

/** Vrbo (cabins) + Expedia (hotels) side by side, both tracked searches for this destination. */
export function VrboSearchWidget({ destinationName }: { destinationName: string }) {
  return (
    <div className="mt-6">
      <div className="grid gap-4 md:grid-cols-2">
        <StayCard
          brand="Vrbo"
          title={`Cabins & vacation rentals near ${destinationName}`}
          href={buildVrboSearchUrl(destinationName)}
          cta="See cabins on Vrbo"
          points={[
            { icon: Mountain, text: "Whole-home cabins and mountain lodges" },
            { icon: Trees, text: "Kitchens, fire pits and room for the crew" },
            { icon: Home, text: "Pick dates on Vrbo for live prices" },
          ]}
        />
        <StayCard
          brand="Expedia"
          title={`Hotels & lodges near ${destinationName}`}
          href={buildExpediaHotelSearchUrl(destinationName)}
          cta="See hotels on Expedia"
          points={[
            { icon: MapPin, text: "Hotels in nearby gateway towns" },
            { icon: BedDouble, text: "Resorts, inns and last-minute rooms" },
            { icon: Plane, text: "Easy to pair with flights and cars" },
          ]}
        />
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Opens Vrbo's or Expedia's own search. Minialife may earn a commission on bookings, at no extra cost to you.
      </p>
    </div>
  );
}
