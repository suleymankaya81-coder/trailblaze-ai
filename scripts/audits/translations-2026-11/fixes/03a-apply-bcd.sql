-- 03a-apply-bcd.sql — template rules B1–B5, C and D1–D3 only (NO rule A). ONE transaction.
-- Ready to run: rules B/C/D were checked in the live preview of 2026-11-21 (rule-examples.txt).
-- Runs on its own (needs 00-backup.sql and 01-helper.sql); independent of 03b-apply-rule-a.sql.
--
-- Prerequisites: 00-backup.sql and 01-helper.sql have been run, and 02-preview.sql was reviewed.
-- Every rule updates only rows whose value really changes (WHERE new IS DISTINCT FROM old), and
-- every rule function is idempotent, so a second run updates 0 rows.
-- At the end, structure and identity checks compare every changed row with the backup; if any
-- check fails, the DO block raises an exception and NOTHING is committed.
-- Run with psql -v ON_ERROR_STOP=1 -f 03a-apply-bcd.sql, or paste the whole file into the SQL editor.

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
end $$;

create temp table fix_log (step int, rule text, target text, locale text, rows_changed int) on commit drop;

-- ============================================================================================
-- Rule B1 (de): permit/day note sentence with lowercase nouns →
-- "Eintritt, Aktivitätsgenehmigungen und Übernachtung müssen separat geprüft werden; die
--  Quellenauszüge unten belegen keine Verfügbarkeit für Ihre Reisedaten."
-- ============================================================================================
with upd as (
  update public.content_translations t
     set fields = translation_fix.rule_b1(t.fields), updated_at = now()
   where t.entity_type = 'destination' and t.locale = 'de'
     and t.fields::text like '%aktivitätsberechtigungen%'
     and translation_fix.rule_b1(t.fields) is distinct from t.fields
  returning 1
)
insert into fix_log select 3, 'B1', 'content_translations', 'de', count(*) from upd;

-- ============================================================================================
-- Rule B2 (de): "Die überprüften Quellen legen/stellen … fest" → "Die geprüften Quellen belegen …"
-- (eight exact template sentences: parking, signal, fuel, timing, access, arrival, vehicle,
--  golden hour).
-- ============================================================================================
with upd as (
  update public.content_translations t
     set fields = translation_fix.rule_b2(t.fields), updated_at = now()
   where t.entity_type = 'destination' and t.locale = 'de'
     and t.fields::text like '%Die überprüften Quellen%'
     and translation_fix.rule_b2(t.fields) is distinct from t.fields
  returning 1
)
insert into fix_log select 4, 'B2', 'content_translations', 'de', count(*) from upd;

-- ============================================================================================
-- Rule B3 (de): intel titles with the wrong meaning (exact whole-title matches only):
--   Parkkontrolle → Parken (EN "Parking check"), Zugangskontrolle → Zugang ("Access check"),
--   Zeitplanungsprüfung → Beste Reisezeit ("Timing check"), Kraftstoffprüfung → Tanken
--   ("Fuel check"), Signalprüfung → Mobilfunkempfang ("Signal check").
-- ============================================================================================
with upd as (
  update public.content_translations t
     set fields = translation_fix.rule_b3(t.fields), updated_at = now()
   where t.entity_type = 'destination' and t.locale = 'de'
     and translation_fix.rule_b3(t.fields) is distinct from t.fields
  returning 1
)
insert into fix_log select 5, 'B3', 'content_translations', 'de', count(*) from upd;

-- ============================================================================================
-- Rule B4 (de): "Wählen Sie einen lokalen Besuch; Reisezeit und Weiterleitungen werden nicht
-- überprüft." → "Wählen Sie einen Besuch vor Ort; Reisezeit und Anschlussverbindungen werden
-- nicht geprüft." (exact sentence only).
-- ============================================================================================
with upd as (
  update public.content_translations t
     set fields = translation_fix.rule_b4(t.fields), updated_at = now()
   where t.entity_type = 'destination' and t.locale = 'de'
     and t.fields::text like '%Weiterleitungen%'
     and translation_fix.rule_b4(t.fields) is distinct from t.fields
  returning 1
)
insert into fix_log select 6, 'B4', 'content_translations', 'de', count(*) from upd;

