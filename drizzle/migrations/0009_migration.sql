drop policy "public write viator cache" on public.viator_place_cache;
drop policy "public update viator cache" on public.viator_place_cache;
revoke insert, update on public.viator_place_cache from anon, authenticated;