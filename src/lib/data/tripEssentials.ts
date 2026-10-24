import { tripEssentialsCatalog } from './tripEssentials.catalog';
import { cyclingAccessories, repairKit } from './moreGear';
import type { GearProduct } from './rockbrosGear';

export type EssentialsPlace = { slug: string; name: string; tagline?: string | null; travelPlan?: { days: { title: string; stops: { name: string; detail: string }[] }[] } | null };
export type EssentialsContext = { slug: string; name: string; places?: EssentialsPlace[]; mode?: 'camping'; topic?: string };
export type EssentialsProfile = 'walking' | 'desert' | 'waterfront' | 'town' | 'cold' | 'camping' | 'cycling';
const selections: Record<EssentialsProfile, string[]> = {
  walking: ['47533902757940', '45045768945716', '45703028342836', '44671785271348'],
  desert: ['45045768945716', '44671785271348', '47768652808244', '45703028342836'],
  waterfront: ['47136319209524', '44641382826036', '44671785271348', '47768652808244'],
  town: ['46920453226548', '47674357645364', '44671785271348', '47768652808244'],
  cold: ['47327361368116', '47234906095668', '47533902757940', '45703028342836'],
  camping: ['47533912752180', '45045768945716', '44641382826036', '44671785271348'],
  cycling: ['47198472962100', '45072034857012', '45045768945716', '44671785271348'],
};
const catalog = [...tripEssentialsCatalog, ...cyclingAccessories, ...repairKit];
const towns = new Set(['new-york-city', 'philadelphia', 'atlanta', 'nashville', 'houston', 'dallas-fort-worth', 'boston', 'chicago', 'san-antonio', 'st-louis', 'new-orleans', 'washington-dc', 'los-angeles', 'san-francisco', 'orlando', 'sacramento', 'charlotte', 'minneapolis', 'pittsburgh']);

export function essentialsProfile(c: EssentialsContext): EssentialsProfile {
  if (c.mode === 'camping') return 'camping';
  const places = c.places?.length ? c.places : [{ slug: c.slug, name: c.name }];
  const identity = `${c.slug} ${c.name} ${places.map(p => `${p.slug} ${p.name}`).join(' ')}`.toLowerCase();
  const detail = `${c.topic ?? ''} ${places.map(p => `${p.tagline ?? ''} ${p.travelPlan?.days.map(d => `${d.title} ${d.stops.map(s => `${s.name} ${s.detail}`).join(' ')}`).join(' ') ?? ''}`).join(' ')}`.toLowerCase();
  if (/\b(bikepacking|cycling|bicycle|mountain biking)\b/.test(identity)) return 'cycling';
  if (/\b(winter|ski|skiing|snowshoe|alaska|denali|fairbanks|anchorage|seward)\b/.test(identity)) return 'cold';
  if (/\b(desert|moab|zion|bryce|arizona|phoenix|sedona|joshua|death valley|grand circle|mighty 5|utah)\b/.test(identity.replace(/-/g, ' '))) return 'desert';
  if (/\b(keys|miami|beach|coast|coastal|cape cod|outer banks|honolulu|maui|kauai|lake|island|acadia|waterfront)\b/.test(identity.replace(/-/g, ' '))) return 'waterfront';
  if (/\b(yosemite|yellowstone|mountain|rockies|teton|glacier|rainier|smoky|hiking|trail|canyon|national park)\b/.test(`${identity.replace(/-/g, ' ')} ${detail}`)) return 'walking';
  if (places.every(p => towns.has(p.slug)) || /\b(city|historic district|museum|urban|downtown)\b/.test(detail)) return 'town';
  if (/\b(kayak|canoe|paddle|beach|waterfront)\b/.test(detail)) return 'waterfront';
  return 'walking';
}

export function selectTripEssentials(c: EssentialsContext): { profile: EssentialsProfile; products: GearProduct[] } {
  const profile = essentialsProfile(c);
  const products = selections[profile].map(id => {
    const product = catalog.find(p => p.id === id);
    if (!product) throw new Error(`Missing trip essential ${id}`);
    return product;
  });
  return { profile, products };
}
