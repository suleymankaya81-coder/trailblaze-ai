import type { Photo } from "@/lib/data/destinationCardPhotos";

// Compact © credit: full author/licence on hover and in the link target, without crowding the card.
export function PhotoCredit({ photo, className = "absolute bottom-1.5 right-1.5" }: { photo: Pick<Photo, "source" | "credit" | "license">; className?: string }) {
  return (
    <a href={photo.source} target="_blank" rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={`Illustrative photo: ${photo.credit} · ${photo.license}`}
      aria-label={`Illustrative photo credit: ${photo.credit}, ${photo.license}`}
      className={`${className} z-10 rounded bg-background/70 px-1.5 py-0.5 text-[9px] leading-none text-muted-foreground opacity-80 hover:opacity-100`}>
      ©
    </a>
  );
}
