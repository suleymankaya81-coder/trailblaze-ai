import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type HeroSlide = {
  eyebrow: string;
  title: string;
  blurb: string;
  cta: string;
  image: string;
  href: string;
  badge?: string;
};

const AUTOPLAY_MS = 5000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });
  const [playing, setPlaying] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !playing) return;
    const id = setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [emblaApi, playing]);

  return (
    <section className="bg-background">
      {/* Promo / control bar — REI orange strip */}
      <div className="w-full bg-ember text-off-white">
        <div className="container-page flex items-center justify-between py-2.5 text-sm">
          <button
            onClick={scrollPrev}
            aria-label="Previous slide"
            className="rounded-full p-1 hover:bg-off-white/15"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="flex-1 text-center text-xs font-semibold md:text-sm">
            Free shipping on most orders over $60. Plan a trip — everything in one place.
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={scrollNext}
              aria-label="Next slide"
              className="rounded-full p-1 hover:bg-off-white/15"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause autoplay" : "Play autoplay"}
              className="ml-1 rounded-full border border-off-white/40 p-1 hover:bg-off-white/15"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Carousel viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s) => (
            <article
              key={s.title}
              className="min-w-0 shrink-0 grow-0 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 border-r border-background bg-beige"
            >
              <div className="flex h-full flex-col">
                <a href={s.href} className="relative block aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {s.badge && (
                    <span className="absolute right-4 top-4 rounded-sm bg-off-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-forest">
                      {s.badge}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/70 to-transparent" />
                  <h2 className="absolute left-5 right-5 bottom-5 font-serif text-2xl font-bold leading-tight text-off-white md:text-3xl">
                    {s.title}
                  </h2>
                </a>
                <div className="flex flex-1 flex-col px-5 py-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-forest">
                    {s.eyebrow}
                  </p>
                  <p className="mt-3 flex-1 text-sm text-foreground/80">{s.blurb}</p>
                  <a
                    href={s.href}
                    className="mt-5 inline-flex w-fit items-center justify-center rounded-sm bg-forest px-5 py-2.5 text-sm font-semibold text-off-white hover:bg-forest/90"
                  >
                    {s.cta}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
