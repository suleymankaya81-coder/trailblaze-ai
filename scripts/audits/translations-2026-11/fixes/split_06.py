#!/usr/bin/env python3
"""Split 06-apply-rewrites.sql into files under 40 KB (06-0 … 06-4) with the same logic.

The proposal rows and every SQL statement are copied from 06-apply-rewrites.sql itself, so the
split files cannot drift from the reviewed single file. Run from anywhere:
    python3 scripts/audits/translations-2026-11/fixes/split_06.py
"""
import hashlib, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '06-apply-rewrites.sql')
LIMIT = 40 * 1024          # hard limit per file (bytes)
BATCH = 34 * 1024          # target size of the VALUES part of one load file

src = open(SRC, encoding='utf-8').read()


def between(start, end):
    i = src.index(start)
    j = src.index(end, i)
    return src[i:j]


helper_guard = between("do $$\nbegin\n  if to_regprocedure('translation_fix.jsonb_shape(jsonb)')", "\n-- ====") + "\n"
schema_part = between("create schema if not exists audit_backup;", "create table if not exists audit_backup.rewrites_20261122_proposals")
table_def = between("create table if not exists audit_backup.rewrites_20261122_proposals", "\ninsert into audit_backup.rewrites_20261122_proposals") + "\n"
insert_head = "insert into audit_backup.rewrites_20261122_proposals (locale, slug, field, col, path, decision, old_text, new_text)\nvalues\n"
values_block = between(insert_head, "\non conflict (locale, slug, field) do nothing;")[len(insert_head):]
backup_tables = between("-- Full-row backups, taken once", "alter table audit_backup.rewrites_20261122_proposals    enable")
rls_part = between("alter table audit_backup.rewrites_20261122_proposals    enable", "\n-- ====") + "\n"
apply_part = between("-- ============================================================================================\n-- 2. Apply.", "\ncommit;\n\n-- ====") + "\n"
rollback_body = between("/*\nbegin;\n", "\ncommit;\n*/")[len("/*\nbegin;\n"):]

# One VALUES row per line: "  ('en', 'slug', ...)," — split on row starts.
rows = re.split(r",\n(?=  \(')", values_block.strip('\n'))
assert all(r.startswith("  ('") for r in rows), 'unexpected VALUES layout'
N = len(rows)
assert f"expected {N}" in src, 'row count in 06-apply-rewrites.sql does not match the VALUES rows'

# Content checksum of the proposals, computed the same way the SQL guard computes it.
def parse_row(r):
    m = re.fullmatch(r"\s*\((.*)\)\s*", r, re.S)
    body = m.group(1)
    vals, i = [], 0
    while i < len(body):
        if body.startswith("'", i):
            j, buf = i + 1, []
            while True:
                if body[j] == "'" and body[j + 1:j + 2] == "'":
                    buf.append("'"); j += 2
                elif body[j] == "'":
                    break
                else:
                    buf.append(body[j]); j += 1
            s = ''.join(buf)
            i = j + 1
            if body.startswith("::text[]", i):
                s = s.strip('{}').replace(',', '\x1e'); i += len("::text[]")
            vals.append(s)
        elif body.startswith('null', i):
            vals.append('~'); i += 4
        else:
            i += 1
    assert len(vals) == 8, r[:80]
    return vals

parsed = sorted((parse_row(r) for r in rows), key=lambda v: [x.encode() for x in v[:3]])
digest = hashlib.md5('\x1d'.join('\x1f'.join(v) for v in parsed).encode()).hexdigest()

CHECKSUM_SQL = """md5(string_agg(concat_ws(chr(31), locale, slug, field, col, coalesce(array_to_string(path, chr(30)), '~'),
                               decision, old_text, new_text),
                     chr(29) order by locale collate "C", slug collate "C", field collate "C"))"""

proposals_guard = f"""do $$
declare n int; h text;
begin
  if to_regclass('audit_backup.rewrites_20261122_proposals') is null then
    raise exception 'audit_backup.rewrites_20261122_proposals missing: run 06-0-prepare.sql and all 06-1-load-*.sql first';
  end if;
  select count(*), {CHECKSUM_SQL}
    into n, h from audit_backup.rewrites_20261122_proposals;
  if n <> {N} then
    raise exception 'audit_backup.rewrites_20261122_proposals has % rows, expected {N} (a 06-1-load file missing or the table edited by hand?)', n;
  end if;
  if h is distinct from '{digest}' then
    raise exception 'audit_backup.rewrites_20261122_proposals content checksum % differs from the reviewed proposals ({digest})', h;
  end if;
end $$;
"""

backup_guard = """do $$
declare bad int;
begin
  if to_regclass('audit_backup.rewrites_20261122_destinations') is null
     or to_regclass('audit_backup.rewrites_20261122_translations') is null then
    raise exception 'Backup tables missing: run 06-2-backup.sql first';
  end if;
  select count(*) into bad from pg_class c join pg_namespace s on s.oid = c.relnamespace
  where s.nspname = 'audit_backup'
    and c.relname in ('rewrites_20261122_proposals', 'rewrites_20261122_destinations', 'rewrites_20261122_translations')
    and not c.relrowsecurity;
  if bad > 0 then raise exception 'RLS is off on % audit_backup rewrite tables: run 06-2-backup.sql', bad; end if;
  -- Every affected row that exists now must already be in the backup.
  select count(*) into bad from public.destinations d
  where d.slug in (select slug from audit_backup.rewrites_20261122_proposals where locale = 'en')
    and not exists (select 1 from audit_backup.rewrites_20261122_destinations b where b.id = d.id);
  if bad > 0 then raise exception '% affected destinations are not in the backup: run 06-2-backup.sql', bad; end if;
  select count(*) into bad from public.content_translations t
  where t.entity_type = 'destination'
    and (t.locale, t.entity_id) in (select locale, slug from audit_backup.rewrites_20261122_proposals where locale <> 'en')
    and not exists (select 1 from audit_backup.rewrites_20261122_translations b where b.id = t.id);
  if bad > 0 then raise exception '% affected translations are not in the backup: run 06-2-backup.sql', bad; end if;
end $$;
"""