-- ============================================================================================
-- Rule B5 (de): days[].start "Vorgeschlagen: …" / "Empfohlen: …" → "Vorschlag: …", only where
-- the English start of the same day begins with "Suggested:".
-- ============================================================================================
with cand as (
  select t.id, translation_fix.rule_b5(t.fields, d.travel_plan) as new_fields, t.fields as old_fields
  from public.content_translations t
  join public.destinations d on d.slug = t.entity_id
  where t.entity_type = 'destination' and t.locale = 'de'
), upd as (
  update public.content_translations t set fields = c.new_fields, updated_at = now()
  from cand c where c.id = t.id and c.new_fields is distinct from c.old_fields
  returning 1
)
insert into fix_log select 7, 'B5', 'content_translations', 'de', count(*) from upd;

-- ============================================================================================
-- Rule C (de): day start/driving that names the place itself instead of the English starting
-- point. Deterministic in all 25 sample rows: German "Vorschlag: Abfahrt am Morgen ab {name}" and
-- "Etwa N km Luftlinie ab {name}; …" while English says "…departure from {previous stop}" and
-- "About N km from {previous stop}…". Only exact template matches with the same km figure and the
-- same number of days are changed; the place comes from the English plan of the same day.
-- ============================================================================================
with cand as (
  select t.id, translation_fix.rule_c(t.fields, d.travel_plan) as new_fields, t.fields as old_fields
  from public.content_translations t
  join public.destinations d on d.slug = t.entity_id
  where t.entity_type = 'destination' and t.locale = 'de'
    and jsonb_array_length(coalesce(t.fields->'days', '[]'::jsonb)) > 1
), upd as (
  update public.content_translations t set fields = c.new_fields, updated_at = now()
  from cand c where c.id = t.id and c.new_fields is distinct from c.old_fields
  returning 1
)
insert into fix_log select 8, 'C', 'content_translations', 'de', count(*) from upd;

-- ============================================================================================
-- Rule D1 (fr): intel title "Timing" → "Horaires" (exact whole-title match).
-- ============================================================================================
with upd as (
  update public.content_translations t
     set fields = translation_fix.rule_d1(t.fields), updated_at = now()
   where t.entity_type = 'destination' and t.locale = 'fr'
     and translation_fix.rule_d1(t.fields) is distinct from t.fields
  returning 1
)
insert into fix_log select 9, 'D1', 'content_translations', 'fr', count(*) from upd;

-- ============================================================================================
-- Rule D2 (fr): days[].driving duplicate units — "37 km [37 km]", "12 km [7,5 miles]",
-- "33 km (20,5 miles)", "11 miles [18 km]" → "N km" — ONLY when the kept km figure equals the
-- English "About N km" of the same day. Any other number is listed by 02-preview.sql, not changed.
-- ============================================================================================
with cand as (
  select t.id, translation_fix.rule_d2(t.fields, d.travel_plan) as new_fields, t.fields as old_fields
  from public.content_translations t
  join public.destinations d on d.slug = t.entity_id
  where t.entity_type = 'destination' and t.locale = 'fr'
), upd as (
  update public.content_translations t set fields = c.new_fields, updated_at = now()
  from cand c where c.id = t.id and c.new_fields is distinct from c.old_fields
  returning 1
)
insert into fix_log select 10, 'D2', 'content_translations', 'fr', count(*) from upd;

-- ============================================================================================
-- Rule D3 (fr): "pour le {name}" → "pour {name}", "au {name}" → "à {name}",
-- "du {name}" → "de {name}" / "d'{name}" (vowel), where {name} is the row's own fields.name and
-- the name does NOT start with a French generic noun (Parc, Lac, Mont, Massif, Cap, Golfe,
-- Détroit, Pic, Col, Cirque, Gorges, Forêt, Val, Vallée, …). Stop names are never edited.
-- ============================================================================================
with upd as (
  update public.content_translations t
     set fields = translation_fix.rule_d3(t.fields), updated_at = now()
   where t.entity_type = 'destination' and t.locale = 'fr'
     and translation_fix.rule_d3(t.fields) is distinct from t.fields
  returning 1
)
insert into fix_log select 11, 'D3', 'content_translations', 'fr', count(*) from upd;

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

commit;
