import { ArrowUpRight } from "lucide-react";
import type { Photo } from "@/lib/data/destinationCardPhotos";

export function PartnerPhotoCard({ brand, title, href, photo, detail }: { brand: string; title: string; href: string; photo: Photo; detail?: string }) {
  return (
    <figure className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition hover:shadow-soft">
      <a href={href} target="_blank" rel="sponsored nofollow noopener noreferrer" title={`Opens ${brand} in a new tab — partner link`} className="group flex flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img src={photo.url} alt={`${photo.subject} — illustrative photo, not partner inventory`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Partner link · {brand}</p>
          <h3 className="mt-1 text-sm font-semibold text-foreground">{title}</h3>
          {detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}
          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-primary">Check on {brand} <ArrowUpRight className="h-3.5 w-3.5" /></span>
        </div>
      </a>
      <figcaption className="border-t border-border px-5 py-2 text-[10px] text-muted-foreground">
        Illustrative photo · <a href={photo.source} target="_blank" rel="noopener noreferrer" className="underline" title={`${photo.subject} · ${photo.license}`}>{photo.credit} · {photo.license}</a>
      </figcaption>
    </figure>
  );
}