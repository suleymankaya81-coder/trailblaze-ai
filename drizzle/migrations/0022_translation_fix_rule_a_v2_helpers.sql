create schema if not exists translation_fix;

create or replace function translation_fix.month_names() returns text
language sql immutable as $$
  select string_agg(m, '|') from (
    select distinct unnest(array[x, initcap(x)]) as m from unnest(array[
      'january','february','march','april','may','june','july','august','september','october','november','december',
      'janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre',
      'januar','februar','märz','juni','juli','oktober','dezember']) x
  ) t
$$;

create or replace function translation_fix.verb_regex() returns text
language sql immutable as $$
  select '\y(is|are|was|were|has|have|had|covers|cover|includes|include|lies|lie|contains|consists|forms|'
    || 'comprises|extends|spans|became|becomes|received|attained|completed|offers|runs|flows|rises|stands|borders|'
    || 'protects|attracts|features|houses|hosts|reaches|measures|belongs|surrounds|connects|encompasses|increases|'
    || 'announced|remains|means|ist|sind|war|waren|wurde|wurden|hat|haben|hatte|hatten|umfasst|umfassen|liegt|liegen|'
    || 'erhielt|erreichte|befindet|befinden|gehört|bildet|bietet|erstreckt|fließt|zählt|beherbergt|grenzt|besteht|'
    || 'reicht|trägt|schützt|zieht|verbindet|misst|kündigte|bleibt|gilt|heißt|est|sont|était|étaient|a|ont|avait|'
    || 'avaient|couvre|couvrent|comprend|comprennent|comptait|compte|abrite|forme|possède|offre|borde|protège|'
    || 'attire|traverse|relie|mesure|appartient|entoure|domine|accueille|s''étend|se trouve|se situe|agit|englobe|'
    || 'passe|annoncé|reste|signifie)\y'
$$;

create or replace function translation_fix.word_count(s text) returns int
language sql immutable as $$
  select case when btrim(coalesce(s, '')) = '' then 0
              else coalesce(array_length(regexp_split_to_array(btrim(s), '\s+'), 1), 0) end
$$;

create or replace function translation_fix.clause_problems(t text, strict boolean default true) returns text[]
language plpgsql immutable as $$
declare
  body text := regexp_replace(btrim(coalesce(t, '')), '^[^.!?:]{1,90}\s?:\s', '');
  ws text[];
  last text;
  prev text;
  p text[] := '{}';
  months text := translation_fix.month_names();
  tail text;
  m text[];
  participles text[] := array['established','founded','created','opened','designated','declared','inaugurated',
    'awarded','listed','built','completed','named','launched','started','revealed','renamed','protected','accepted',
    'added','chosen','ouvert','ouverte','geöffnet','créé','créée','créés','créées','fondé','fondée','établi','établie',
    'inauguré','inaugurée','classé','classée','classés','classées','déclaré','déclarée','désigné','désignée','accepté',
    'acceptée','ajouté','ajoutée','gegründet','eröffnet','errichtet','eingerichtet','ausgewiesen','erklärt',
    'geschaffen','benannt','gebaut','ernannt','angelegt','eingeweiht','angenommen','hinzugefügt'];
  dangling text[] := array['which','that','who','whose','whom','where','when','and','or','but','nor','as','than',
    'the','a','an','is','are','was','were','be','been','being','has','have','had','of','in','on','at','by','to',
    'from','with','for','since','until','into','onto','upon','about','around','during','after','before','between',
    'through','via','per',
    'qui','que','qu''','dont','où','lequel','laquelle','lesquels','et','ou','mais','ni','comme','le','la','les','l''',
    'un','une','des','du','de','d''','au','aux','à','en','dans','par','pour','avec','sur','sous','vers','chez',
    'depuis','entre','jusqu''','est','sont','était','étaient','ont','avait','été','être','situé','située',
    'der','die','das','dem','den','ein','eine','einer','eines','einem','einen','welche','welcher','welches','und',
    'oder','aber','sowie','als','wie','ist','sind','war','waren','wurde','wurden','worden','wird','werden','hat',
    'haben','hatte','im','am','an','auf','aus','bei','mit','nach','seit','von','vom','zu','zum','zur','bis','für',
    'durch','gegen','um','über','unter','vor','zwischen','während'];
  verbs text := translation_fix.verb_regex();
