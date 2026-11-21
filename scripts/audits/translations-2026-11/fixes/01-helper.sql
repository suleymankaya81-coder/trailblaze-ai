-- 01-helper.sql — helper functions for the 2026-11 translation fixes.
--
-- Creates ONLY functions, in the private schema `translation_fix` (not exposed through the
-- Supabase API; anon/authenticated get no access). It does not read or change any row.
-- Safe to run several times (CREATE OR REPLACE). Run after 00-backup.sql, before 02/03.
--
-- Design:
--   * translation_fix.jsonb_walk(doc, rules, skip_keys) walks a JSONB value recursively and applies
--     an ordered list of text rules to every string value. Objects keep their keys, arrays keep
--     their order and length, non-string values are untouched, and the result is built with
--     jsonb functions, so JSON structure and escaping can never break.
--   * Rule objects in `rules` (jsonb array), applied in order to each string:
--       {"op":"literal","from":"…","to":"…"}                  exact substring replacement
--       {"op":"regex","pattern":"…","replacement":"…","flags":"g"}   regexp_replace
--       {"op":"drop_placeholder_sentences"}                    rule A (see below)
--       {"op":"fr_article","name":"…"}                         rule D3 (see below)
--   * Keys listed in skip_keys are never modified (routing identities and links).
--   * Every rule function returns its input unchanged when nothing matches, so UPDATE … WHERE
--     new IS DISTINCT FROM old touches only real matches and a second run changes nothing.

begin;

create schema if not exists translation_fix;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema translation_fix from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on schema translation_fix from authenticated';
  end if;
  execute 'revoke all on schema translation_fix from public';
end $$;

-- Keys whose string values are never rewritten (stop names are routing identities; the
-- translated page shows the stored stop name, so changing it in one language only would drift).
create or replace function translation_fix.default_skip_keys() returns text[]
language sql immutable as $$
  select array['name','stop_id','routingName','kind','url','sourceUrl','source_url','label','id',
               'lat','lng','citation','citations','photo','image']::text[]
$$;

------------------------------------------------------------------------------------------------
-- Rule A: remove every sentence that contains a placeholder token.
------------------------------------------------------------------------------------------------
create or replace function translation_fix.placeholder_regex() returns text
language sql immutable as $$
  select '\[(dated source|source datée|datierter Quelle|datiert Quelle)\]'
$$;

-- True when the text ends with an unclosed "[" whose fragment is the start of a token
-- (truncated tagline/metaDescription such as "… en juillet [da").
create or replace function translation_fix.has_truncated_token_tail(s text) returns boolean
language plpgsql immutable as $$
declare frag text;
begin
  if s is null or s !~ '\[[^\]]*$' then return false; end if;
  frag := substring(s from '\[([^\]]*)$');
  if length(frag) < 2 then return false; end if;
  return 'dated source' like frag || '%' or 'source datée' like frag || '%'
      or 'datierter Quelle' like frag || '%' or 'datiert Quelle' like frag || '%';
end $$;

-- Remove trailing words that would dangle after the token is cut ("established in", "créé en",
-- "gegründet im"). Months are deliberately NOT stripped ("ouvert de début mai au 30 septembre").
create or replace function translation_fix.strip_dangling(s text) returns text
language plpgsql immutable as $$
declare
  t text := btrim(coalesce(s, ''));
  last_word text;
  dangling text[] := array[
    -- en
    'in','on','at','of','since','from','between','by','until','to','and','or','the','a','an','was',
    'were','is','are','been','be','which','that','around','about','circa','c.','early','late','mid',
    'during','as','established','founded','created','opened','designated','declared','inaugurated',
    'awarded','listed','built','completed','named','launched','started','revealed','renamed',
    'became','protected',
    -- fr
    'en','le','la','les','l''','du','de','des','d''','depuis','entre','et','ou','au','aux','à',
    'dans','vers','été','a','ont','est','sont','créé','créée','créés','créées','fondé','fondée',
    'établi','établie','inauguré','inaugurée','ouvert','ouverte','classé','classée','classés',
    'classées','déclaré','déclarée','désigné','désignée','achevé','construit','nommé','devenu',
    'protégé','fondés',
    -- de
    'im','am','an','auf','um','seit','von','vom','bis','zwischen','und','oder','der','die','das',
    'dem','den','ein','eine','wurde','wurden','ist','sind','war','waren','gegründet','eröffnet',
    'errichtet','eingerichtet','ausgewiesen','erklärt','geschaffen','benannt','gebaut','ernannt',
    'jahr','jahre','jahren'];
