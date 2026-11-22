-- 01c-helper-rule-a-quality.sql — quality filter for rule A (used by 03b-apply-rule-a.sql and 02b).
--
-- Rule A v2 (01b) never writes a grammatical fragment, but the live review of 2026-11-21 showed outputs
-- that are complete yet useless or misleading: "Es umfasst 89 Quadratkilometer …", "It had a population
-- of 19,355.", or a sentence about a different park. Rule A now writes an output ONLY when ALL hold:
--   1. at least 6 words (a "Name :" prefix of a meta description does not count);
--   2. it does not start with a pronoun / possessive or a pronoun-led ordinal fact
--      (Es, Er, Sie, It, Il, Elle, This, Dies…, Its, Son…, "Das ist der 4.", "C'est le 3e", "It is the 2nd");
--   3. it is not only a population, area or number fact (a number + population/area word and neither a
--      "is a / ist ein / est un" definition nor a location verb such as "is situated / liegt / se trouve");
--   4. it mentions the place name, OR the field is a stop detail and the output mentions that stop's name
--      (distinctive words of the name, accents and case ignored; generic words such as National, Park,
--      Lake, Parc, Naturpark are not counted);
--   5. it names no other park: every park name found in the output must share a distinctive word with
--      the place name (or, in a stop detail, with the stop name);
--   6. the slug is not on the fixed needs-human list (translation_fix.needs_human_slugs()).
-- Everything else stays UNCHANGED and is listed as "needs-human" by 02b-preview-rule-a-quality.sql.
-- "natura" (Natura [token] → Natura 2000) is a pure substitution and is always written.
--
-- Functions only (schema translation_fix); reads and changes no rows. Run after 01b. Re-runnable.

begin;

create schema if not exists translation_fix;

create or replace function translation_fix.needs_human_slugs() returns text[]
language sql immutable as $$
  select array['haagse-bos','midden-delfland','parco-naturale-regionale-bosco-incoronata',
               'parco-naturale-regionale-del-vulture','valaste-waterfall','leka','mors-and-hanklit',
               'naturpark-nissum-fjord','breheimen-national-park','bulbjerg',
               'aspromonte-national-park','faerder','lycklamabos','waterloopbos','lake-peipus',
               'lammijarv','jostedalsbreen-national-park','nigardsbreen','lierne-national-park']
$$;

-- lower case, accents removed (no extension needed)
create or replace function translation_fix.fold(s text) returns text
language sql immutable as $$
  select translate(lower(coalesce(s, '')),
    'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿőűšžčćđłńśźżğıāēīōūăęėįųșțþðßňřěůťďľĺŕ',
    'aaaaaaaceeeeiiiinoooooouuuuyyouszccdlnszzgiaeiouaeeiustpdsnreutdllr')
$$;

create or replace function translation_fix.words_of(s text) returns text[]
language sql immutable as $$
  select coalesce(array_agg(w), '{}') from regexp_split_to_table(translation_fix.fold(s), '[^a-z0-9]+') w where w <> ''
$$;

