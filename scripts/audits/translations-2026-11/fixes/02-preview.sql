-- 02-preview.sql — SELECT-only dry run of every rule in 03-apply.sql. Writes nothing.
-- Needs 01-helper.sql (functions only). Each rule is evaluated independently on the current data.
-- Every block returns: counts per locale, then up to 10 before/after examples (slug, field, old, new).
-- Lists that need a person (rule A fallback/unresolved, D2 mismatches, D3 skipped names,
-- rule E truncations) are returned in full or as counts, as noted.

-- ── 0. Overview: rows that contain each placeholder token (compare with the live counts:
--       de [dated source] 10 / [datierter Quelle] 84 / [datiert Quelle] 123; fr [dated source] 229 /
--       [source datée] 76; English 307 published destinations).
select t.locale, tok.token, count(*) as rows
from public.content_translations t
cross join (values ('[dated source]'), ('[source datée]'), ('[datierter Quelle]'), ('[datiert Quelle]')) tok(token)
where t.entity_type = 'destination' and t.locale in ('de', 'fr') and t.status = 'published'
  and strpos(t.fields::text, tok.token) > 0
group by 1, 2
union all
select 'en (published destinations)', '[dated source]', count(*) from public.destinations
where status = 'published'
  and strpos(concat_ws(' ', tagline, seo_title, seo_description, best_season, permit_headline, permit_note, notes, travel_plan::text), '[dated source]') > 0
order by 1, 2;

-- ── A. Placeholder sentences ─────────────────────────────────────────────────────────────────
-- A1 counts per locale and outcome (removed / natura / fallback / unresolved), in fields:
with leaves as (
  select 'en' as locale, d.slug, l.*
  from public.destinations d,
  lateral (
    select * from translation_fix.placeholder_leaves(jsonb_build_object(
      'tagline', d.tagline, 'seo_title', d.seo_title, 'seo_description', d.seo_description,
      'best_season', d.best_season, 'permit_headline', d.permit_headline, 'permit_note', d.permit_note,
      'notes', d.notes, 'travel_plan', d.travel_plan))
  ) l
  union all
  select t.locale, t.entity_id, l.*
  from public.content_translations t, lateral translation_fix.placeholder_leaves(t.fields) l
  where t.entity_type = 'destination' and t.locale in ('de', 'fr')
)
select locale, mode, count(distinct slug) as rows, count(*) as fields
from leaves group by 1, 2 order by 1, 2;

-- A2 ten examples per locale (removed sentences / Natura 2000):
with leaves as (
  select 'en' as locale, d.slug, l.*
  from public.destinations d,
  lateral translation_fix.placeholder_leaves(jsonb_build_object(
      'tagline', d.tagline, 'seo_description', d.seo_description, 'permit_note', d.permit_note,
      'travel_plan', d.travel_plan)) l
  union all
  select t.locale, t.entity_id, l.*
  from public.content_translations t, lateral translation_fix.placeholder_leaves(t.fields) l
  where t.entity_type = 'destination' and t.locale in ('de', 'fr')
), ranked as (
  select *, row_number() over (partition by locale order by slug, field) as n
  from leaves where mode in ('removed', 'natura')
)
select locale, slug, field, mode, old_value as old, new_value as new from ranked where n <= 10
order by locale, n;

-- A3 ALL fallback cases (field would have been empty, first clause kept) — review each one:
with leaves as (
  select 'en' as locale, d.slug, l.*
  from public.destinations d,
  lateral translation_fix.placeholder_leaves(jsonb_build_object(
      'tagline', d.tagline, 'seo_title', d.seo_title, 'seo_description', d.seo_description,
      'best_season', d.best_season, 'permit_headline', d.permit_headline, 'permit_note', d.permit_note,
      'notes', d.notes, 'travel_plan', d.travel_plan)) l
  union all
  select t.locale, t.entity_id, l.*
  from public.content_translations t, lateral translation_fix.placeholder_leaves(t.fields) l
  where t.entity_type = 'destination' and t.locale in ('de', 'fr')
)
select locale, slug, field, old_value as old, new_value as new from leaves where mode = 'fallback'
order by locale, slug, field;

-- A4 ALL unresolved cases (left unchanged; a person must rewrite or remove the field):
with leaves as (
  select 'en' as locale, d.slug, l.*
  from public.destinations d,
  lateral translation_fix.placeholder_leaves(jsonb_build_object(
      'tagline', d.tagline, 'seo_title', d.seo_title, 'seo_description', d.seo_description,
      'best_season', d.best_season, 'permit_headline', d.permit_headline, 'permit_note', d.permit_note,
      'notes', d.notes, 'travel_plan', d.travel_plan)) l
  union all
  select t.locale, t.entity_id, l.*
  from public.content_translations t, lateral translation_fix.placeholder_leaves(t.fields) l
  where t.entity_type = 'destination' and t.locale in ('de', 'fr')
)
select locale, slug, field, old_value as old from leaves where mode = 'unresolved'
order by locale, slug, field;

