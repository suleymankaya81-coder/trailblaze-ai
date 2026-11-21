-- 04-rollback.sql — restore everything 03a-apply-bcd.sql, 03b-apply-rule-a.sql and (if run) 05-optional-unpublish-overseas.sql
-- changed, from the snapshot made by 00-backup.sql. One transaction. Safe to run twice.
--
-- Restores only rows that differ from the backup, so rows edited AFTER the backup for unrelated
-- reasons would also be reverted. Section 0 lists those rows first; if it shows anything you want
-- to keep, stop and restore selectively instead.

-- 0) Rows that changed since the snapshot (review before running the rest).
select 'content_translations' as tbl, t.locale, t.entity_id as slug, t.updated_at
from public.content_translations t
join audit_backup.content_translations_20261121 b on b.id = t.id
where (t.fields, t.status) is distinct from (b.fields, b.status)
union all
select 'destinations', null, d.slug, d.updated_at
from public.destinations d
join audit_backup.destinations_20261121 b on b.id = d.id
where (d.status, d.seo_eligible, d.tagline, d.seo_title, d.seo_description, d.best_season, d.permit_headline, d.permit_note, d.notes, d.travel_plan)
      is distinct from
      (b.status, b.seo_eligible, b.tagline, b.seo_title, b.seo_description, b.best_season, b.permit_headline, b.permit_note, b.notes, b.travel_plan)
order by 1, 2, 3;

begin;

do $$
begin
  if to_regclass('audit_backup.content_translations_20261121') is null
     or to_regclass('audit_backup.destinations_20261121') is null
     or to_regclass('audit_backup.regions_20261121') is null then
    raise exception 'Backup tables not found in schema audit_backup; nothing restored';
  end if;
end $$;

-- 1) Translations: fields and status back to the snapshot.
update public.content_translations t
   set fields = b.fields, status = b.status, updated_at = b.updated_at
  from audit_backup.content_translations_20261121 b
 where b.id = t.id
   and (t.fields, t.status) is distinct from (b.fields, b.status);

-- 2) Destinations: English text columns, travel plan and publication status back to the snapshot.
update public.destinations d
   set status = b.status, seo_eligible = b.seo_eligible, tagline = b.tagline, seo_title = b.seo_title,
       seo_description = b.seo_description, best_season = b.best_season,
       permit_headline = b.permit_headline, permit_note = b.permit_note, notes = b.notes,
       travel_plan = b.travel_plan, updated_at = b.updated_at
  from audit_backup.destinations_20261121 b
 where b.id = d.id
   and (d.status, d.seo_eligible, d.tagline, d.seo_title, d.seo_description, d.best_season, d.permit_headline, d.permit_note, d.notes, d.travel_plan)
       is distinct from
       (b.status, b.seo_eligible, b.tagline, b.seo_title, b.seo_description, b.best_season, b.permit_headline, b.permit_note, b.notes, b.travel_plan);

-- 3) Region status (only file 05 changes it).
update public.regions r
   set status = b.status, updated_at = b.updated_at
  from audit_backup.regions_20261121 b
 where b.id = r.id and r.status is distinct from b.status;

-- 4) Check: must return 0 / 0 / 0.
select
  (select count(*) from public.content_translations t join audit_backup.content_translations_20261121 b on b.id = t.id
    where (t.fields, t.status) is distinct from (b.fields, b.status)) as translations_differing,
  (select count(*) from public.destinations d join audit_backup.destinations_20261121 b on b.id = d.id
    where (d.status, d.tagline, d.seo_description, d.permit_note, d.travel_plan)
          is distinct from (b.status, b.tagline, b.seo_description, b.permit_note, b.travel_plan)) as destinations_differing,
  (select count(*) from public.regions r join audit_backup.regions_20261121 b on b.id = r.id
    where r.status is distinct from b.status) as regions_differing;

commit;

-- Optional, only when everything is final: remove the helper functions (the backup stays).
-- drop schema translation_fix cascade;
