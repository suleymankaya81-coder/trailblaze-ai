-- test-rule-a-v2.sql — how the numbers in summary.md were produced (throwaway local PostgreSQL 16).
-- Setup: tables loaded from sample.json, plus preview_items(slug, locale, field, mode, old, new) holding the
-- 463 items of preview-2026-11-21/A3-A4-fallback-unresolved.txt; then 00-backup, 01-helper, 01b-helper-rule-a-v2.

-- Independent check built only from the patterns named in the task (German verb-final "… gegründet wurde"
-- is allowed: an auxiliary after a participle closes a German subordinate clause).
create or replace function pg_temp.simple_dangling(t text) returns boolean language sql immutable as $$
  select (regexp_replace(btrim(t), '[.!?…]+$', '') ~* (
     '\y(qui|que|dont|der|die|das|which|that|wurde|wurden|est|a été|ist|sind|of|in|on|at|by|to|from|with|for|since|en|le|la|les|du|de|des|au|à|dans|par|pour|avec|depuis|seit|am|im|vom|von|mit|bis|und|and|et)$'
     || '|\y[0-9]{1,2}(\.|er|st|nd|rd|th)?\s+(' || translation_fix.month_names() || ')$'
     || '|\y(in|en|im|on|since|seit|depuis|le|am)\s+(' || translation_fix.month_names() || ')$')
     and regexp_replace(btrim(t), '[.!?…]+$', '') !~ '[a-zäöüß-]+(t|en)\s+(wurde|wurden|ist|sind)$')
  or btrim(t) ~ '^(Mit|With|Avec)\y'
$$;

-- Before: the v1 fallback outputs that Lovable's preview produced.
select 'before' as run, count(*) as outputs,
       count(*) filter (where cardinality(translation_fix.clause_problems(regexp_replace(btrim(new), '[.!?…]+$', ''))) > 0) as fail_full_check,
       count(*) filter (where pg_temp.simple_dangling(new)) as fail_simple_check
from preview_items where mode = 'fallback';

-- After: v2 on the same old texts.
select 'after' as run, count(*) as outputs,
       count(*) filter (where cardinality(translation_fix.clause_problems(regexp_replace(btrim(r.result), '[.!?…]+$', ''))) > 0) as fail_full_check,
       count(*) filter (where pg_temp.simple_dangling(r.result)) as fail_simple_check,
       count(*) filter (where r.result ~ translation_fix.placeholder_regex()) as still_token
from preview_items p, lateral translation_fix.rule_a_text(p.old, substring(p.field from '([A-Za-z_]+)$')) r
where r.mode <> 'unresolved';

select p.locale, r.mode, count(*)
from preview_items p, lateral translation_fix.rule_a_text(p.old, substring(p.field from '([A-Za-z_]+)$')) r
group by 1, 2 order by 1, 2;