-- Distinctive words of a name: at least 3 letters, not a generic landscape/park word.
create or replace function translation_fix.name_tokens(name text) returns text[]
language sql immutable as $$
  select coalesce(array_agg(distinct w), '{}')
  from unnest(translation_fix.words_of(name)) w
  where length(w) >= 3 and w !~ '^[0-9]+$' and not (w = any(array[
    'national','nationalpark','nationaal','nazionale','nacional','nationale','park','parc','parco','parque','parke',
    'natural','nature','naturpark','naturale','naturel','naturelle','natuur','naturreservat','regional','regionale',
    'regionalpark','reserve','reservat','riserva','biosphere','biosfera','biospharengebiet','biospharenreservat',
    'geopark','unesco','global','area','gebiet','zone','lake','lago','see','sjon','jarvi','river','fluss','riviere',
    'fiume','forest','foret','wald','bosco','mountain','mountains','mount','monte','monti','mont','monts','berg',
    'gebirge','island','islands','isle','ile','iles','insel','inseln','isola','isole','falls','waterfall',
    'wasserfall','cascade','cave','cavern','grotte','grotta','hohle','gorge','schlucht','valley','vallee','tal',
    'beach','plage','strand','bay','baie','coast','cote','kuste','landscape','landschaft','protected','monument',
    'site','world','heritage','the','and','und','des','del','della','delle','dei','von','der','die','das','les',
    'une','est','ist','its','sur','aux','with','for','regionaler','regionales','nationaler','lagoon','lagune',
    'glacier','gletscher','marine','sea','mer','meer','estate','landgoed','domaine','canyon','peak','pic','spitze',
    -- nationality words and countries: "Hungarian National Park", "parc national de France" are not other parks
    'hungarian','norwegian','swedish','danish','finnish','icelandic','dutch','belgian','french','german','swiss',
    'austrian','italian','spanish','portuguese','greek','polish','czech','slovak','slovenian','croatian','serbian',
    'bosnian','montenegrin','albanian','macedonian','bulgarian','romanian','estonian','latvian','lithuanian','irish',
    'scottish','welsh','british','english','american','canadian','australian','zealand','hongrois','norvegien',
    'suedois','danois','finlandais','islandais','neerlandais','belge','francais','allemand','suisse','autrichien',
    'italien','espagnol','portugais','grec','polonais','tcheque','slovaque','slovene','croate','serbe','bosniaque',
    'ungarischer','norwegischer','schwedischer','danischer','finnischer','islandischer','niederlandischer',
    'franzosischer','deutscher','schweizer','osterreichischer','italienischer','spanischer','kroatischer',
    'france','hungary','hongrie','ungarn','norway','norvege','norwegen','sweden','suede','schweden','denmark',
    'danemark','danemark','finland','finlande','finnland','iceland','islande','island','netherlands','pays','bas',
    'belgium','belgique','belgien','germany','allemagne','deutschland','switzerland','schweiz','austria','autriche',
    'osterreich','italy','italie','italien','spain','espagne','spanien','portugal','greece','grece','griechenland',
    'poland','pologne','polen','czechia','tchequie','tschechien','slovakia','slovaquie','slowakei','slovenia',
    'slovenie','slowenien','croatia','croatie','kroatien','serbia','serbie','serbien','bosnia','bosnie','bosnien',
    'herzegovina','herzegovine','herzegowina','montenegro','albania','albanie','albanien','bulgaria','bulgarie',
    'bulgarien','romania','roumanie','rumanien','estonia','estonie','estland','latvia','lettonie','lettland',
    'lithuania','lituanie','litauen','ireland','irlande','irland','scotland','ecosse','schottland','wales','england',
    'angleterre','britain','kingdom','united','states','canada','australia','australie','australien','new',
    'nouvelle','neuseeland','zelande','republic','republique','republik']))
$$;

create or replace function translation_fix.token_in_words(t text, words text[]) returns boolean
language sql immutable as $$
  -- exact word, or the same word with a different last letter / short ending ("Kristianstad" ~ "Kristianstads")
  select exists (select 1 from unnest(words) w
                 where w = t or (length(t) >= 5 and abs(length(w) - length(t)) <= 2
                                 and left(w, length(t) - 1) = left(t, length(t) - 1)))
$$;

create or replace function translation_fix.mentions_name(output text, name text) returns boolean
language plpgsql immutable as $$
declare t text; ws text[] := translation_fix.words_of(output); toks text[] := translation_fix.name_tokens(name);
begin
  if coalesce(btrim(name), '') = '' then return false; end if;
  if cardinality(toks) = 0 then
    -- a name made only of generic words ("Swiss National Park"): the whole name must appear
    return position(translation_fix.fold(btrim(name)) in translation_fix.fold(output)) > 0;
  end if;
  foreach t in array toks loop
    if translation_fix.token_in_words(t, ws) then return true; end if;
  end loop;
  return false;
end $$;

