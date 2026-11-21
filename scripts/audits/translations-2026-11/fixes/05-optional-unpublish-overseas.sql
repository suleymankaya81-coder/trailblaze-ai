-- 05-optional-unpublish-overseas.sql
-- ==================================================================================================
--  OWNER DECISION — NOT part of the translation fixes. Run only if you decide these six French
--  overseas places should leave the site. Independent of 03a/03b; needs 00-backup.sql first
--  (04-rollback.sql restores the statuses).
-- ==================================================================================================
--
-- What a draft destination means in the current code (checked in src/, see README.md):
--   * English, /de and /fr place pages: getDestinationPageData() reads only status='published',
--     so the page returns 404 (notFound) in every language.
--   * English sitemap (/sitemaps/<country>-destinations.xml) and the country/region lists
--     read destinations with status='published' → the place disappears from them.
--   * /de and /fr sitemaps (…-de-destinations.xml / …-fr-destinations.xml) list every
--     content_translations row with status='published' that is in src/data/destination-geo.json.
--     They do NOT look at destinations.status. Without step 2 below the sitemaps would keep
--     listing six URLs that now return 404. Step 2 therefore drafts the de/fr rows too.
--   * src/data/destination-geo.json is a static file. It keeps fr/reunion, fr/guadeloupe, … until it is
--     regenerated, so the English sitemap keeps listing those REGION pages (they will show no places).
--     Remove the six slugs from destination-geo.json in the repo, or run step 3, or accept empty
--     region pages.

-- 0) Current state (read-only).
select d.slug, d.status, d.country_code, d.region_slug,
       (select string_agg(t.locale || ':' || t.status, ', ' order by t.locale)
          from public.content_translations t
         where t.entity_type = 'destination' and t.entity_id = d.slug) as translations,
       (select count(*) from public.seo_landing_pages p
         where p.destination_id = d.id and p.status = 'published') as published_search_pages
from public.destinations d
where d.slug in ('reunion-national-park', 'guadeloupe-national-park', 'guiana-amazonian-park',
                 'parc-naturel-regional-de-guyane', 'mayotte-marine-natural-park',
                 'parc-naturel-regional-de-la-martinique')
order by d.slug;

begin;

do $$
begin
  if to_regclass('audit_backup.destinations_20261121') is null
     or to_regclass('audit_backup.content_translations_20261121') is null then
    raise exception 'Run 00-backup.sql first (04-rollback.sql restores from it)';
  end if;
end $$;

-- 1) The six destinations → draft (only rows not already draft).
update public.destinations
   set status = 'draft', updated_at = now()
 where slug in ('reunion-national-park', 'guadeloupe-national-park', 'guiana-amazonian-park',
                'parc-naturel-regional-de-guyane', 'mayotte-marine-natural-park',
                'parc-naturel-regional-de-la-martinique')
   and status <> 'draft';

-- 2) Their German/French translations → draft, so /de and /fr sitemaps stop listing 404 URLs.
update public.content_translations
   set status = 'draft', updated_at = now()
 where entity_type = 'destination'
   and entity_id in ('reunion-national-park', 'guadeloupe-national-park', 'guiana-amazonian-park',
                     'parc-naturel-regional-de-guyane', 'mayotte-marine-natural-park',
                     'parc-naturel-regional-de-la-martinique')
   and status <> 'draft';

-- 3) OPTIONAL (uncomment): hide a region that has no other published place left.
-- update public.regions r
--    set status = 'draft', updated_at = now()
--  where r.country_code = 'fr'
--    and r.slug in ('reunion', 'guadeloupe', 'french-guiana', 'mayotte', 'martinique')
--    and r.status <> 'draft'
--    and not exists (select 1 from public.destinations d
--                    where d.country_code = r.country_code and d.region_slug = r.slug and d.status = 'published');

-- 4) Check: expected 0 published destinations and 0 published translations for the six slugs.
select
  (select count(*) from public.destinations
    where slug in ('reunion-national-park', 'guadeloupe-national-park', 'guiana-amazonian-park',
                   'parc-naturel-regional-de-guyane', 'mayotte-marine-natural-park',
                   'parc-naturel-regional-de-la-martinique') and status = 'published') as published_destinations,
  (select count(*) from public.content_translations
    where entity_type = 'destination' and status = 'published'
      and entity_id in ('reunion-national-park', 'guadeloupe-national-park', 'guiana-amazonian-park',
                        'parc-naturel-regional-de-guyane', 'mayotte-marine-natural-park',
                        'parc-naturel-regional-de-la-martinique')) as published_translations;

commit;
