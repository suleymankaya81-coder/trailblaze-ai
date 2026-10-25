import { ArrowUpRight, BedDouble, Home, MapPin, Mountain, Plane, Trees } from "lucide-react";
import { buildVrboSearchUrl } from "@/lib/affiliates/vrbo";
import { buildExpediaHotelSearchUrl } from "@/lib/affiliates/expedia";
import { servicePhoto } from "@/lib/data/servicePhotos";

type Point = { icon: typeof Home; text: string };
type Pic = { url: string; source: string; credit: string; license: string };

// Illustrative Commons photos (not actual listings); picked per destination so pages vary.
const CABINS: Pic[] = [
  { url: "/images/destination-cards/691f1c88879c4a44.jpg", source: "https://commons.wikimedia.org/wiki/File:Monongahela_National_Forest_-_Middle_Mountain_Cabins.jpg", credit: "Brian M. Powell", license: "CC BY-SA 3.0" },
  { url: "/images/destination-cards/cffc770c69bb63c1.jpg", source: "https://commons.wikimedia.org/wiki/File:Dawson%27s_Cabins,_Big_Bear_Lake,_Calif_(81845).jpg", credit: "Tichnor Brothers", license: "Public domain" },
  { url: "/images/destination-cards/1b08cebd8eed3485.jpg", source: "https://commons.wikimedia.org/wiki/File:Carriage_Motel_Cabins,_Cody,_Wyoming_LCCN2017710434.tif", credit: "John Margolies", license: "Public domain" },
];
const HOTELS: Pic[] = [
  { url: "/images/destination-cards/8c1244b0bcbdbf2a.jpg", source: "https://commons.wikimedia.org/wiki/File:Adirondack_Mountains,_Whiteface_Inn._(12660641684).jpg", credit: "Miami University Libraries", license: "No restrictions" },
  { url: "/images/destination-cards/2964233f4bb55299.jpg", source: "https://commons.wikimedia.org/wiki/File:Hampton_Inn_Gatlinburg_-_October_2023_-_Sarah_Stierch.jpg", credit: "Missvain", license: "CC BY 4.0" },
  { url: "/images/destination-cards/2fb61dd1ee0baf88.jpg", source: "https://commons.wikimedia.org/wiki/File:Manhattan_Hotel,_Salida_(2026)-104A8144.jpg", credit: "Frank Schulenburg", license: "CC BY-SA 4.0" },
  { url: "/images/destination-cards/7ff8cde9bccf9e6c.jpg", source: "https://commons.wikimedia.org/wiki/File:Hilton_San_Diego_Bayfront_Hotel.jpg", credit: "Bernard Gagnon", license: "CC BY-SA 3.0" },
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function StayCard({
  brand,
  title,
  href,
  cta,
  points,
  pic,
}: {
  brand: string;
  title: string;
  href: string;
  cta: string;
  points: Point[];
  pic: Pic;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[16/9] bg-muted">
        <img src={pic.url} alt={`Illustrative ${brand} stay photo`} loading="lazy" className="h-full w-full object-cover" />
        <a
          href={pic.source}
          target="_blank"
          rel="noopener noreferrer"
          title={`${pic.credit} · ${pic.license}`}
          aria-label={`Photo credit: ${pic.credit}, ${pic.license}`}
          className="absolute bottom-1.5 right-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground"
        >
          ©
        </a>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{brand}</p>
        <h3 className="mt-1 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1 font-display text-base font-semibold text-foreground">{brand === "Vrbo" ? "Est. from $120/night" : "Est. from $110/night"} <span className="text-[10px] font-normal text-muted-foreground">· typical rate</span></p>
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
    </div>
  );
}

/** Vrbo (cabins) + Expedia (hotels) side by side, both tracked searches for this destination. */
export function VrboSearchWidget({ destinationName }: { destinationName: string }) {
  const h = hash(destinationName);
  return (
    <div className="mt-6">
      <div className="grid gap-4 md:grid-cols-2">
        <StayCard
          brand="Vrbo"
          title={`Search cabins & vacation rentals near ${destinationName}`}
          href={buildVrboSearchUrl(destinationName)}
          cta="Search cabins on Vrbo"
          pic={servicePhoto("cabin", destinationName + ":vrbo") ?? CABINS[0]}
          points={[
            { icon: Mountain, text: "Whole-home cabins and mountain lodges" },
            { icon: Trees, text: "Kitchens, fire pits and room for the crew" },
            { icon: Home, text: "Pick dates on Vrbo for live prices" },
          ]}
        />
        <StayCard
          brand="Expedia"
          title={`Search hotels & lodges near ${destinationName}`}
          href={buildExpediaHotelSearchUrl(destinationName)}
          cta="Search hotels on Expedia"
          pic={servicePhoto("hotel", destinationName + ":expedia") ?? HOTELS[1]}
          points={[
            { icon: MapPin, text: "Hotels in nearby gateway towns" },
            { icon: BedDouble, text: "Resorts, inns and last-minute rooms" },
            { icon: Plane, text: "Easy to pair with flights and cars" },
          ]}
        />
      </div>
    </div>
  );
}