-- Park names written in the output (named parks only: a capitalised name next to a park word; a lower-case
-- "parc naturel régional de Sicile" is a classification, not a name).
create or replace function translation_fix.park_names_in(output text) returns text[]
language sql immutable as $$
  select coalesce(array_agg(m[1]), '{}') from (
    select regexp_matches(output,
      '((?:[A-ZÀ-ÝŐŰŠŽČĆĐŁØÅÆ][^[:space:],.;:()]*[ -]){1,4}(?:National Park|Nature Park|Natural Park|Regional Park|Forest Park|Nationalpark|Naturpark|Nationaal Park|Geopark|Biosphere Reserve|Nature Reserve))', 'g') m
    union all
    select regexp_matches(output,
      '((?:Parc national|Parc naturel régional|Parc naturel|Parco nazionale|Parco naturale regionale|Parco naturale|Parco regionale|Parque [Nn]atural|Nationalpark|Naturpark|Nationaal Park) (?:de |du |des |de la |dei |del |della |delle |di |dello )?[A-ZÀ-ÝŐŰŠŽČĆĐŁØÅÆ][^[:space:],.;:()]*)', 'g') m
  ) x
$$;

-- Reasons why a rule-A output must not be written (empty array = may be written).
create or replace function translation_fix.rule_a_quality(output text, place_name text, field text,
    stop_name text default null, slug text default null) returns text[]
language plpgsql immutable as $$
declare
  body text := regexp_replace(btrim(coalesce(output, '')), '^[^.!?:]{1,90}\s?:\s', '');
  p text[] := '{}';
  own text[];
  pk text;
  is_stop_detail boolean := field = 'detail' and stop_name is not null;
begin
  if slug = any(translation_fix.needs_human_slugs()) then
    p := array_append(p, 'slug on needs-human list'::text);
  end if;
  if translation_fix.word_count(body) < 6 then p := array_append(p, 'fewer than 6 words'::text); end if;
  if body ~ ('^(Es|Er|Sie|It|Il|Elle|This|Dies|Diese|Dieser|Dieses|They|Ils|Elles|Its|Their|Son|Sa|Ses|Leur|Leurs|'
             || 'Sein|Seine|Ihr|Ihre|These|Those|Ce|Cet|Cette|Ceci|Celui|Celle)\y')
     or body ~ '^(Das|Dies|Es) ist (der|die|das) [0-9]+\.'
     or body ~ '^C''est (le|la) [0-9]+(e|er|re|ème)\y'
     or body ~ '^It is the [0-9]+(st|nd|rd|th)\y' then
    p := array_append(p, 'starts with pronoun/ordinal'::text);
  end if;
  if body ~ '[0-9]'
     and body ~* ('(population|inhabitants|residents|einwohner|bevölkerung|habitants|hikers|randonneurs|wanderer|'
                  || 'visitors|besucher|visiteurs|area of|superficie|fläche|km2|km²|square kilomet|quadratkilometer|'
                  || 'kilomètres carrés|hectares|hektar|\yha\y|acres|covers|umfasst|couvre|s''étend sur|extends over)')
     and body !~* ('\y(is|was|are) (a|an|the|one)\y|\y(ist|war) (ein|eine|einer|der|die|das)\y|\y(est|était) (un|une|le|la|l'')'
                   || '|\y(is|are|was) (situated|located)\y|\ylies\y|\yliegt\y|\ybefindet sich\y|\yse trouve\y|\y(est|sont) situ') then
    p := array_append(p, 'only a population/area/number fact'::text);
  end if;
  if not (translation_fix.mentions_name(body, place_name)
          or (is_stop_detail and translation_fix.mentions_name(body, stop_name))) then
    p := array_append(p, 'place/stop name not mentioned'::text);
  end if;
  own := translation_fix.name_tokens(place_name)
         || case when is_stop_detail then translation_fix.name_tokens(stop_name) else '{}'::text[] end;
  foreach pk in array translation_fix.park_names_in(body) loop
    if cardinality(translation_fix.name_tokens(pk)) > 0
       and not exists (select 1 from unnest(translation_fix.name_tokens(pk)) t where translation_fix.token_in_words(t, own)) then
      p := array_append(p, ('names another park: ' || pk)::text);
    end if;
  end loop;
  return p;
end $$;