begin
  loop
    t := regexp_replace(t, '[\s,;:(\[–—-]+$', '');
    -- "… by UNESCO in July", "… en juillet", "… im Mai": a bare month without day or year says nothing.
    t := regexp_replace(t, '\s(in|en|im|au mois de)\s(January|February|March|April|May|June|July|August|September|October|November|December|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)$', '');
    last_word := lower(substring(t from '(\S+)$'));
    exit when last_word is null;
    if last_word = any(dangling) or last_word ~ '^[0-9]+(er|e|\.)?$' then
      t := btrim(left(t, length(t) - length(substring(t from '(\S+)$'))));
    else
      exit;
    end if;
  end loop;
  return t;
end $$;

-- Core of rule A. mode: 'none' (no token), 'natura' (only "Natura 2000" restored),
-- 'removed' (token sentences removed), 'fallback' (field would be empty: first clause kept),
-- 'unresolved' (too little text before the token: field left unchanged, needs a person).
create or replace function translation_fix.drop_placeholder_sentences_ex(s text, out result text, out mode text)
language plpgsql immutable as $$
declare
  tok text := translation_fix.placeholder_regex();
  prot constant text := chr(57344);   -- private-use char: protected period
  sep  constant text := chr(57345);   -- private-use char: sentence separator
  work text;
  pieces text[];
  kept text[] := '{}';
  piece text;
  first_hit text;
  clause text;
  i int;
  n int;
begin
  result := s; mode := 'none';
  if s is null then return; end if;
  if s !~ tok and not translation_fix.has_truncated_token_tail(s) then return; end if;

  -- A0 (certain): the redaction turned the EU network name "Natura 2000" into "Natura [token]".
  work := regexp_replace(s, 'Natura([ -])\[(dated source|source datée|datierter Quelle|datiert Quelle)\]',
                         'Natura\12000', 'g');
  if work !~ tok and not translation_fix.has_truncated_token_tail(work) then
    result := work; mode := 'natura'; return;
  end if;

  -- Protect periods that do not end a sentence.
  work := regexp_replace(work,
    '(^|[^[:alnum:]])(St|Ste|Mt|Dr|Nr|ca|Ca|bzw|vgl|Jh|Mio|Mrd|Str|No|Nos|Ft|Pt|Co|Jr|Sr|Hwy|Rd|Ave|Blvd|approx|etc|env|z\.B|d\.h|u\.a|e\.g|i\.e|U\.S)\.',
    '\1\2' || prot, 'g');
  work := regexp_replace(work,
    '([0-9]{1,2})\.(\s+)(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|Jahrhundert|Jh)',
    '\1' || prot || '\2\3', 'g');

  -- Split after . ! ? … (plus closing quotes/brackets) followed by whitespace, unless the next
  -- character is a lower-case letter. Each later piece keeps its leading whitespace.
  work := regexp_replace(work, '([.!?…]+["»“”''’)\]]*)(\s+)(?![a-zß-öø-ÿ])', '\1' || sep || '\2', 'g');
  pieces := string_to_array(work, sep);
  n := coalesce(array_length(pieces, 1), 0);

  for i in 1 .. n loop
    piece := pieces[i];
    if piece ~ tok or (i = n and translation_fix.has_truncated_token_tail(piece)) then
      if first_hit is null then first_hit := piece; end if;
    else
      kept := kept || piece;
    end if;
  end loop;

  result := btrim(replace(array_to_string(kept, ''), prot, '.'));
  mode := 'removed';

  -- Nothing meaningful left (empty, only a "Name :" / "Name:" prefix, or a cut-off fragment of
  -- fewer than 5 words such as "Dieses"): keep the first clause before the token instead.
  if result = '' or result ~ '^[^.!?]*:$'
     or array_length(regexp_split_to_array(result, '\s+'), 1) < 5 then
    result := case when result ~ '^[^.!?]*:$' then result else '' end;
    clause := replace(first_hit, prot, '.');
    clause := regexp_replace(clause, '\[[^\]]*\].*$', '');          -- cut at the first token
    clause := regexp_replace(clause, '\[[^\]]*$', '');              -- or at a truncated token
    clause := btrim(translation_fix.strip_dangling(clause));
    -- Too little left to be a sentence (fewer than 5 words, e.g. only the place name): leave the
    -- field unchanged; it is reported as 'unresolved' and needs a person.
    -- (Words are counted after a "Name :" prefix, so the prefix alone never counts.)
    if clause = '' or coalesce(array_length(regexp_split_to_array(
         btrim(regexp_replace(clause, '^[^.!?]*:\s*', '')), '\s+'), 1), 0) < 5 then
      result := s; mode := 'unresolved'; return;
    end if;
    if clause !~ '[.!?…]$' then clause := clause || '.'; end if;
    result := case when result <> '' then result || ' ' || clause else clause end;
    mode := 'fallback';
  end if;
