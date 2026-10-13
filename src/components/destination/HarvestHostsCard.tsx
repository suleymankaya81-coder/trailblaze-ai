import { useState } from "react";
import { ArrowRight, Check, Copy, Tent } from "lucide-react";

export const HARVEST_HOSTS_CODE = "MINIALIFE20";
// Awin tracked link supplied by Harvest Hosts (advertiser 111454); applies the code automatically.
export const HARVEST_HOSTS_URL =
  "https://www.awin1.com/cread.php?awinmid=111454&awinaffid=3100034&ued=" +
  encodeURIComponent(`https://www.harvesthosts.com/?utm_content=${HARVEST_HOSTS_CODE}&show_code=true`);

export function HarvestHostsCard({ destinationName }: { destinationName: string }) {
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
    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
        <Tent className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Traveling by RV near {destinationName}?</p>
        <h3 className="font-semibold text-foreground">Stay overnight free at wineries, farms & breweries</h3>
        <p className="text-sm text-muted-foreground">
          Harvest Hosts membership: 5,000+ unique RV stops. Minialife readers get 20% off the first year.
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
        <p className="text-[10px] text-muted-foreground">Partner link · Harvest Hosts</p>
      </div>
    </div>
  );
}
