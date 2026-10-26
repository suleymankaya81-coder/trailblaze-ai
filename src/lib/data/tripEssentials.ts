import { tripEssentialsCatalog } from './tripEssentials.catalog';
import { cyclingAccessories, repairKit } from './moreGear';
import type { GearProduct } from './rockbrosGear';
import { wildguarderProducts, type WildguarderProduct } from './gearCategories';

export type EssentialsPlace = { slug: string; name: string; tagline?: string | null; travelPlan?: { days: { title: string; stops: { name: string; detail: string }[] }[] } | null };
export type EssentialsContext = { slug: string; name: string; places?: EssentialsPlace[]; mode?: 'camping'; topic?: string };
export type EssentialsProfile = 'walking' | 'desert' | 'waterfront' | 'town' | 'cold' | 'camping' | 'cycling';
const selections: Record<EssentialsProfile, string[]> = {
  walking: ['47533902757940', '45045768945716', '45703028342836', '44671785271348'],
  desert: ['45045768945716', '44671785271348', '47768652808244', '45703028342836'],
  waterfront: ['47136319209524', '45045768945716', '44671785271348', '47768652808244'],
  town: ['46920453226548', '47674357645364', '44671785271348', '47768652808244'],
  cold: ['47327361368116', '47234906095668', '47533902757940', '45703028342836'],
  camping: ['47533912752180', '45045768945716', '46920453226548', '44671785271348'],
  cycling: ['47198472962100', '45072034857012', '45045768945716', '44671785271348'],
};
// Extra on-profile picks; the last two slots rotate through these per destination so pages differ.
const extras: Record<EssentialsProfile, string[]> = {
  walking: ['47768652808244', '47234906095668', '46920453226548', '44641382826036', '47674357645364'],
  desert: ['47533902757940', '46920453226548', '47674357645364', '44641382826036'],
  waterfront: ['44641382826036', '46920453226548', '47533912752180', '47674357645364', '45703028342836'],
  town: ['45045768945716', '44641382826036', '47234906095668', '47533902757940'],
  cold: ['45045768945716', '46920453226548', '47674357645364', '44671785271348'],
  camping: ['47533902757940', '45703028342836', '47768652808244', '44641382826036', '47234906095668'],
  cycling: ['47768652808244', '47533902757940', '44641382826036'],
};
function seedHash(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
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
  // Mixed loops with mountain/park stops need walking equipment, not two beach bags.
  if (places.length > 1 && /\b(yosemite|yellowstone|rockies|teton|glacier|rainier|smoky|hiking|trail|canyon)\b/.test(identity.replace(/-/g, ' '))) return 'walking';
  if (/\b(keys|miami|beach|coast|coastal|cape cod|outer banks|honolulu|maui|kauai|lake|island|acadia|waterfront)\b/.test(identity.replace(/-/g, ' '))) return 'waterfront';
  if (/\b(yosemite|yellowstone|mountain|rockies|teton|glacier|rainier|smoky|hiking|trail|canyon|national park)\b/.test(`${identity.replace(/-/g, ' ')} ${detail}`)) return 'walking';
  if (places.every(p => towns.has(p.slug)) || /\b(city|historic district|museum|urban|downtown)\b/.test(detail)) return 'town';
  if (/\b(kayak|canoe|paddle|beach|waterfront)\b/.test(detail)) return 'waterfront';
  return 'walking';
}

export function selectTripEssentials(c: EssentialsContext): { profile: EssentialsProfile; products: GearProduct[]; binocular: WildguarderProduct } {
  const profile = essentialsProfile(c);
  const base = selections[profile];
  // First two stay as the profile's core needs; the other two rotate deterministically by page.
  const pool = [...base.slice(2), ...extras[profile].filter(id => !base.slice(0, 2).includes(id))].filter((id, i, a) => a.indexOf(id) === i);
  const h = seedHash(c.slug);
  const third = pool[h % pool.length];
  const rest = pool.filter(id => id !== third);
  const fourth = rest[Math.floor(h / 7) % rest.length];
  const products = [base[0], base[1], third, fourth].map(id => {
    const product = catalog.find(p => p.id === id);
    if (!product) throw new Error(`Missing trip essential ${id}`);
    return product;
  });
  return { profile, products, binocular: wildguarderProducts[h % wildguarderProducts.length] };
}