end $$;

create or replace function translation_fix.drop_placeholder_sentences(s text) returns text
language sql immutable as $$ select (translation_fix.drop_placeholder_sentences_ex(s)).result $$;

-- Every string leaf of a document with its rule-A mode (used by the preview report).
create or replace function translation_fix.placeholder_leaves(doc jsonb, path text default '',
    skip_keys text[] default translation_fix.default_skip_keys())
returns table(field text, old_value text, new_value text, mode text)
language plpgsql immutable as $$
declare k text; i int; r record;
begin
  if doc is null then return; end if;
  if jsonb_typeof(doc) = 'string' then
    select * into r from translation_fix.drop_placeholder_sentences_ex(doc #>> '{}');
    if r.mode <> 'none' then
      field := path; old_value := doc #>> '{}'; new_value := r.result; mode := r.mode; return next;
    end if;
  elsif jsonb_typeof(doc) = 'object' then
    for k in select jsonb_object_keys(doc) order by 1 loop
      if not (k = any(skip_keys)) then
        return query select * from translation_fix.placeholder_leaves(doc->k, case when path = '' then k else path || '.' || k end, skip_keys);
      end if;
    end loop;
  elsif jsonb_typeof(doc) = 'array' then
    for i in 0 .. jsonb_array_length(doc) - 1 loop
      return query select * from translation_fix.placeholder_leaves(doc->i, path || '[' || i || ']', skip_keys);
    end loop;
  end if;
end $$;

------------------------------------------------------------------------------------------------
-- Rule D3: French article in front of the row's own name.
------------------------------------------------------------------------------------------------
create or replace function translation_fix.regex_escape(s text) returns text
language sql immutable as $$
  select regexp_replace(s, '([.^$*+?()\[\]{}|\\-])', '\\\1', 'g')
$$;

-- Names that start with a French generic noun keep their article ("le Parc …", "du Lac …").
create or replace function translation_fix.fr_name_takes_article(name text) returns boolean
language sql immutable as $$
  select name ~* ('^(Parc|Lac|Mont|Monts|Massif|Cap|Golfe|Détroit|Pic|Col|Cirque|Gorge|Gorges|Forêt|Bois|'
               || 'Val|Vallée|Plateau|Marais|Étang|Pointe|Baie|Réserve|Domaine|Pont|Canal|Château|Musée|'
               || 'Jardin|Côte|Plage|Rocher|Roc|Aven|Grotte|Gouffre|Causse|Puy|Dent|Aiguille|Mer|Île|'
               || 'Îles|Archipel|Delta|Glacier|Barrage|Cascade|Chute|Chutes|Source|Sentier|Route|'
               || 'Chemin|Port|Phare|Fort|Abbaye|Désert|Volcan|Lagune|Estuaire|Presqu''île|Péninsule|'
               || 'Dune|Falaise|Grand|Grande|Petit|Petite|Haut|Haute|Bas|Basse)([^[:alnum:]]|$)')
$$;

create or replace function translation_fix.fr_article(s text, name text) returns text
language plpgsql immutable as $$
declare
  n text;
  de text;
  left_b constant text := '(^|[^A-Za-zÀ-ÿ])';
  right_b constant text := '(?![A-Za-zÀ-ÿ0-9])';
begin
  if s is null or name is null or name = '' or translation_fix.fr_name_takes_article(name) then
    return s;
  end if;
  if position(name in s) = 0 then return s; end if;
  n := translation_fix.regex_escape(name);
  de := case when name ~* '^[aeiouyæøåäöüéèêîôûœ]' then 'd''' else 'de ' end;
  s := regexp_replace(s, left_b || 'pour le ' || n || right_b, '\1pour ' || replace(name, '\', '\\'), 'g');
  s := regexp_replace(s, left_b || 'au ' || n || right_b, '\1à ' || replace(name, '\', '\\'), 'g');
  s := regexp_replace(s, left_b || 'du ' || n || right_b, '\1' || de || replace(name, '\', '\\'), 'g');
  return s;
end $$;

------------------------------------------------------------------------------------------------
-- Generic walker.
------------------------------------------------------------------------------------------------
create or replace function translation_fix.apply_text_rules(s text, rules jsonb) returns text
language plpgsql immutable as $$
declare r jsonb;
begin
  if s is null then return s; end if;
  for r in select value from jsonb_array_elements(coalesce(rules, '[]'::jsonb)) loop
    case r->>'op'
      when 'literal' then s := replace(s, r->>'from', r->>'to');
      when 'regex' then s := regexp_replace(s, r->>'pattern', r->>'replacement', coalesce(r->>'flags', 'g'));
      when 'drop_placeholder_sentences' then s := translation_fix.drop_placeholder_sentences(s);
      when 'fr_article' then s := translation_fix.fr_article(s, r->>'name');
      else raise exception 'unknown rule op %', r->>'op';
    end case;
  end loop;
  return s;
end $$;

create or replace function translation_fix.jsonb_walk(doc jsonb, rules jsonb,
    skip_keys text[] default translation_fix.default_skip_keys()) returns jsonb
language plpgsql immutable as $$
declare
  t text := jsonb_typeof(doc);
  out jsonb;
begin
  if doc is null then return null; end if;
  if t = 'string' then
    return to_jsonb(translation_fix.apply_text_rules(doc #>> '{}', rules));
  elsif t = 'object' then
    select coalesce(jsonb_object_agg(key,
             case when key = any(skip_keys) then value
                  else translation_fix.jsonb_walk(value, rules, skip_keys) end), '{}'::jsonb)
      into out from jsonb_each(doc);
    return out;
  elsif t = 'array' then
    select coalesce(jsonb_agg(translation_fix.jsonb_walk(value, rules, skip_keys) order by ord), '[]'::jsonb)
      into out from jsonb_array_elements(doc) with ordinality as e(value, ord);
    return out;
  else
    return doc;   -- number, boolean, null
  end if;
end $$;

-- All string leaves that differ between two documents of the same shape (for the preview).
create or replace function translation_fix.jsonb_string_diff(a jsonb, b jsonb, path text default '')
returns table(field text, old_value text, new_value text)
language plpgsql immutable as $$
declare k text; i int;
begin
  if a is null or b is null then return; end if;
  if jsonb_typeof(a) = 'string' and jsonb_typeof(b) = 'string' then
    if a <> b then field := path; old_value := a #>> '{}'; new_value := b #>> '{}'; return next; end if;
  elsif jsonb_typeof(a) = 'object' and jsonb_typeof(b) = 'object' then
    for k in select jsonb_object_keys(a) order by 1 loop
      return query select * from translation_fix.jsonb_string_diff(a->k, b->k, case when path = '' then k else path || '.' || k end);
    end loop;
  elsif jsonb_typeof(a) = 'array' and jsonb_typeof(b) = 'array' then
    for i in 0 .. jsonb_array_length(a) - 1 loop
      return query select * from translation_fix.jsonb_string_diff(a->i, b->i, path || '[' || i || ']');
    end loop;
  end if;
end $$;

------------------------------------------------------------------------------------------------
-- Rule functions (one per rule; each returns the input unchanged when nothing matches).
------------------------------------------------------------------------------------------------

-- A: placeholders in any JSONB document (translations' fields, destinations.travel_plan).
create or replace function translation_fix.rule_a(doc jsonb) returns jsonb
language sql immutable as $$
  select translation_fix.jsonb_walk(doc, '[{"op":"drop_placeholder_sentences"}]'::jsonb)
$$;

-- B1: German permit/day note sentence with lowercase nouns.
create or replace function translation_fix.rule_b1(doc jsonb) returns jsonb
language sql immutable as $$
  select translation_fix.jsonb_walk(doc, jsonb_build_array(jsonb_build_object('op','literal',
    'from','Eintritt, aktivitätsberechtigungen und Übernachtung sind separate Überprüfungen; die quellenauszüge unten stellen die verfügbarkeit für ihre daten nicht fest.',
    'to',  'Eintritt, Aktivitätsgenehmigungen und Übernachtung müssen separat geprüft werden; die Quellenauszüge unten belegen keine Verfügbarkeit für Ihre Reisedaten.')))
$$;

-- B2: "legen … fest / stellen … fest / erstellen …" → "belegen" (exact template sentences).
create or replace function translation_fix.rule_b2(doc jsonb) returns jsonb
language sql immutable as $$
  select translation_fix.jsonb_walk(doc, '[
    {"op":"regex","pattern":"Die überprüften Quellen legen keine aktuellen Parkbedingungen für (.+?) fest\\.","replacement":"Die geprüften Quellen belegen keine aktuellen Parkbedingungen für \\1."},
    {"op":"regex","pattern":"Die überprüften Quellen legen keine mobile Abdeckung für (.+?) fest\\.","replacement":"Die geprüften Quellen belegen keinen Mobilfunkempfang für \\1."},
    {"op":"regex","pattern":"Die überprüften Quellen stellen keine Kraftstoffverfügbarkeit für (.+?) fest\\.","replacement":"Die geprüften Quellen belegen keine Tankmöglichkeiten für \\1."},
    {"op":"regex","pattern":"Die überprüften Quellen erstellen keine Best-Saison-Empfehlung für (.+?)\\.(\\s|$)","replacement":"Die geprüften Quellen belegen keine Empfehlung zur besten Reisezeit für \\1.\\2"},
    {"op":"regex","pattern":"Die überprüften Quellen legen nicht alle aktuellen Zugangsbeschränkungen für (.+?) fest\\.","replacement":"Die geprüften Quellen belegen nicht alle aktuellen Zugangsbeschränkungen für \\1."},
    {"op":"regex","pattern":"Die überprüften Quellen legen keinen gemessenen Ankunftsplan oder Versorgungsstopps für (.+?) fest\\.","replacement":"Die geprüften Quellen belegen weder einen gemessenen Ankunftsplan noch Versorgungsstopps für \\1."},
    {"op":"regex","pattern":"Die überprüften Quellen legen keine Fahrzeuggröße oder Mietbeschränkungen fest; nehmen Sie keinen RV-Zugang für (.+?) an\\.","replacement":"Die geprüften Quellen belegen keine Beschränkungen für Fahrzeuggröße oder Mietwagen; gehen Sie nicht davon aus, dass \\1 mit dem Wohnmobil erreichbar ist."},
    {"op":"regex","pattern":"Die überprüften Quellen legen keinen verifizierten Sonnenauf- oder -untergangsstandpunkt für (.+?) fest\\.","replacement":"Die geprüften Quellen belegen keinen verifizierten Aussichtspunkt für Sonnenauf- oder -untergang bei \\1."}
  ]'::jsonb)
$$;

-- B3 (de) / D1 (fr): intel titles, exact whole-value matches only.
create or replace function translation_fix.map_intel_titles(doc jsonb, mapping jsonb) returns jsonb
language plpgsql immutable as $$
declare i int; t text;
begin
  if doc is null or jsonb_typeof(doc->'intel') is distinct from 'array' then return doc; end if;
  for i in 0 .. jsonb_array_length(doc->'intel') - 1 loop
    t := doc->'intel'->i->>'title';
    if t is not null and mapping ? t then
      doc := jsonb_set(doc, array['intel', i::text, 'title'], mapping->t);
    end if;
  end loop;
  return doc;
end $$;

create or replace function translation_fix.rule_b3(doc jsonb) returns jsonb
language sql immutable as $$
  select translation_fix.map_intel_titles(doc, '{"Parkkontrolle":"Parken","Zugangskontrolle":"Zugang",
    "Zeitplanungsprüfung":"Beste Reisezeit","Kraftstoffprüfung":"Tanken","Signalprüfung":"Mobilfunkempfang"}'::jsonb)
$$;

-- B4: "Weiterleitungen" (exact template sentence in days[].driving).
create or replace function translation_fix.rule_b4(doc jsonb) returns jsonb
language sql immutable as $$
  select translation_fix.jsonb_walk(doc, jsonb_build_array(jsonb_build_object('op','literal',
    'from','Wählen Sie einen lokalen Besuch; Reisezeit und Weiterleitungen werden nicht überprüft.',
    'to',  'Wählen Sie einen Besuch vor Ort; Reisezeit und Anschlussverbindungen werden nicht geprüft.')))
$$;

-- B5: unify "Vorschlag:" in days[].start where the English start is "Suggested: …".
create or replace function translation_fix.rule_b5(doc jsonb, en_plan jsonb) returns jsonb
language plpgsql immutable as $$
declare i int; s text; en text;
begin
  if doc is null or jsonb_typeof(doc->'days') is distinct from 'array' then return doc; end if;
  for i in 0 .. jsonb_array_length(doc->'days') - 1 loop
    s := doc->'days'->i->>'start';
    en := en_plan->'days'->i->>'start';
    if s ~ '^(Vorgeschlagen|Empfohlen):\s' and en ~ '^Suggested:' then
      doc := jsonb_set(doc, array['days', i::text, 'start'],
                       to_jsonb(regexp_replace(s, '^(Vorgeschlagen|Empfohlen):\s+', 'Vorschlag: ')));
    end if;
  end loop;
  return doc;
end $$;

-- C: German day start/driving that names the row itself instead of the English starting place.
create or replace function translation_fix.rule_c(doc jsonb, en_plan jsonb) returns jsonb
language plpgsql immutable as $$
declare
  i int; name text := doc->>'name';
  en_start text; en_drv text; de_start text; de_drv text; m text[]; d text[];
begin
  if doc is null or en_plan is null or jsonb_typeof(doc->'days') is distinct from 'array'
     or jsonb_typeof(en_plan->'days') is distinct from 'array'
     or jsonb_array_length(doc->'days') <> jsonb_array_length(en_plan->'days') then
    return doc;
  end if;
  for i in 1 .. jsonb_array_length(doc->'days') - 1 loop
    en_start := en_plan->'days'->i->>'start';
    de_start := doc->'days'->i->>'start';
    m := regexp_match(en_start, '^Suggested: morning departure from (.+)$');
    if m is not null and m[1] <> name and de_start = 'Vorschlag: Abfahrt am Morgen ab ' || name then
      doc := jsonb_set(doc, array['days', i::text, 'start'], to_jsonb('Vorschlag: Abfahrt am Morgen ab ' || m[1]));
    end if;
    en_drv := en_plan->'days'->i->>'driving';
    de_drv := doc->'days'->i->>'driving';
    m := regexp_match(en_drv, '^About ([0-9.,]+) km from (.+) in a straight line; road distance is longer, so check the route before departure\.$');
    d := regexp_match(de_drv, '^Etwa ([0-9.,]+) km Luftlinie ab (.+); die Straßenstrecke ist länger, prüfen Sie die Route vor der Abfahrt\.$');
    if m is not null and d is not null and d[2] = name and m[2] <> name
       and replace(d[1], ',', '.') = replace(m[1], ',', '') then
      doc := jsonb_set(doc, array['days', i::text, 'driving'],
        to_jsonb('Etwa ' || d[1] || ' km Luftlinie ab ' || m[2] || '; die Straßenstrecke ist länger, prüfen Sie die Route vor der Abfahrt.'));
    end if;
  end loop;
  return doc;
end $$;

-- D1: French intel title "Timing".
create or replace function translation_fix.rule_d1(doc jsonb) returns jsonb
language sql immutable as $$
  select translation_fix.map_intel_titles(doc, '{"Timing":"Horaires"}'::jsonb)
$$;

-- D2 helpers: numeric value of a French/English number string ("7,5" / "7.5" / "1,234").
create or replace function translation_fix.fr_number(s text) returns numeric
language sql immutable as $$ select replace(replace(s, ' ', ''), ',', '.')::numeric $$;
create or replace function translation_fix.en_number(s text) returns numeric
language sql immutable as $$ select replace(s, ',', '')::numeric $$;

-- D2 state of one French driving string vs. its English source:
--   'fix' (duplicate unit, km equals English), 'mismatch' (number differs → list only), null.
create or replace function translation_fix.fr_distance_fix(fr text, en text, out status text, out fixed text)
language plpgsql immutable as $$
declare
  em text[]; en_km numeric; m text[];
  num constant text := '([0-9]+(?:[.,][0-9]+)?)';
begin
  fixed := fr;
  em := regexp_match(en, '^About ([0-9][0-9.,]*) km from ');
  if em is null or fr is null then return; end if;
  en_km := translation_fix.en_number(em[1]);
  -- "37 km [37 km]", "12 km [7,5 miles]", "33 km (20,5 miles)"
  m := regexp_match(fr, num || ' km ?[\[(] ?' || num || ' ?(km|miles?|mi) ?[\])]');
  if m is not null then
    if translation_fix.fr_number(m[1]) = en_km then
      status := 'fix';
      fixed := regexp_replace(fr, num || ' km ?[\[(] ?' || num || ' ?(km|miles?|mi) ?[\])]', '\1 km');
    else
      status := 'mismatch';
    end if;
    return;
  end if;
  -- "11 miles [18 km]"
  m := regexp_match(fr, num || ' ?(miles?|mi) ?[\[(] ?' || num || ' ?km ?[\])]');
  if m is not null then
    if translation_fix.fr_number(m[3]) = en_km then
      status := 'fix';
      fixed := regexp_replace(fr, num || ' ?(miles?|mi) ?[\[(] ?' || num || ' ?km ?[\])]', '\3 km');
    else
      status := 'mismatch';
    end if;
  end if;
end $$;

create or replace function translation_fix.rule_d2(doc jsonb, en_plan jsonb) returns jsonb
language plpgsql immutable as $$
declare i int; r record;
begin
  if doc is null or en_plan is null or jsonb_typeof(doc->'days') is distinct from 'array'
     or jsonb_typeof(en_plan->'days') is distinct from 'array'
     or jsonb_array_length(doc->'days') <> jsonb_array_length(en_plan->'days') then
    return doc;
  end if;
  for i in 0 .. jsonb_array_length(doc->'days') - 1 loop
    select * into r from translation_fix.fr_distance_fix(doc->'days'->i->>'driving', en_plan->'days'->i->>'driving');
    if r.status = 'fix' then
      doc := jsonb_set(doc, array['days', i::text, 'driving'], to_jsonb(r.fixed));
    end if;
  end loop;
  return doc;
end $$;

-- D3: "pour le / au / du {row name}" → "pour / à / de {row name}" (skipped for generic nouns).
create or replace function translation_fix.rule_d3(doc jsonb) returns jsonb
language sql immutable as $$
  select case when doc->>'name' is null then doc
              else translation_fix.jsonb_walk(doc, jsonb_build_array(jsonb_build_object('op','fr_article','name',doc->>'name'))) end
$$;

-- Shape of a document with every string emptied: equal shapes mean the same keys, array lengths
-- and non-string values (used by 03-apply.sql to prove no rule changed the JSON structure).
create or replace function translation_fix.jsonb_shape(doc jsonb) returns jsonb
language plpgsql immutable as $$
declare out jsonb;
begin
  if doc is null then return null; end if;
  case jsonb_typeof(doc)
    when 'string' then return '""'::jsonb;
    when 'object' then
      select coalesce(jsonb_object_agg(key, translation_fix.jsonb_shape(value)), '{}'::jsonb) into out from jsonb_each(doc);
      return out;
    when 'array' then
      select coalesce(jsonb_agg(translation_fix.jsonb_shape(value) order by ord), '[]'::jsonb) into out
      from jsonb_array_elements(doc) with ordinality as e(value, ord);
      return out;
    else return doc;
  end case;
end $$;

-- Values that must never change: stop names / ids (routing identities) and the row's name.
create or replace function translation_fix.identity_values(doc jsonb) returns jsonb
language sql immutable as $$
  select jsonb_build_object('name', doc->'name',
    'stops', coalesce(jsonb_path_query_array(doc, '$.days[*].stops[*].name'), '[]'::jsonb),
    'stop_ids', coalesce(jsonb_path_query_array(doc, '$.days[*].stops[*].stop_id'), '[]'::jsonb))
$$;

-- Lock the functions down: only the database owner / service role may run them.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'translation_fix' loop
    execute format('revoke all on function %s from public', f.sig);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on function %s from anon', f.sig);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all on function %s from authenticated', f.sig);
    end if;
  end loop;
end $$;

commit;