begin
  ws := regexp_split_to_array(body, '\s+');
  last := lower(regexp_replace(coalesce(ws[array_length(ws, 1)], ''), '^["»«“”()]+|["»«“”()]+$', '', 'g'));
  prev := ws[array_length(ws, 1) - 1];

  if body ~ '\[' then p := array_append(p, 'token/bracket'::text); end if;
  if translation_fix.word_count(body) < 5 then p := array_append(p, 'short'::text); end if;
  if body ~ '^[a-zß-öø-ÿ]' then p := array_append(p, 'lowercase start'::text); end if;
  if body ~ ('^(Mit|With|Avec|Since|Seit|Depuis|From|Von|Vom|Ab|Am|On|Durch|Through|During|Während|Pendant|Après|'
             || 'After|Nach|Until|Bis|Jusqu|And|Und|Et|But|Aber|Mais|Or|Oder|Ou|Which|That|Qui|Que|Dont)\y') then
    p := array_append(p, 'fragment start'::text);
  end if;
  if body ~ '^(Ist|Sind|War|Waren|Wurde|Wurden|Hat|Haben|Hatte|Umfasst|Liegt|Est|Sont|Is|Are|Was|Were|Has|Have)\y' then
    p := array_append(p, 'starts with verb'::text);
  end if;
  if last = any(participles) and body !~ '\y1[5-9][0-9]{2}\y' then
    p := array_append(p, 'participle end without year'::text);
  end if;
  if (last = any(dangling) and not (last = any(participles))
      and not (last in ('wurde','wurden','ist','sind','war','waren','wird','werden','hat','haben','hatte')
               and coalesce(prev, '') ~ '^[a-zäöüß-]+(t|en)$'))
     or lower(coalesce(prev, '') || ' ' || last) in ('a été', 'ont été', 'as of', 'seit dem', 'depuis le') then
    p := array_append(p, 'dangling word'::text);
  end if;
  if body ~ '([/–—,;:(-]|\yn°|\yNo\.?|\yNr\.?)$' then p := array_append(p, 'dangling mark'::text); end if;
  if body ~* '\y(by|par|durch|per)\s+(the\s+|le\s+|la\s+)?(Decree|Law|Act|décret|loi|Gesetz|Dekret|Verordnung)$' then
    p := array_append(p, 'dangling reference'::text);
  end if;
  m := regexp_match(body, '^.*(,\s+(der|die|das|dem|den|welche[rs]?|which|who|qui|que|dont)\s|\s(that|which|qui|que|dont)\s)(.*)$');
  if m is not null then
    tail := m[array_length(m, 1)];
    if tail !~* verbs and not exists (
         select 1 from unnest(regexp_split_to_array(tail, '\s+')) w
         where lower(regexp_replace(w, '[.,]', '', 'g')) = any(participles)) then
      p := array_append(p, 'relative clause without verb'::text);
    end if;
  end if;
  if strict then
    if body ~ ('\y[0-9]{1,2}(\.|er|st|nd|rd|th)?\s+(' || months || ')\y(?!\s*,?\s*[0-9]{4})')
       or body ~ ('\y(' || months || ')\s+[0-9]{1,2}\y(?!\s*,?\s*[0-9]{4})') then
      p := array_append(p, 'bare day-month'::text);
    end if;
    if body ~ ('\y(' || months || ')$') then p := array_append(p, 'ends with month'::text); end if;
    if body ~* ('\y(in|en|im|on|since|seit|depuis|au mois de|von|bis|début|fin|mi|anfang|ende|mitte|early|late|mid|begin of)[ -](' || months || ')\y(?!\s*,?\s*[0-9]{4})') then
      p := array_append(p, 'month without year'::text);
    end if;
    if body !~* verbs then p := array_append(p, 'no verb'::text); end if;
  end if;
  return p;
end $$;

create or replace function translation_fix.clause_is_valid(t text, strict boolean default true) returns boolean
language sql immutable as $$ select cardinality(translation_fix.clause_problems(t, strict)) = 0 $$;

