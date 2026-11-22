grant usage on schema translation_fix to supabase_read_only_user;
do $$ declare f record; begin
  for f in select p.oid::regprocedure sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='translation_fix' loop
    execute format('grant execute on function %s to supabase_read_only_user', f.sig);
  end loop; end $$;