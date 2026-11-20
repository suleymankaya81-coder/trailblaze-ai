import { T, useTp, useLocale } from "@/lib/i18n";
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/site/LocalLink';
import { COUNTRY_DIRECTORY, TOTAL_PLACES, countryLabel } from '@/lib/data/countryDirectory';
import { countryPath } from '@/lib/routes/paths';
import mountains from '@/assets/home/collage-mountains.jpg';
import coast from '@/assets/home/collage-coast.jpg';
import desert from '@/assets/home/collage-desert.jpg';

export interface HeroScene { image: string; name: string; countryCode: string }

const fallbacks = [mountains, coast, desert];

/** International homepage opening: worldwide headline, search, country chips and a three-country collage. */
export function HomeHero({ scenes = [] }: { scenes?: HeroScene[] }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const tp = useTp();
  const locale = useLocale() === 'de' ? 'de' : 'en';
  const countries = COUNTRY_DIRECTORY.length;
  const rounded = Math.floor(TOTAL_PLACES / 100) * 100;

  return (
    <section className="home-collage-hero" aria-labelledby="home-hero-title">
      <div className="container-page home-collage-layout">
        <div className="home-collage-copy">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"><T>{`${countries} countries · ${rounded}+ wild places`}</T></p>
          <h1 id="home-hero-title" className="mt-5 font-display text-[36px] leading-[1.08] text-primary md:text-[46px] xl:text-[58px]"><T>National parks and scenic road trips</T> <span className="text-sage-deep"><T>around the world</T></span></h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"><T>From the Rockies to the Dolomites and the Picos de Europa: day-by-day plans, route maps and honest booking advice for every country we cover.</T></p>
          <form className="mt-7 flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft" role="search" onSubmit={(event) => {
            event.preventDefault();
            const q = query.trim();
            if (q) void navigate({ to: '/search', search: { q } });
          }}>
            <Search aria-hidden="true" className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
            <input aria-label={tp("Destination or trip type")} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tp("Try 'Dolomites', 'Yellowstone' or 'Black Forest'")} required maxLength={160} className="min-w-0 flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
            <Button type="submit" size="lg" className="shrink-0 gap-2 px-4 text-sm shadow-none lg:px-6"><T>Search</T> <ArrowRight aria-hidden="true" /></Button>
          </form>
          <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"><T>Browse by country</T></p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {COUNTRY_DIRECTORY.slice(0, 8).map((c) => <li key={c.code}>
              <Link to={countryPath(c.code, locale)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground transition hover:border-primary">
                <span aria-hidden="true">{c.flag}</span>{countryLabel(c.code, locale)}<span className="text-xs text-muted-foreground">{c.places}</span>
              </Link>
            </li>)}
            <li><a href="#countries" className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-primary underline-offset-4 hover:underline"><T>{`All ${countries} countries`}</T> <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></a></li>
          </ul>
        </div>
        <div className="home-collage-scenes" aria-label={tp("Places from three countries")}>
          {[0, 1, 2].map((index) => {
            const scene = scenes[index];
            const image = scene?.image || fallbacks[index];
            return <figure key={index} className={`home-collage-scene home-collage-scene-${index + 1}`}>
              <img src={image} alt={scene?.name ?? ''} width={768} height={1536} fetchPriority={index === 0 ? 'high' : 'auto'} className="h-full w-full object-cover" />
              {scene && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent px-4 pb-6 pt-16 text-[10px] font-medium uppercase leading-relaxed tracking-[0.15em] text-off-white">{scene.name}<br />{countryLabel(scene.countryCode, locale)}</figcaption>}
            </figure>;
          })}
        </div>
      </div>
    </section>
  );
}