create or replace function translation_fix.strip_dangling_v2(s text) returns text
language plpgsql immutable as $$
declare
  t text := btrim(coalesce(s, ''));
  w text;
  tail_words text[] := array['in','on','at','of','since','from','between','by','until','to','and','or','the','a',
    'an','which','that','around','about','as','en','le','la','les','l''','du','de','des','d''','depuis','entre','et',
    'ou','au','aux','à','dans','vers','qui','que','dont','im','am','an','auf','um','seit','von','vom','bis',
    'zwischen','und','oder','der','die','das','dem','den','ein','eine'];
begin
  loop
    t := regexp_replace(t, '[[:space:],;:(\[–—/-]+$', '');
    w := substring(t from '(\S+)$');
    exit when w is null;
    if lower(w) = any(tail_words) or lower(w) ~ '^[0-9]+(er|e|\.)?$' then
      t := btrim(left(t, length(t) - length(w)));
    else
      exit;
    end if;
  end loop;
  return t;
end $$;

create or replace function translation_fix.finish_sentence(t text) returns text
language sql immutable as $$
  select case when x ~ '[.!?…]$' then x else x || '.' end
  from (select regexp_replace(btrim(t), '\s+([.!?…])$', '\1') as x) y
$$;

create or replace function translation_fix.cut_back(t text) returns text
language plpgsql immutable as $$
declare cur text := t; cand text;
begin
  loop
    cur := substring(cur from
      '^(.*)(?:,\s|\s\(|\s[–—-]\s|\s(?=(?:that|which|who|whose|where|when|established|founded|created|opened|'
      || 'designated|declared|inaugurated|since|on|as of|by|with|in|from|for|at|until|qui|que|dont|où|créée?s?|'
      || 'établie?s?|fondée?s?|inaugurée?s?|déclarée?s?|désignée?s?|depuis|le|au|avec|par|en|pour|dans|jusqu|der|'
      || 'die|das|welche[rs]?|gegründet|eingerichtet|eröffnet|ausgewiesen|seit|am|vom|mit|durch|im|in|für|bis|und|'
      || 'and|et)\y))');
    if cur is null then return null; end if;
    cand := translation_fix.strip_dangling_v2(cur);
    if cand <> '' and translation_fix.clause_is_valid(cand) then return cand; end if;
  end loop;
end $$;

create or replace function translation_fix.clause_from_token_sentence(piece text, out result text, out mode text)
language plpgsql immutable as $$
declare
  clause text;
  m text[];
  rest text;
begin
  clause := regexp_replace(piece, translation_fix.placeholder_regex() || '.*$', '');
  clause := regexp_replace(clause, '\[[^\]]*$', '');
  clause := translation_fix.strip_dangling_v2(clause);
  if clause <> '' and translation_fix.clause_is_valid(clause) then
    result := translation_fix.finish_sentence(clause); mode := 'fallback'; return;
  end if;
  m := regexp_match(piece, '^([^,\[]{0,40})\[(dated source|source datée|datierter Quelle|datiert Quelle)\],\s+(.+)$');
  if m is not null and translation_fix.word_count(m[1]) <= 4
     and m[1] !~* translation_fix.verb_regex() then
    rest := btrim(m[3]);
    rest := upper(left(rest, 1)) || substr(rest, 2);
    if rest !~ translation_fix.placeholder_regex()
       and translation_fix.clause_is_valid(regexp_replace(rest, '[.!?…]+$', '')) then
      result := translation_fix.finish_sentence(rest); mode := 'fallback_intro'; return;
    end if;
  end if;
  if clause <> '' then
    result := translation_fix.cut_back(clause);
    if result is not null then
      result := translation_fix.finish_sentence(result); mode := 'fallback_cut'; return;
    end if;
  end if;
  result := null; mode := 'unresolved';
end $$;

create or replace function translation_fix.rule_a_text(s text, field text, out result text, out mode text)
language plpgsql immutable as $$
declare
  tok text := translation_fix.placeholder_regex();
  prot constant text := chr(57344);
  sep  constant text := chr(57345);
  work text;
  pieces text[];
  kept text[] := '{}';
  hits text[] := '{}';
  piece text;
  prefix text := '';
  r record;
  i int;
  n int;
