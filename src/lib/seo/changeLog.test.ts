import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildChangeLogResponse, buildChildSitemap, changeLogXml } from './sitemap.server';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('published page change log', () => {
  it('preserves stored dates, deduplicates and omits invalid dates and foreign hosts', () => {
    const body = changeLogXml([
      { loc: 'https://wildparkroutes.com/about', updatedAt: '2026-11-20T12:00:00Z' },
      { loc: 'https://wildparkroutes.com/about', updatedAt: '2026-11-22T12:00:00Z' },
      { loc: 'https://wildparkroutes.com/contact', updatedAt: 'invalid' },
      { loc: 'https://example.com/private', updatedAt: '2026-11-22T12:00:00Z' },
    ]);
    expect(body.match(/<item>/g)).toHaveLength(1);
    expect(body).toContain('<pubDate>Sun, 22 Nov 2026 12:00:00 GMT</pubDate>');
    expect(body).not.toContain('/private');
    expect(body).not.toContain('/contact');
  });

  it('queries only published records and excludes translations whose source is unpublished', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.test');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    const urls: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (input: string) => {
      urls.push(input);
      const rows = input.includes('/destinations?') ? [{ slug: 'acadia', updated_at: '2026-11-20T00:00:00Z' }]
        : input.includes('/content_translations?') ? [{ entity_id: 'acadia', locale: 'de', updated_at: '2026-11-21T00:00:00Z' }, { entity_id: 'zion', locale: 'fr', updated_at: '2026-11-22T00:00:00Z' }] : [];
      return new Response(JSON.stringify(rows));
    }));
    const response = await buildChangeLogResponse();
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(urls).toHaveLength(3);
    expect(urls.every(url => url.includes('status=eq.published'))).toBe(true);
    expect(urls.find(url => url.includes('/seo_landing_pages?'))).toContain('indexable=eq.true');
    expect(body).toContain('/de/destinations/us/maine/acadia');
    expect(body).not.toContain('zion');
  });

  it('does not return a partial feed when the public data query fails', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.test');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('offline', { status: 503 })));
    expect((await buildChangeLogResponse()).status).toBe(503);
  });

  it('omits destination timestamps from derived guide pages', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.test');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    const rows = [{ slug: 'acadia', name: 'Acadia', updated_at: '2026-11-22T00:00:00Z', hero_image: null, nearest_airport_code: 'BGR', nearest_airport_name: 'Bangor', drive_minutes: 80, drive_miles: 50, access_type: 'road', permit_level: 'high', permit_note: 'Timed entry reservation applies', camping_score: 9 }];
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response(JSON.stringify(rows))));
    for (const name of ['fly-and-drive', 'no-reservation', 'rv-camping']) {
      const response = await buildChildSitemap(name);
      expect(response?.status).toBe(200);
      const body = await response?.text();
      expect(body).toContain('<url>');
      expect(body).not.toContain('<lastmod>');
    }
  });
});