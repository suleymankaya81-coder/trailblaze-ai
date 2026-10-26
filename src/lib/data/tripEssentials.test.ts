import { describe, expect, it } from 'vitest';
import { selectTripEssentials, type EssentialsContext } from './tripEssentials';
import { tripEssentialsCatalog } from './tripEssentials.catalog';
import { gearShopLink } from './rockbrosGear';
import fs from 'node:fs';

const contexts: EssentialsContext[] = [
  { slug: 'zion', name: 'Zion' },
  { slug: 'acadia', name: 'Acadia' },
  { slug: 'new-york-city', name: 'New York City' },
  { slug: 'fairbanks', name: 'Fairbanks' },
  { slug: 'yosemite', name: 'Yosemite' },
  { slug: 'rv-zion', name: 'Zion', mode: 'camping' },
  { slug: 'bikepacking-maah-daah-hey', name: 'Bikepacking Maah Daah Hey' },
];
describe('four contextual approved-partner essentials', () => {
  it('selects exactly four different products per travel context', () => {
    for (const c of contexts) {
      const { products } = selectTripEssentials(c);
      expect(products).toHaveLength(4);
      expect(new Set(products.map(p => p.id)).size).toBe(4);
    }
  });
  it('uses only ROCKBROS advertiser 58007 with publisher 3115962', () => {
    for (const c of contexts) for (const p of selectTripEssentials(c).products) {
      const url = new URL(gearShopLink(p, `trip-${c.slug}`));
      expect(url.searchParams.get('awinmid')).toBe('58007');
      expect(url.searchParams.get('awinaffid')).toBe('3115962');
      expect(url.searchParams.get('ued')).toBe(p.productUrl);
    }
  });
  it('does not put bicycle-specific equipment on ordinary sightseeing trips', () => {
    for (const c of contexts.slice(0, 6)) {
      expect(selectTripEssentials(c).products.some(p => /bike repair|bike tire|saddle bag|handlebar|bottle cage/i.test(p.catalogTitle))).toBe(false);
    }
  });
  it('matches desert, waterfront, town, cold and campsite needs', () => {
    expect(selectTripEssentials(contexts[0]).products.map(p => p.id)).toContain('45045768945716');
    expect(selectTripEssentials(contexts[1]).products.map(p => p.id)).toContain('47136319209524');
    expect(selectTripEssentials(contexts[2]).products.map(p => p.id)).toContain('46920453226548');
    expect(selectTripEssentials(contexts[3]).products.map(p => p.id)).toContain('47327361368116');
    expect(selectTripEssentials(contexts[5]).products.map(p => p.id)).toContain('47533912752180');
    expect(selectTripEssentials(contexts[6]).products.map(p => p.id)).toContain('45072034857012');
  });
  it('uses route stops, not just the gateway city, for loop recommendations', () => {
    expect(selectTripEssentials({ slug: 'california-icons-from-san-francisco', name: 'California Icons', places: [{ slug: 'yosemite', name: 'Yosemite' }] }).profile).toBe('walking');
    expect(selectTripEssentials({ slug: 'california-icons-from-san-francisco', name: 'California Icons', places: [{ slug: 'yosemite', name: 'Yosemite' }, { slug: 'monterey', name: 'Monterey Coast' }] }).profile).toBe('walking');
    expect(selectTripEssentials({ slug: 'florida-keys-loop-from-miami', name: 'Florida Keys Loop', places: [{ slug: 'florida-keys', name: 'Florida Keys' }] }).profile).toBe('waterfront');
  });
  it('new selections match in-stock priced variants in the approved stored feed', () => {
    const catalog = JSON.parse(fs.readFileSync('data/affiliate-feeds/rockbros/products.json', 'utf8'));
    for (const p of tripEssentialsCatalog) {
      const model = catalog.models.find((m: { variants: { id: string }[] }) => m.variants.some(v => v.id === p.id));
      const variant = model?.variants.find((v: { id: string }) => v.id === p.id);
      expect(variant?.availability).toBe('in_stock');
      expect(variant?.price).toBe(p.price);
      expect(p.price).toBeGreaterThan(0);
      expect(variant?.product_url).toBe(p.productUrl);
      expect(p.image).toContain('/__l5e/assets-v1/');
    }
  });
});

describe('fifth WILDGUARDER pick and per-destination variety', () => {
  it('always adds a WILDGUARDER binocular with an Awin link for advertiser 126831', async () => {
    const { wildguarderLink } = await import('./gearCategories');
    for (const c of contexts) {
      const { binocular } = selectTripEssentials(c);
      expect(binocular.name).toMatch(/binocular/i);
      expect(new URL(wildguarderLink(binocular.url, 'x')).searchParams.get('awinmid')).toBe('126831');
    }
  });
  it('does not show the same four products on every walking destination', () => {
    const slugs = ['yosemite', 'yellowstone-np', 'glacier', 'rainier', 'great-smoky', 'teton-trail'];
    const sets = new Set(slugs.map(slug => selectTripEssentials({ slug, name: 'Trail ' + slug }).products.map(p => p.id).join()));
    expect(sets.size).toBeGreaterThan(2);
  });
  it('keeps the same picks for the same page', () => {
    expect(selectTripEssentials({ slug: 'zion', name: 'Zion' }).products.map(p => p.id)).toEqual(selectTripEssentials({ slug: 'zion', name: 'Zion' }).products.map(p => p.id));
  });
});