-- A4b removed sentences that leave a text starting with a pronoun ("It is…", "Il a…", "Es ist…"):
--     the reference to the place was in the removed first sentence — check these by eye.
with leaves as (
  select 'en' as locale, d.slug, l.*
  from public.destinations d,
  lateral translation_fix.placeholder_leaves(jsonb_build_object(
      'tagline', d.tagline, 'seo_description', d.seo_description, 'permit_note', d.permit_note,
      'travel_plan', d.travel_plan)) l
  union all
  select t.locale, t.entity_id, l.*
  from public.content_translations t, lateral translation_fix.placeholder_leaves(t.fields) l
  where t.entity_type = 'destination' and t.locale in ('de', 'fr')
)
select locale, slug, field, new_value as new from leaves
where mode = 'removed'
  and new_value ~ '^(It|They|This|Il|Elle|Ils|Elles|Cette|Ce|Es|Er|Sie|Dieser|Diese|Dieses)\M'
  and old_value !~ '^(It|They|This|Il|Elle|Ils|Elles|Cette|Ce|Es|Er|Sie|Dieser|Diese|Dieses)\M'
order by locale, slug, field;

-- A5 tokens inside protected keys (stop names, labels, links) — never changed automatically:
select 'en' as locale, d.slug, s.value as stop_name
from public.destinations d, jsonb_path_query(d.travel_plan, '$.days[*].stops[*].name') s(value)
where s.value::text ~ '\[(dated source|source datée|datierter Quelle|datiert Quelle)\]'
union all
select t.locale, t.entity_id, s.value
from public.content_translations t, jsonb_path_query(t.fields, '$.days[*].stops[*].name') s(value)
where t.entity_type = 'destination' and t.locale in ('de', 'fr')
  and s.value::text ~ '\[(dated source|source datée|datierter Quelle|datiert Quelle)\]';

-- A6 search pages (seo_landing_pages) with a token — NOT changed by 03-apply.sql, count only:
select count(*) as landing_pages_with_token
from public.seo_landing_pages
where concat_ws(' ', seo_title, seo_description, intro_content, content_sections::text)
      ~ '\[(dated source|source datée|datierter Quelle|datiert Quelle)\]';

-- ── Generic per-rule preview (B1, B2, B3, B4, B5, C, D1, D2, D3) ──────────────────────────────
-- For each rule: rows affected per locale, then 10 examples.
with rules as (
  select 'B1' as rule, t.locale, t.entity_id as slug, t.fields as old_fields, translation_fix.rule_b1(t.fields) as new_fields
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'B2', t.locale, t.entity_id, t.fields, translation_fix.rule_b2(t.fields)
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'B3', t.locale, t.entity_id, t.fields, translation_fix.rule_b3(t.fields)
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'B4', t.locale, t.entity_id, t.fields, translation_fix.rule_b4(t.fields)
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'B5', t.locale, t.entity_id, t.fields, translation_fix.rule_b5(t.fields, d.travel_plan)
  from public.content_translations t join public.destinations d on d.slug = t.entity_id
  where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'C', t.locale, t.entity_id, t.fields, translation_fix.rule_c(t.fields, d.travel_plan)
  from public.content_translations t join public.destinations d on d.slug = t.entity_id
  where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'D1', t.locale, t.entity_id, t.fields, translation_fix.rule_d1(t.fields)
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'fr'
  union all
  select 'D2', t.locale, t.entity_id, t.fields, translation_fix.rule_d2(t.fields, d.travel_plan)
  from public.content_translations t join public.destinations d on d.slug = t.entity_id
  where t.entity_type = 'destination' and t.locale = 'fr'
  union all
  select 'D3', t.locale, t.entity_id, t.fields, translation_fix.rule_d3(t.fields)
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'fr'
), changed as (
  select * from rules where new_fields is distinct from old_fields
)
select rule, locale, count(*) as rows_affected from changed group by 1, 2
union all
select r.rule, r.locale, 0 from (values ('B1','de'),('B2','de'),('B3','de'),('B4','de'),('B5','de'),('C','de'),('D1','fr'),('D2','fr'),('D3','fr')) r(rule, locale)
where not exists (select 1 from changed c where c.rule = r.rule)
order by 1, 2;