RUN = "Run with psql -v ON_ERROR_STOP=1 -f <file>, or paste the whole file into the SQL editor (one call per file)."
ORDER = "Order: 06-0-prepare → 06-1-load-001 … {last} → 06-2-backup → 06-3-apply. Rollback: 06-4-rollback."

files = {}

files['06-0-prepare.sql'] = f"""-- 06-0-prepare.sql — step 1 of the split 06-apply-rewrites.sql (generated by split_06.py).
-- Creates the private schema audit_backup (if missing) and the EMPTY proposals table
-- audit_backup.rewrites_20261122_proposals with RLS on and no grants. No change to public tables.
-- Safe to run again (IF NOT EXISTS). {RUN}
-- @@ORDER@@

begin;

{schema_part}{table_def}
alter table audit_backup.rewrites_20261122_proposals enable row level security;
revoke all on audit_backup.rewrites_20261122_proposals from public;
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on audit_backup.rewrites_20261122_proposals from %I', r);
    end if;
  end loop;
end $$;

commit;
"""

batches, cur = [], []
for r in rows:
    if cur and sum(len(x.encode()) + 2 for x in cur) + len(r.encode()) > BATCH:
        batches.append(cur); cur = []
    cur.append(r)
batches.append(cur)
last = f"06-1-load-{len(batches):03d}"

for k, b in enumerate(batches, 1):
    files[f'06-1-load-{k:03d}.sql'] = f"""-- 06-1-load-{k:03d}.sql — proposals batch {k} of {len(batches)} ({len(b)} rows; generated by split_06.py).
-- Inserts reviewed proposals into the PRIVATE table audit_backup.rewrites_20261122_proposals only.
-- No change to public tables. Idempotent: rows already loaded are left as they are (ON CONFLICT DO NOTHING).
-- {RUN}

begin;

do $$
begin
  if to_regclass('audit_backup.rewrites_20261122_proposals') is null then
    raise exception 'audit_backup.rewrites_20261122_proposals missing: run 06-0-prepare.sql first';
  end if;
end $$;

{insert_head}{',\n'.join(b)}
on conflict (locale, slug, field) do nothing;

commit;
"""

files['06-2-backup.sql'] = f"""-- 06-2-backup.sql — full-row backup of exactly the rows 06-3 may change (generated by split_06.py).
-- Refuses to run unless all {N} reviewed proposals are loaded (row count + content checksum).
-- Copies the affected public.destinations / public.content_translations rows ONCE into the PRIVATE
-- tables audit_backup.rewrites_20261122_destinations / _translations (a second run keeps the first
-- backup), enables RLS and revokes access from public/anon/authenticated. Reads public tables only.
-- {RUN}

begin;

{proposals_guard}
{backup_tables}{rls_part}
select 'rewrites_20261122_proposals' as backup_table, count(*) as rows from audit_backup.rewrites_20261122_proposals
union all select 'rewrites_20261122_destinations', count(*) from audit_backup.rewrites_20261122_destinations
union all select 'rewrites_20261122_translations', count(*) from audit_backup.rewrites_20261122_translations;

commit;
"""

files['06-3-apply.sql'] = f"""-- 06-3-apply.sql — THE ONLY FILE THAT CHANGES public TABLES (generated by split_06.py). ONE transaction.
-- Same apply logic and checks as 06-apply-rewrites.sql, reading the proposals from
-- audit_backup.rewrites_20261122_proposals. Refuses to run unless: 01-helper.sql is installed, all
-- {N} proposals are loaded (row count + content checksum), and 06-2-backup.sql has backed up every
-- affected row (backup tables present, RLS on).
--   * A field changes ONLY when its current text still equals the stored old text; otherwise it is
--     logged as 'changed-since-review' (or 'row-missing') and left alone.
--   * Second run: 0 changes ('already-applied').
--   * Final checks raise an exception (nothing committed) on any structure/identity/status problem.
-- {RUN}

begin;

{helper_guard}
{proposals_guard}
{backup_guard}
{apply_part}
commit;
"""

files['06-4-rollback.sql'] = f"""-- 06-4-rollback.sql — undo 06-3-apply.sql (generated by split_06.py; same logic as the rollback
-- section of 06-apply-rewrites.sql). Restores each rewritten field from the backup, but only where
-- the field still holds the text 06-3 wrote (later edits are left alone). Safe to run twice.
-- {RUN}

begin;

do $$
begin
  if to_regclass('audit_backup.rewrites_20261122_proposals') is null then
    raise exception 'Nothing to roll back: audit_backup.rewrites_20261122_proposals does not exist';
  end if;
end $$;

{backup_guard.replace("run 06-2-backup.sql first", "nothing to roll back").replace(": run 06-2-backup.sql'", ": backup incomplete'")}
{rollback_body}
commit;
"""

order = ORDER.format(last=last)
for name, text in files.items():
    text = text.replace('@@ORDER@@', order)
    size = len(text.encode('utf-8'))
    assert size < LIMIT, f'{name} is {size} bytes'
    with open(os.path.join(HERE, name), 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'{name}\t{size}')
print('rows', N, 'batches', len(batches), 'checksum', digest)
