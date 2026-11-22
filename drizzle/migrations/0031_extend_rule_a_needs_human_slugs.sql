CREATE OR REPLACE FUNCTION translation_fix.needs_human_slugs() RETURNS text[]
LANGUAGE sql IMMUTABLE AS $$
  SELECT array['haagse-bos','midden-delfland','parco-naturale-regionale-bosco-incoronata',
               'parco-naturale-regionale-del-vulture','valaste-waterfall','leka','mors-and-hanklit',
               'naturpark-nissum-fjord','breheimen-national-park','bulbjerg',
               'aspromonte-national-park','faerder','lycklamabos','waterloopbos','lake-peipus',
               'lammijarv','jostedalsbreen-national-park','nigardsbreen','lierne-national-park']
$$;