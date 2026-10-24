import { PhotoCredit } from "@/components/shared/PhotoCredit";
import { ArrowUpRight } from "lucide-react";
import type { Photo } from "@/lib/data/destinationCardPhotos";

export function PartnerPhotoCard({ brand, title, href, photo, detail, price, badges, cta }: { price?: string; badges?: string[]; cta?: string; brand: string; title: string; href: string; photo: Photo; detail?: string }) {
  return (
    <figure className="relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition hover:shadow-soft">
      <a href={href} target="_blank" rel="sponsored nofollow noopener noreferrer" title={`Opens ${brand} in a new tab — partner link`} className="group flex flex-1 flex-col"
        onClick={(event) => {
          // The existing Drive script rewrites short-link hrefs; retain the supplied tracked destination.
          event.preventDefault();
          window.open(href, "_blank", "noopener,noreferrer");
        }}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img src={photo.url} alt={`${photo.subject} — illustrative photo, not partner inventory`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          {badges && badges.length > 0 && (
            <ul className="mb-2 flex flex-wrap gap-1.5">
              {badges.map((b) => <li key={b} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">✓ {b}</li>)}
            </ul>
          )}
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Partner link · {brand}</p>
          <h3 className="mt-1 text-sm font-semibold text-foreground">{title}</h3>
          {price && <p className="mt-1 font-display text-base font-semibold text-foreground">{price} <span className="text-[10px] font-normal text-muted-foreground">· typical rate, live price on {brand}</span></p>}
          {detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}
          <span className="mt-4 inline-flex min-h-12 items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground">{cta ?? `Check on ${brand}`} <ArrowUpRight className="h-3.5 w-3.5 shrink-0" /></span>
        </div>
      </a>
      <PhotoCredit photo={photo} className="absolute right-2 top-2" />
    </figure>
  );
}