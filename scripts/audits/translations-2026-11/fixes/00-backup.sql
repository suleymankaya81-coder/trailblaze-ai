-- 00-backup.sql — snapshot everything 03-apply.sql and 05-optional-unpublish-overseas.sql may change.
--
-- Where: private schema `audit_backup`. Supabase only exposes the schemas listed under
-- API settings ("Exposed schemas", by default public + graphql_public), so this schema is not
-- reachable through the REST/GraphQL API. As a second layer the schema and tables are revoked
-- from anon/authenticated/public and RLS is enabled with NO policies.
-- Nothing is ever copied into the public schema.
--
-- Safe to run twice: CREATE TABLE IF NOT EXISTS keeps the FIRST snapshot, so a second run after
-- 03-apply.sql can never overwrite the pre-fix copy with already-fixed data.
-- Before you continue, check the counts printed at the end.

begin;

create schema if not exists audit_backup;

-- 1) Every German/French destination translation (fields + status), whole rows.
create table if not exists audit_backup.content_translations_20261121 as
  select * from public.content_translations
  where entity_type = 'destination' and locale in ('de', 'fr');

-- 2) Every destination: the English text columns rule A may change, plus status for file 05.
create table if not exists audit_backup.destinations_20261121 as
  select id, slug, status, seo_eligible, tagline, seo_title, seo_description, best_season,
         permit_headline, permit_note, notes, travel_plan, updated_at
  from public.destinations;

-- 3) Region status (file 05 may hide an overseas region that would otherwise be empty).
create table if not exists audit_backup.regions_20261121 as
  select id, country_code, slug, status, updated_at from public.regions;

-- 4) When the snapshot was taken and how many rows it holds.
create table if not exists audit_backup.snapshot_info_20261121 as
  select now() as taken_at,
         (select count(*) from audit_backup.content_translations_20261121) as translations,
         (select count(*) from audit_backup.destinations_20261121) as destinations,
         (select count(*) from audit_backup.regions_20261121) as regions;

-- Keys for fast and exact restores (ignored if they already exist).
do $$
begin
  if not exists (select 1 from pg_indexes where schemaname = 'audit_backup' and indexname = 'ct_20261121_pk') then
    create unique index ct_20261121_pk on audit_backup.content_translations_20261121 (id);
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'audit_backup' and indexname = 'dest_20261121_pk') then
    create unique index dest_20261121_pk on audit_backup.destinations_20261121 (id);
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'audit_backup' and indexname = 'regions_20261121_pk') then
    create unique index regions_20261121_pk on audit_backup.regions_20261121 (id);
  end if;
end $$;

-- Lock down: no API role may see the schema or the tables.
alter table audit_backup.content_translations_20261121 enable row level security;
alter table audit_backup.destinations_20261121 enable row level security;
alter table audit_backup.regions_20261121 enable row level security;
alter table audit_backup.snapshot_info_20261121 enable row level security;
do $$
declare r text;
begin
  foreach r in array array['public', 'anon', 'authenticated'] loop
    if r = 'public' or exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on schema audit_backup from %I', r);
      execute format('revoke all on all tables in schema audit_backup from %I', r);
    end if;
  end loop;
end $$;

commit;

-- Check (expected: translations = de 3,087 + fr 3,231 = 6,318; destinations = all rows incl. drafts).
select * from audit_backup.snapshot_info_20261121;
select locale, count(*) from audit_backup.content_translations_20261121 group by locale order by locale;
-- Must return 0 rows: nothing from this work lives in the public schema.
select table_name from information_schema.tables
where table_schema = 'public' and table_name like '%20261121%';
