import { PhotoCredit } from "@/components/shared/PhotoCredit";
import { useState } from "react";
import { ArrowRight, Check, Copy, Tent } from "lucide-react";
import { servicePhoto } from "@/lib/data/servicePhotos";
import { buildAwinLink } from "@/lib/affiliates/awin";

export const HARVEST_HOSTS_CODE = "MINIALIFE20";
// Awin tracked link supplied by Harvest Hosts (advertiser 111454); applies the code automatically.
export const HARVEST_HOSTS_URL = buildAwinLink(
  {
    id: "harvest-hosts-membership",
    partner: "harvest_hosts",
    networkMid: 111454,
    externalUrl: `https://www.harvesthosts.com/?utm_content=${HARVEST_HOSTS_CODE}&show_code=true`,
  },
  "harvest-hosts-membership",
);

type Pic = { url: string; source: string; credit: string; license: string };

// Illustrative Commons photos of RV stays (not actual Harvest Hosts locations); picked per destination so pages vary.
const RV_PICS: Pic[] = [
  { url: "/images/destination-cards/eac2699e68dbc82a.jpg", source: "https://commons.wikimedia.org/wiki/File:RV_Camping_at_Red_River_State_Recreation_Area,_East_Grand_Forks,_Minnesota_in_Autumn_(41036217362).jpg", credit: "Tony Webster", license: "CC BY 2.0" },
  { url: "/images/destination-cards/58226e5916704708.jpg", source: "https://commons.wikimedia.org/wiki/File:30-foot_Cruise_America_rental_RV,_Lake_Stickney,_2011.jpg", credit: "DimiTalen", license: "CC0" },
  { url: "/images/destination-cards/b93a42d71749bb74.jpg", source: "https://commons.wikimedia.org/wiki/File:Offroad_sprinter_vr_vans.jpg", credit: "Valentin Rehrl Van", license: "CC BY-SA 4.0" },
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function HarvestHostsCard({ destinationName }: { destinationName: string }) {
  const [copied, setCopied] = useState(false);
  const pic = servicePhoto("rvpark", destinationName + ":harvest-hosts") ?? RV_PICS[0];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(HARVEST_HOSTS_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: code stays visible */
    }
  };
  return (
    <div className="mt-6 flex flex-col overflow-hidden rounded-2xl border border-border bg-card md:flex-row">
      <div className="relative aspect-[16/9] bg-muted md:aspect-auto md:w-64 md:shrink-0">
        <img src={pic.url} alt="Illustrative RV overnight stop — not an actual Harvest Hosts location" loading="lazy" className="h-full w-full object-cover" />
        <PhotoCredit photo={pic} />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 md:flex-row md:items-center">
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground md:flex">
          <Tent className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Traveling by RV near {destinationName}?</p>
          <h3 className="font-semibold text-foreground">Stay overnight free at wineries, farms & breweries</h3>
          <p className="text-sm text-muted-foreground">
            Harvest Hosts membership: 5,000+ unique RV stops. MiniaLife readers get 20% off the first year.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
          <button type="button" onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-foreground">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : HARVEST_HOSTS_CODE}
          </button>
          <a href={HARVEST_HOSTS_URL} target="_blank" rel="sponsored nofollow noopener noreferrer" onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full bg-copper px-4 py-2 text-xs font-semibold text-off-white hover:bg-copper/90">
            Get 20% off <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

/** Discount note shown inside the Harvest Hosts stay card (replaces the separate banner on destination pages). */
export function HarvestHostsOffer() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(HARVEST_HOSTS_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: code stays visible */
    }
  };
  return (
    <div className="mt-3 rounded-md bg-secondary p-3">
      <p className="text-xs font-semibold text-foreground">Stay overnight free at wineries, farms & breweries</p>
      <p className="mt-1 text-xs text-muted-foreground">5,000+ unique RV stops. MiniaLife readers get 20% off the first year.</p>
      <button type="button" onClick={copy} className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-card px-3 py-1 text-xs font-semibold text-foreground">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : `Code ${HARVEST_HOSTS_CODE}`}
      </button>
    </div>
  );
}
