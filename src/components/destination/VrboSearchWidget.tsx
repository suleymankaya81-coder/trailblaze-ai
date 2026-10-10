/** Vrbo stays search (Expedia Group Creator Network, Partnerize camref 1110lRsGV). */
const SRC =
  "https://creator.expediagroup.com/products/widgets/search-widget?program=us-vrbo&lobs=stays&network=pz&camref=1110lRsGV&instance=minialife";

export function VrboSearchWidget({ destinationName }: { destinationName: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground">
        Search cabins & vacation homes near {destinationName} on Vrbo
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Live availability from Vrbo. Minialife may earn a commission on bookings.
      </p>
      <iframe
        title={`Search Vrbo stays near ${destinationName}`}
        src={SRC}
        loading="lazy"
        className="mt-4 h-[320px] w-full border-0"
      />
    </div>
  );
}
