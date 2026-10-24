import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Thumb } from '@/components/ui-kit';
import mountains from '@/assets/home/collage-mountains.jpg';
import coast from '@/assets/home/collage-coast.jpg';
import desert from '@/assets/home/collage-desert.jpg';
import map from '@/assets/thumbs/map.jpg';
import plan from '@/assets/thumbs/plan.jpg';
import road from '@/assets/thumbs/road.jpg';

const scenes = [
  { image: mountains, alt: 'Illustrative alpine road with a campervan', label: 'Mountains', caption: 'Move differently' },
  { image: coast, alt: 'Illustrative winding coastal road above turquoise water', label: 'Coastlines', caption: 'Change perspective' },
  { image: desert, alt: 'Illustrative desert highway at sunset', label: 'Open roads', caption: 'Stay with you' },
];

export function HomeHero() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  return (
    <section className="home-collage-hero" aria-labelledby="home-hero-title">
      <div className="container-page home-collage-layout">
        <div className="home-collage-copy">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Bigger places. A calmer you.</p>
          <h1 id="home-hero-title" className="mt-5 font-display text-[38px] leading-[1.08] text-primary md:text-[48px] xl:text-[64px]">Where will the<br className="hidden md:block" /> road take you?</h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">Discover 500+ outdoor destinations and ready-made road trip plans. Your next great drive starts here.</p>
          <form className="mt-7 flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft" role="search" onSubmit={(event) => {
            event.preventDefault();
            const q = query.trim();
            if (q) void navigate({ to: '/search', search: { q } });
          }}>
            <Search aria-hidden="true" className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
            <input aria-label="Destination or trip type" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try 'Yellowstone' or 'coastal road trip'" required maxLength={160} className="min-w-0 flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
            <Button type="submit" size="lg" className="shrink-0 gap-2 px-4 text-sm shadow-none lg:px-6">Search <ArrowRight aria-hidden="true" /></Button>
          </form>
          <ul className="mt-8 grid grid-cols-3 gap-3 md:mt-10">
            {[
              { image: map, title: '500+', detail: 'Destinations' },
              { image: plan, title: 'Curated', detail: 'Road trip plans' },
              { image: road, title: 'Free to explore', detail: 'Independent guides' },
            ].map((item) => <li key={item.title} className="flex items-center gap-2.5"><span className="hidden lg:block"><Thumb src={item.image} alt="" size={36} /></span><div><p className="text-xs font-semibold text-foreground">{item.title}</p><p className="mt-1 text-[10px] text-muted-foreground">{item.detail}</p></div></li>)}
          </ul>
          <p className="mt-8 flex items-center gap-3 text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground md:mt-12"><span className="h-px w-6 bg-border" />Good roads. Brighter days.</p>
        </div>
        <div className="home-collage-scenes" aria-label="Road trip inspiration">
          {scenes.map((scene, index) => <figure key={scene.label} className={`home-collage-scene home-collage-scene-${index + 1}`}>
            <img src={scene.image} alt={scene.alt} width={768} height={1536} fetchPriority={index === 0 ? 'high' : 'auto'} className="h-full w-full object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent px-4 pb-6 pt-16 text-[9px] font-medium uppercase leading-relaxed tracking-[0.15em] text-off-white">{scene.label}<br />{scene.caption}</figcaption>
          </figure>)}
          <span className="absolute bottom-0 right-1 text-[9px] text-muted-foreground" title="AI-generated scenes for travel inspiration; not destination photographs">Illustrative imagery</span>
        </div>
      </div>
    </section>
  );
}