begin
  result := s; mode := 'none';
  if s is null then return; end if;
  if s !~ tok and not translation_fix.has_truncated_token_tail(s) then return; end if;

  work := regexp_replace(s, 'Natura([ -])\[(dated source|source datée|datierter Quelle|datiert Quelle)\]',
                         'Natura\12000', 'g');
  if work !~ tok and not translation_fix.has_truncated_token_tail(work) then
    result := work; mode := 'natura'; return;
  end if;

  work := regexp_replace(work,
    '(^|[^[:alnum:]])(St|Ste|Mt|Dr|Nr|ca|Ca|bzw|vgl|Jh|Mio|Mrd|Str|No|Nos|Ft|Pt|Co|Jr|Sr|Hwy|Rd|Ave|Blvd|approx|etc|env|z\.B|d\.h|u\.a|e\.g|i\.e|U\.S)\.',
    '\1\2' || prot, 'g');
  work := regexp_replace(work,
    '([0-9]{1,2})\.(\s+)(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|Jahrhundert|Jh)',
    '\1' || prot || '\2\3', 'g');
  work := regexp_replace(work, '([.!?…]+["»“”''’)\]]*)(\s+)(?![a-zß-öø-ÿ])', '\1' || sep || '\2', 'g');
  pieces := string_to_array(work, sep);
  n := coalesce(array_length(pieces, 1), 0);
  for i in 1 .. n loop
    piece := replace(pieces[i], prot, '.');
    if piece ~ tok or (i = n and translation_fix.has_truncated_token_tail(piece)) then
      hits := hits || btrim(piece);
    else
      kept := kept || piece;
    end if;
  end loop;

  while cardinality(kept) > 0
        and not (cardinality(kept) = 1 and btrim(kept[1]) ~ '^[^.!?]*:$')
        and not translation_fix.clause_is_valid(regexp_replace(btrim(kept[cardinality(kept)]), '[.!?…]+["»“”''’)\]]*$', ''), false) loop
    kept := kept[1:cardinality(kept) - 1];
  end loop;
  result := btrim(array_to_string(kept, ''));
  if result <> '' and result !~ '^[^.!?]*:$' then
    mode := 'removed'; return;
  end if;
  prefix := result;

  select * into r from translation_fix.clause_from_token_sentence(hits[1]);
  if r.mode <> 'unresolved' then
    result := btrim(prefix || ' ' || r.result); mode := r.mode; return;
  end if;
  if field in ('tagline', 'seo_description', 'metaDescription') then
    for i in 2 .. coalesce(cardinality(hits), 0) loop
      select * into r from translation_fix.clause_from_token_sentence(hits[i]);
      if r.mode <> 'unresolved' then
        result := btrim(prefix || ' ' || r.result); mode := 'fallback_next'; return;
      end if;
    end loop;
  end if;
  result := s; mode := 'unresolved';
end $$;

create or replace function translation_fix.drop_placeholder_sentences_ex(s text, out result text, out mode text)
language sql immutable as $$ select r.result, r.mode from translation_fix.rule_a_text(s, null) r $$;

create or replace function translation_fix.rule_a_jsonb(doc jsonb, key text default null,
    skip_keys text[] default translation_fix.default_skip_keys()) returns jsonb
language plpgsql immutable as $$
declare out jsonb;
begin
  if doc is null then return null; end if;
  case jsonb_typeof(doc)
    when 'string' then return to_jsonb((translation_fix.rule_a_text(doc #>> '{}', key)).result);
    when 'object' then
      select coalesce(jsonb_object_agg(k, case when k = any(skip_keys) then v
                                               else translation_fix.rule_a_jsonb(v, k, skip_keys) end), '{}'::jsonb)
        into out from jsonb_each(doc) e(k, v);
      return out;
    when 'array' then
      select coalesce(jsonb_agg(translation_fix.rule_a_jsonb(v, key, skip_keys) order by ord), '[]'::jsonb)
        into out from jsonb_array_elements(doc) with ordinality e(v, ord);
      return out;
    else return doc;
  end case;
end $$;

create or replace function translation_fix.rule_a(doc jsonb) returns jsonb
language sql immutable as $$ select translation_fix.rule_a_jsonb(doc) $$;

create or replace function translation_fix.placeholder_leaves(doc jsonb, path text default '',
    skip_keys text[] default translation_fix.default_skip_keys())
returns table(field text, old_value text, new_value text, mode text)
language plpgsql immutable as $$
declare k text; i int; r record;
begin
  if doc is null then return; end if;
  if jsonb_typeof(doc) = 'string' then
    select * into r from translation_fix.rule_a_text(doc #>> '{}', substring(path from '([A-Za-z_]+)$'));
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