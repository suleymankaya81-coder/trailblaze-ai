-- 03b-apply-rule-a.sql — rule A only (placeholder sentences), version 2 + quality filter. ONE transaction.
-- NOT approved yet: run 01b-helper-rule-a-v2.sql and 01c-helper-rule-a-quality.sql, then review
-- 02b-preview-rule-a-quality.sql (write list + needs-human list) first.
-- Rule A writes an output only when it passes the quality filter of 01c (≥ 6 words, no pronoun/ordinal
-- start, not only a population/area/number fact, mentions the place or stop name, names no other park,
-- slug not on the needs-human list). Everything else stays UNCHANGED ("needs-human").
-- Independent of 03a-apply-bcd.sql (either order).
--
-- Prerequisites: 00-backup.sql and 01-helper.sql have been run, and 02-preview.sql was reviewed.
-- Every rule updates only rows whose value really changes (WHERE new IS DISTINCT FROM old), and
-- every rule function is idempotent, so a second run updates 0 rows.
-- At the end, structure and identity checks compare every changed row with the backup; if any
-- check fails, the DO block raises an exception and NOTHING is committed.
-- Run with psql -v ON_ERROR_STOP=1 -f 03b-apply-rule-a.sql, or paste the whole file into the SQL editor.

begin;

do $$
begin
  if to_regclass('audit_backup.content_translations_20261121') is null
     or to_regclass('audit_backup.destinations_20261121') is null then
    raise exception 'Backup missing: run 00-backup.sql first';
  end if;
  if to_regprocedure('translation_fix.rule_a(jsonb)') is null
     or to_regprocedure('translation_fix.jsonb_shape(jsonb)') is null then
    raise exception 'Helper missing: run 01-helper.sql first';
  end if;
  if to_regprocedure('translation_fix.rule_a_text(text,text)') is null
     or to_regprocedure('translation_fix.clause_problems(text,boolean)') is null then
    raise exception 'Rule A v2 missing: run 01b-helper-rule-a-v2.sql first (v1 wrote sentence fragments)';
  end if;
  if to_regprocedure('translation_fix.rule_a_filtered_jsonb(jsonb,text,text,text,text,text[])') is null
     or to_regprocedure('translation_fix.rule_a_quality(text,text,text,text,text)') is null then
    raise exception 'Rule A quality filter missing: run 01c-helper-rule-a-quality.sql first';
  end if;
end $$;

create temp table fix_log (step int, rule text, target text, locale text, rows_changed int) on commit drop;

-- ============================================================================================
-- Rule A (English source): remove sentences containing [dated source] in destinations
-- (tagline, seo_title, seo_description, best_season, permit_headline, permit_note, notes and every
-- string inside travel_plan except stop names/ids, links and labels). "Natura [token]" becomes
-- "Natura 2000". If a field would become empty, its first clause before the token is kept;
-- v2 never writes a fragment: invalid clauses are cut back to a complete clause or left unchanged
-- ("unresolved"); outputs that fail the 01c quality filter are also left unchanged ("needs-human").
-- ============================================================================================
with cand as (
  select id,
         (translation_fix.rule_a_filtered_text(tagline, 'tagline', name, null, slug)).result         as tagline,
         (translation_fix.rule_a_filtered_text(seo_title, 'seo_title', name, null, slug)).result       as seo_title,
         (translation_fix.rule_a_filtered_text(seo_description, 'seo_description', name, null, slug)).result as seo_description,
         (translation_fix.rule_a_filtered_text(best_season, 'best_season', name, null, slug)).result     as best_season,
         (translation_fix.rule_a_filtered_text(permit_headline, 'permit_headline', name, null, slug)).result as permit_headline,
         (translation_fix.rule_a_filtered_text(permit_note, 'permit_note', name, null, slug)).result     as permit_note,
         (translation_fix.rule_a_filtered_text(notes, 'notes', name, null, slug)).result           as notes,
         translation_fix.rule_a_filtered_jsonb(travel_plan, name, slug) as travel_plan
  from public.destinations
), upd as (
  update public.destinations d
     set tagline = c.tagline, seo_title = c.seo_title, seo_description = c.seo_description,
         best_season = c.best_season, permit_headline = c.permit_headline, permit_note = c.permit_note,
         notes = c.notes, travel_plan = c.travel_plan, updated_at = now()
    from cand c
   where c.id = d.id
     and (c.tagline, c.seo_title, c.seo_description, c.best_season, c.permit_headline, c.permit_note, c.notes, c.travel_plan)
         is distinct from
         (d.tagline, d.seo_title, d.seo_description, d.best_season, d.permit_headline, d.permit_note, d.notes, d.travel_plan)
  returning d.id
)
insert into fix_log select 1, 'A', 'destinations', 'en', count(*) from upd;

-- ============================================================================================
-- Rule A (translations): the same sentence removal in German and French content_translations,
-- for [dated source], [source datée], [datierter Quelle] and [datiert Quelle].
-- ============================================================================================
-- The place name passed to the filter is the English name plus the translated name (either may be
-- mentioned); inside a stop, the stop's own name also counts.
with cand as (
  select t.id, t.locale, t.fields as old_fields,
         translation_fix.rule_a_filtered_jsonb(t.fields, d.name || ' ' || coalesce(t.fields->>'name', ''), t.entity_id) as new_fields
  from public.content_translations t
  join public.destinations d on d.slug = t.entity_id
  where t.entity_type = 'destination' and t.locale in ('de', 'fr')
), upd as (
  update public.content_translations t set fields = c.new_fields, updated_at = now()
  from cand c where c.id = t.id and c.new_fields is distinct from c.old_fields
  returning c.locale
)
insert into fix_log select 2, 'A', 'content_translations', locale, count(*) from upd group by locale;

