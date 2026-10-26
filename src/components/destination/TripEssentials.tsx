import { useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { catalogPrice, gearShopLink } from '@/lib/data/rockbrosGear';
import { selectTripEssentials, type EssentialsContext } from '@/lib/data/tripEssentials';
import { TRIP_ESSENTIALS_REVIEWED } from '@/lib/data/tripEssentials.catalog';
import { SafeImage } from '@/components/shared/SafeImage';
import { wildguarderLink, wildguarderPrice, WILDGUARDER_REVIEW_DATE } from '@/lib/data/gearCategories';

export function TripEssentials({ context }: { context: EssentialsContext }) {
  const { products, binocular } = selectTripEssentials(context);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  function move(direction: number) {
    const row = track.current;
    const card = row?.firstElementChild;
    if (!row || !card) return;
    row.scrollBy({ left: direction * (card.getBoundingClientRect().width + 16), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function onScroll() {
    const row = track.current;
    const card = row?.firstElementChild;
    if (row && card) setActive(Math.min(4, Math.round(row.scrollLeft / (card.getBoundingClientRect().width + 16))));
  }
  return (
    <section id="trip-gear" aria-label={`Trip essentials for ${context.name}`} className="min-w-0">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-sage-deep">Curated Trip Essentials</p>
          <h2 className="mt-2 break-words font-display text-2xl text-foreground md:text-[28px]">Five picks for {context.name}</h2>
        </div>
        <div className="flex shrink-0 gap-1 lg:hidden">
          <Button variant="outline" size="icon" aria-label="Previous trip essential" title="Previous product" disabled={active === 0} onClick={() => move(-1)}><ChevronLeft /></Button>
          <Button variant="outline" size="icon" aria-label="Next trip essential" title="Next product" disabled={active === 4} onClick={() => move(1)}><ChevronRight /></Button>
        </div>
      </div>
      <div ref={track} onScroll={onScroll} tabIndex={0} role="region" aria-label="Recommended trip equipment" className="gear-carousel lg:grid-flow-row lg:grid-cols-5 lg:overflow-visible lg:pb-0">
        {products.map(product => (
          <article key={product.id} data-product-id={product.id} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
            <a href={gearShopLink(product, `trip-${context.slug}`)} target="_blank" rel="sponsored nofollow noopener noreferrer" aria-label={`View ${product.name} at ROCKBROS`} className="block aspect-square p-5">
              <SafeImage src={product.image} alt={product.catalogTitle} width={400} height={300} loading="lazy" className="h-full w-full object-contain" />
            </a>
            <div className="flex flex-1 flex-col p-4 pt-0">
              <p className="text-[11px] font-semibold text-sage-deep">{product.purpose}</p>
              <h3 className="mt-2 text-base font-semibold leading-snug text-foreground">{product.name}</h3>
              <p className="mb-4 mt-2 text-xs leading-relaxed text-muted-foreground">{product.description}</p>
              <div className="mt-auto">
                <p className="mb-3 text-base font-semibold text-foreground">{catalogPrice(product)} <span className="text-[10px] font-normal text-muted-foreground">USD · catalog price</span></p>
                <Button asChild className="h-auto min-h-12 w-full whitespace-normal rounded-md px-2 text-xs">
                  <a href={gearShopLink(product, `trip-${context.slug}`)} target="_blank" rel="sponsored nofollow noopener noreferrer">Shop at ROCKBROS <ArrowRight className="h-3.5 w-3.5 shrink-0" /></a>
                </Button>
              </div>
            </div>
          </article>
        ))}
        <article data-product-id={`wildguarder-${binocular.id}`} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
          <a href={wildguarderLink(binocular.url, `trip-${context.slug}`)} target="_blank" rel="sponsored nofollow noopener noreferrer" aria-label={`View ${binocular.name} at WILDGUARDER`} className="block aspect-square p-5">
            <SafeImage src={binocular.image} alt={binocular.name} width={400} height={300} loading="lazy" className="h-full w-full object-contain" />
          </a>
          <div className="flex flex-1 flex-col p-4 pt-0">
            <p className="text-[11px] font-semibold text-sage-deep">Wildlife & night viewing</p>
            <h3 className="mt-2 text-base font-semibold leading-snug text-foreground">{binocular.name}</h3>
            <p className="mb-4 mt-2 text-xs leading-relaxed text-muted-foreground">{binocular.spec}. Check park rules before using lights at night.</p>
            <div className="mt-auto">
              <p className="mb-3 text-base font-semibold text-foreground">{wildguarderPrice(binocular)} <span className="text-[10px] font-normal text-muted-foreground">USD · store price</span></p>
              <Button asChild className="h-auto min-h-12 w-full whitespace-normal rounded-md px-2 text-xs">
                <a href={wildguarderLink(binocular.url, `trip-${context.slug}`)} target="_blank" rel="sponsored nofollow noopener noreferrer">Shop at WILDGUARDER <ArrowRight className="h-3.5 w-3.5 shrink-0" /></a>
              </Button>
            </div>
          </div>
        </article>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Optional picks, not a complete packing or safety list. Photos from the ROCKBROS and WILDGUARDER stores. Prices as of {TRIP_ESSENTIALS_REVIEWED} / {WILDGUARDER_REVIEW_DATE}; price, stock and shipping may change.</p>
    </section>
  );
}