with rules as (
  select 'B1' as rule, t.entity_id as slug, t.fields as old_fields, translation_fix.rule_b1(t.fields) as new_fields
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'B2', t.entity_id, t.fields, translation_fix.rule_b2(t.fields)
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'B3', t.entity_id, t.fields, translation_fix.rule_b3(t.fields)
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'B4', t.entity_id, t.fields, translation_fix.rule_b4(t.fields)
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'B5', t.entity_id, t.fields, translation_fix.rule_b5(t.fields, d.travel_plan)
  from public.content_translations t join public.destinations d on d.slug = t.entity_id
  where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'C', t.entity_id, t.fields, translation_fix.rule_c(t.fields, d.travel_plan)
  from public.content_translations t join public.destinations d on d.slug = t.entity_id
  where t.entity_type = 'destination' and t.locale = 'de'
  union all
  select 'D1', t.entity_id, t.fields, translation_fix.rule_d1(t.fields)
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'fr'
  union all
  select 'D2', t.entity_id, t.fields, translation_fix.rule_d2(t.fields, d.travel_plan)
  from public.content_translations t join public.destinations d on d.slug = t.entity_id
  where t.entity_type = 'destination' and t.locale = 'fr'
  union all
  select 'D3', t.entity_id, t.fields, translation_fix.rule_d3(t.fields)
  from public.content_translations t where t.entity_type = 'destination' and t.locale = 'fr'
), diffs as (
  select r.rule, r.slug, d.field, d.old_value, d.new_value,
         row_number() over (partition by r.rule order by r.slug, d.field) as n
  from rules r, lateral translation_fix.jsonb_string_diff(r.old_fields, r.new_fields) d
  where r.new_fields is distinct from r.old_fields
)
select rule, slug, field, old_value as old, new_value as new from diffs where n <= 10 order by rule, n;

-- ── C: German multi-day rows that look wrong but do NOT match the exact template (listed, not fixed)
select t.entity_id as slug, i as day_index,
       t.fields->'days'->i->>'start' as de_start, d.travel_plan->'days'->i->>'start' as en_start
from public.content_translations t
join public.destinations d on d.slug = t.entity_id,
lateral generate_series(1, jsonb_array_length(coalesce(t.fields->'days', '[]'::jsonb)) - 1) i
where t.entity_type = 'destination' and t.locale = 'de'
  and d.travel_plan->'days'->i->>'start' ~ '^Suggested: morning departure from '
  and position(substring(d.travel_plan->'days'->i->>'start' from '^Suggested: morning departure from (.+)$')
               in t.fields->'days'->i->>'start') = 0
  and translation_fix.rule_c(t.fields, d.travel_plan)->'days'->i->>'start' = t.fields->'days'->i->>'start'
order by 1, 2;

-- ── D2: ALL French distances whose number differs from the English km (listed, never changed)
select t.entity_id as slug, i as day_index, t.fields->'days'->i->>'driving' as fr_driving,
       d.travel_plan->'days'->i->>'driving' as en_driving
from public.content_translations t
join public.destinations d on d.slug = t.entity_id,
lateral generate_series(0, jsonb_array_length(coalesce(t.fields->'days', '[]'::jsonb)) - 1) i,
lateral translation_fix.fr_distance_fix(t.fields->'days'->i->>'driving', d.travel_plan->'days'->i->>'driving') f
where t.entity_type = 'destination' and t.locale = 'fr' and f.status = 'mismatch'
order by 1, 2;

-- ── D3: French rows skipped because the name starts with a generic noun (count + 20 examples)
with s as (
  select t.entity_id as slug, t.fields->>'name' as name
  from public.content_translations t
  where t.entity_type = 'destination' and t.locale = 'fr'
    and translation_fix.fr_name_takes_article(t.fields->>'name')
    and (strpos(t.fields::text, 'pour le ' || (t.fields->>'name')) > 0
         or strpos(t.fields::text, 'au ' || (t.fields->>'name')) > 0
         or strpos(t.fields::text, 'du ' || (t.fields->>'name')) > 0)
)
select 'skipped (generic noun)' as d3, count(*)::text as value from s
union all
select 'example', slug || ' — ' || name from (select * from s order by slug limit 20) x;

-- ── E: titles/descriptions/taglines that end mid-word or mid-sentence (list only, never fixed).
-- Heuristic: no closing punctuation and the length sits at the cut limit (60 / 160 / 110).
select t.locale, t.entity_id as slug, f.key as field, length(f.value) as len, right(f.value, 40) as ending
from public.content_translations t,
lateral (values ('metaTitle', t.fields->>'metaTitle'), ('metaDescription', t.fields->>'metaDescription'),
                ('tagline', t.fields->>'tagline')) f(key, value)
where t.entity_type = 'destination' and t.locale in ('de', 'fr') and f.value is not null
  and f.value !~ '[.!?…»)"“”]\s*$'
  and ((f.key = 'metaTitle' and length(f.value) >= 58 and f.value !~ '(Reiseplan|conseils|itinéraire|guide|Guide)$')
       or (f.key = 'metaDescription' and length(f.value) >= 120)
       or (f.key = 'tagline' and length(f.value) >= 100))
order by 1, 3, 2;