-- Rule A for one string with the filter: returns the text to write and a decision.
--   decision: none (no token) | natura | write | needs-human (unchanged) | unresolved (unchanged)
create or replace function translation_fix.rule_a_filtered_text(s text, field text, place_name text,
    stop_name text, slug text, out result text, out mode text, out decision text, out reasons text[])
language plpgsql immutable as $$
declare r record;
begin
  select * into r from translation_fix.rule_a_text(s, field);
  mode := r.mode; reasons := '{}';
  if r.mode = 'none' then result := s; decision := 'none'; return; end if;
  if r.mode = 'natura' then result := r.result; decision := 'natura'; return; end if;
  if r.mode = 'unresolved' then result := s; decision := 'unresolved'; return; end if;
  reasons := translation_fix.rule_a_quality(r.result, place_name, field, stop_name, slug);
  if cardinality(reasons) = 0 then
    result := r.result; decision := 'write';
  else
    result := s; decision := 'needs-human';
  end if;
end $$;

-- Walker: like rule_a_jsonb, but knows the place name, the slug and, inside a stop, the stop name.
create or replace function translation_fix.rule_a_filtered_jsonb(doc jsonb, place_name text, slug text,
    key text default null, stop_name text default null,
    skip_keys text[] default translation_fix.default_skip_keys()) returns jsonb
language plpgsql immutable as $$
declare out jsonb; inner_stop text;
begin
  if doc is null then return null; end if;
  case jsonb_typeof(doc)
    when 'string' then
      return to_jsonb((translation_fix.rule_a_filtered_text(doc #>> '{}', key, place_name, stop_name, slug)).result);
    when 'object' then
      inner_stop := case when doc ? 'detail' and jsonb_typeof(doc->'name') = 'string' then doc->>'name' else stop_name end;
      select coalesce(jsonb_object_agg(k, case when k = any(skip_keys) then v
                 else translation_fix.rule_a_filtered_jsonb(v, place_name, slug, k, inner_stop, skip_keys) end), '{}'::jsonb)
        into out from jsonb_each(doc) e(k, v);
      return out;
    when 'array' then
      select coalesce(jsonb_agg(translation_fix.rule_a_filtered_jsonb(v, place_name, slug, key, stop_name, skip_keys) order by ord), '[]'::jsonb)
        into out from jsonb_array_elements(doc) with ordinality e(v, ord);
      return out;
    else return doc;
  end case;
end $$;

-- Preview leaves with decision and reasons (used by 02b and by the final report of 03b).
create or replace function translation_fix.rule_a_filtered_leaves(doc jsonb, place_name text, slug text,
    path text default '', stop_name text default null,
    skip_keys text[] default translation_fix.default_skip_keys())
returns table(field text, old_value text, new_value text, mode text, decision text, reasons text[])
language plpgsql immutable as $$
declare k text; i int; r record; inner_stop text;
begin
  if doc is null then return; end if;
  if jsonb_typeof(doc) = 'string' then
    select * into r from translation_fix.rule_a_filtered_text(doc #>> '{}', substring(path from '([A-Za-z_]+)$'),
                                                               place_name, stop_name, slug);
    if r.decision <> 'none' then
      field := path; old_value := doc #>> '{}';
      new_value := (translation_fix.rule_a_text(doc #>> '{}', substring(path from '([A-Za-z_]+)$'))).result;
      mode := r.mode; decision := r.decision; reasons := r.reasons; return next;
    end if;
  elsif jsonb_typeof(doc) = 'object' then
    inner_stop := case when doc ? 'detail' and jsonb_typeof(doc->'name') = 'string' then doc->>'name' else stop_name end;
    for k in select jsonb_object_keys(doc) order by 1 loop
      if not (k = any(skip_keys)) then
        return query select * from translation_fix.rule_a_filtered_leaves(doc->k, place_name, slug,
          case when path = '' then k else path || '.' || k end, inner_stop, skip_keys);
      end if;
    end loop;
  elsif jsonb_typeof(doc) = 'array' then
    for i in 0 .. jsonb_array_length(doc) - 1 loop
      return query select * from translation_fix.rule_a_filtered_leaves(doc->i, place_name, slug, path || '[' || i || ']', stop_name, skip_keys);
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

commit;
