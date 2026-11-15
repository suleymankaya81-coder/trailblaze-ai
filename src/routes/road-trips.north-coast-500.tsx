import { createFileRoute } from '@tanstack/react-router';
import { SITE_ORIGIN } from '@/config/site';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { GuideHero, GuideSection, HeroChip } from '@/components/guides/GuideSections';
import { VrboExpediaItems } from '@/components/destination/VrboSearchWidget';
import { Button } from '@/components/ui/button';
import { DayRouteActions } from '@/components/ui-kit/DayRouteActions';
import { Link } from '@/components/site/LocalLink';
import { T } from '@/lib/i18n';
import { HOME, ROAD_TRIPS, breadcrumbScript } from '@/lib/seo/breadcrumbs';
import { getDestinationCovers } from '@/lib/data/destinations.functions';

const title = 'North Coast 500 Road Trip: Scotland Route Guide — WildParkRoutes';
const description = 'Plan Scotland’s North Coast 500 from Inverness: official five-day minimum guidance, regional stops, motorhome restrictions and accommodation searches.';
const source = 'https://www.northcoast500.com/';
const regions = [
  { name: 'Inverness', text: 'Start and finish in the Highland capital. The official route guide identifies Inverness as the starting and finishing base.', url: `${source}explore-the-route/inverness-shire/` },
  { name: 'Wester Ross', text: 'Explore the western coastal landscapes and communities. Choose local visits rather than treating every viewpoint as a compulsory stop.', url: `${source}explore-the-route/wester-ross/` },
  { name: 'Sutherland', text: 'The official route spans western and eastern Sutherland, with coastal communities, beaches and mountain scenery.', url: `${source}explore-the-route/sutherland/` },
  { name: 'Caithness', text: 'Continue through the northeastern part of the route, with coastal headlands and historic sites.', url: `${source}explore-the-route/caithness/` },
  { name: 'Easter Ross', text: 'Explore the seaboard villages on the eastern side before returning south.', url: `${source}explore-the-route/easter-ross/` },
  { name: 'Black Isle', text: 'The Black Isle is a peninsula, not an island. Include it as a regional visit near the Inverness end of the journey.', url: `${source}explore-the-route/black-isle/` },
];

export const Route = createFileRoute('/road-trips/north-coast-500')({
  loader: () => getDestinationCovers({ data: { slugs: ['wester-ross'] } }),
  head: ({ loaderData }) => ({
    meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' },
      ...(loaderData?.['wester-ross']?.startsWith('https://') ? [{ property: 'og:image', content: loaderData['wester-ross'] }, { name: 'twitter:image', content: loaderData['wester-ross'] }] : [])],
    links: [{ rel: 'canonical', href: `${SITE_ORIGIN}/road-trips/north-coast-500` }],
    scripts: [breadcrumbScript([HOME, ROAD_TRIPS, { name: 'North Coast 500', path: '/road-trips/north-coast-500' }])],
  }),
  component: Page,
});

function Page() {
  const covers = Route.useLoaderData();
  return <div className="min-h-screen bg-background"><Header /><main>
    <GuideHero image={covers['wester-ross']} kicker="Scotland · Road trip" title="North Coast 500" crumbs={[HOME, ROAD_TRIPS, { name: 'North Coast 500', path: '/road-trips/north-coast-500' }]}>
      <HeroChip>Official route: 516 miles</HeroChip><HeroChip>Allow at least 5 days</HeroChip><HeroChip>Start & finish: Inverness</HeroChip>
    </GuideHero>
    <GuideSection title="Plan the full journey" intro="The North Coast 500 is a road trip around the North Highlands, not a one-day park visit. The official operator recommends at least five days, with seven days or more allowing a slower visit.">
      <p className="text-sm leading-relaxed text-muted-foreground"><T>The regional outline below is not turn-by-turn navigation. Choose accommodation and local visits before departure; check current roads, weather and access conditions.</T></p>
      <Button asChild variant="outline" className="mt-4 min-h-12"><a href={`${source}explore-the-route/`} target="_blank" rel="noopener noreferrer"><T>Open the official route map</T></a></Button>
      <DayRouteActions title="Inverness — North Coast 500 start" points={[{ name: 'Inverness', query: 'Inverness, Scotland, United Kingdom' }]} mapsLabel="Open Inverness in Google Maps" />
    </GuideSection>
    <GuideSection title="Regional route outline">
      <ol className="divide-y divide-border">{regions.map((region, index) => <li key={region.name} className="grid grid-cols-[2rem_1fr] gap-4 py-5"><span className="font-display text-xl text-primary">{index + 1}</span><div><h2 className="font-display text-xl">{region.name}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground"><T>{region.text}</T></p><a href={region.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-primary underline"><T>Official regional guide</T></a></div></li>)}</ol>
    </GuideSection>
    <GuideSection title="Motorhomes & narrow roads">
      <p className="text-sm leading-relaxed"><T>The official operator advises vehicles larger than a standard VW T5 conversion (about 16–18 feet) to use alternative motorhome routes. Do not attempt Bealach na Bà or the B869 Drumbeg road in such a vehicle; the operator recommends the A832 and A894 alternatives. Check the official guidance and your rental agreement before choosing roads.</T></p>
      <a href={`${source}top-tips-hitting-route/motorhomes-and-campervan-advice/`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-primary underline"><T>Official motorhome guidance</T></a>
    </GuideSection>
    <GuideSection title="Where to stay"><div className="travel-card-row sm:grid-cols-2"><VrboExpediaItems destinationName="North Coast 500, Scottish Highlands" destinationSlug="wester-ross" /></div></GuideSection>
    <GuideSection title="Explore nearby destination guides"><div className="flex flex-wrap gap-3">{['wester-ross', 'torridon', 'assynt-coigach', 'durness-and-smoo-cave'].map(slug => <Button key={slug} asChild variant="outline"><Link to="/destinations/$slug" params={{ slug }}><T>{slug.replaceAll('-', ' ')}</T></Link></Button>)}</div></GuideSection>
    <GuideSection title="Official planning sources"><a href={`${source}top-tips-hitting-route/planning-your-north-coast-500-adventure/`} target="_blank" rel="noopener noreferrer" className="text-primary underline"><T>North Coast 500 planning advice</T></a><p className="mt-3 text-xs text-muted-foreground">Reviewed 15 November 2026. Road conditions and accommodation availability can change.</p></GuideSection>
  </main><Footer /></div>;
}