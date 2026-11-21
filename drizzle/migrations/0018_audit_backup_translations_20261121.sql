create schema if not exists audit_backup;

create table if not exists audit_backup.content_translations_20261121 as
  select * from public.content_translations
  where entity_type = 'destination' and locale in ('de', 'fr');

create table if not exists audit_backup.destinations_20261121 as
  select id, slug, status, seo_eligible, tagline, seo_title, seo_description, best_season,
         permit_headline, permit_note, notes, travel_plan, updated_at
  from public.destinations;

create table if not exists audit_backup.regions_20261121 as
  select id, country_code, slug, status, updated_at from public.regions;

create table if not exists audit_backup.snapshot_info_20261121 as
  select now() as taken_at,
         (select count(*) from audit_backup.content_translations_20261121) as translations,
         (select count(*) from audit_backup.destinations_20261121) as destinations,
         (select count(*) from audit_backup.regions_20261121) as regions;

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