-- ============================================================================================
-- Final checks (any failure aborts the whole transaction).
-- ============================================================================================
do $$
declare bad int;
begin
  -- 1) JSON structure (keys, array lengths, non-string values) identical to the backup.
  select count(*) into bad
  from public.content_translations t
  join audit_backup.content_translations_20261121 b on b.id = t.id
  where translation_fix.jsonb_shape(t.fields) is distinct from translation_fix.jsonb_shape(b.fields);
  if bad > 0 then raise exception 'Structure check failed for % translation rows', bad; end if;

  select count(*) into bad
  from public.destinations d
  join audit_backup.destinations_20261121 b on b.id = d.id
  where translation_fix.jsonb_shape(d.travel_plan) is distinct from translation_fix.jsonb_shape(b.travel_plan);
  if bad > 0 then raise exception 'Structure check failed for % destination travel plans', bad; end if;

  -- 2) Routing identities untouched (row name, stop names, stop ids).
  select count(*) into bad
  from public.content_translations t
  join audit_backup.content_translations_20261121 b on b.id = t.id
  where translation_fix.identity_values(t.fields) is distinct from translation_fix.identity_values(b.fields);
  if bad > 0 then raise exception 'Identity check failed for % translation rows', bad; end if;

  select count(*) into bad
  from public.destinations d
  join audit_backup.destinations_20261121 b on b.id = d.id
  where translation_fix.identity_values(d.travel_plan) is distinct from translation_fix.identity_values(b.travel_plan)
     or d.status is distinct from b.status;
  if bad > 0 then raise exception 'Identity/status check failed for % destinations', bad; end if;

  -- 3) No text field became empty.
  select count(*) into bad
  from public.destinations d join audit_backup.destinations_20261121 b on b.id = d.id
  where (coalesce(b.tagline, '') <> '' and coalesce(d.tagline, '') = '')
     or (coalesce(b.seo_description, '') <> '' and coalesce(d.seo_description, '') = '')
     or (coalesce(b.permit_note, '') <> '' and coalesce(d.permit_note, '') = '');
  if bad > 0 then raise exception 'Empty-field check failed for % destinations', bad; end if;

  select count(*) into bad
  from public.content_translations t
  join audit_backup.content_translations_20261121 b on b.id = t.id,
  lateral translation_fix.jsonb_string_diff(b.fields, t.fields) diff
  where btrim(diff.new_value) = '' and btrim(diff.old_value) <> '';
  if bad > 0 then raise exception 'Empty-field check failed for % translated fields', bad; end if;
end $$;

-- Result per rule (a second run must show 0 everywhere).
select step, rule, target, locale, rows_changed from fix_log order by step, locale;

-- What is still left (expected: only the 'unresolved' cases listed by 02-preview.sql).
select 'placeholder tokens left' as check, locale, count(*) as rows
from public.content_translations
where entity_type = 'destination' and locale in ('de', 'fr')
  and fields::text ~ '\[(dated source|source datée|datierter Quelle|datiert Quelle)\]'
group by locale
union all
select 'placeholder tokens left', 'en', count(*) from public.destinations
where concat_ws(' ', tagline, seo_title, seo_description, best_season, permit_headline, permit_note, notes, travel_plan::text)
      ~ '\[(dated source|source datée|datierter Quelle|datiert Quelle)\]'
union all
select 'de lowercase template left', 'de', count(*) from public.content_translations
where entity_type = 'destination' and locale = 'de' and fields::text like '%aktivitätsberechtigungen%'
union all
select 'fr "Timing" title left', 'fr', count(*) from public.content_translations
where entity_type = 'destination' and locale = 'fr' and jsonb_path_exists(fields, '$.intel[*] ? (@.title == "Timing")');

-- Rule A fields left unchanged on purpose: 'unresolved' (no valid sentence) and 'needs-human'
-- (valid sentence, but failed the 01c quality filter). A person must rewrite them; see 02b for the list.
select 'rule A left unchanged' as check, l.locale, l.decision, count(*) as fields, count(distinct l.slug) as rows
from (
  select t.locale, t.entity_id as slug, x.*
  from public.content_translations t
  join public.destinations d on d.slug = t.entity_id,
  lateral translation_fix.rule_a_filtered_leaves(t.fields, d.name || ' ' || coalesce(t.fields->>'name', ''), t.entity_id) x
  where t.entity_type = 'destination' and t.locale in ('de', 'fr')
  union all
  select 'en', d.slug, x.*
  from public.destinations d, lateral translation_fix.rule_a_filtered_leaves(jsonb_build_object(
    'tagline', d.tagline, 'seo_title', d.seo_title, 'seo_description', d.seo_description, 'best_season', d.best_season,
    'permit_headline', d.permit_headline, 'permit_note', d.permit_note, 'notes', d.notes, 'travel_plan', d.travel_plan),
    d.name, d.slug) x
) l
where l.decision in ('unresolved', 'needs-human')
group by l.locale, l.decision order by l.locale, l.decision;

commit;
