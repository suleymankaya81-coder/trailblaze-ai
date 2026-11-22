-- 02b-preview-rule-a-quality.sql — SELECT-only preview of rule A with the 01c quality filter.
-- Needs 01-helper.sql, 01b-helper-rule-a-v2.sql and 01c-helper-rule-a-quality.sql. Writes nothing.
-- decision: write (03b will write new_value) · natura (Natura 2000, written) ·
--           needs-human (valid sentence but failed the filter → unchanged) · unresolved (no valid sentence → unchanged)

-- One view-like CTE used by every query below.
-- (Repeated in each statement so the file runs in any SQL editor without temp objects.)

-- Q1. Counts per language and decision (fields and rows).
with leaves as (
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
)
select locale, decision, count(*) as fields, count(distinct slug) as rows
from leaves group by 1, 2 order by 1, 2;

-- Q2. Why outputs were held (one row per reason).
with leaves as (
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
)
select locale, regexp_replace(reason, ':.*$', '') as reason, count(*) as fields
from leaves, unnest(reasons) reason
where decision = 'needs-human'
group by 1, 2 order by 1, 3 desc;

-- Q3. Everything 03b will WRITE (slug, field, mode, old, new).
with leaves as (
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
)
select locale, slug, field, mode, old_value as old, new_value as new
from leaves where decision in ('write', 'natura') order by locale, slug, field;

-- Q4. NEEDS-HUMAN list: left unchanged (decision needs-human or unresolved), with the reasons.
with leaves as (
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
)
select locale, slug, field, decision, mode, array_to_string(reasons, '; ') as reasons,
       old_value as current_text, case when decision = 'needs-human' then new_value end as rejected_candidate
from leaves where decision in ('needs-human', 'unresolved') order by locale, slug, field;

-- Q5. Slugs on the fixed needs-human list and whether they have any rule-A field at all.
select s.slug,
       exists (select 1 from public.destinations d where d.slug = s.slug) as destination_exists
from unnest(translation_fix.needs_human_slugs()) s(slug) order by 1;
