create table public.viator_place_cache (
  slug text primary key,
  items jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now()
);
alter table public.viator_place_cache enable row level security;
grant select, insert, update on public.viator_place_cache to anon, authenticated;
create policy "public read viator cache" on public.viator_place_cache for select to anon, authenticated using (true);
create policy "public write viator cache" on public.viator_place_cache for insert to anon, authenticated with check (true);
create policy "public update viator cache" on public.viator_place_cache for update to anon, authenticated using (true) with check (true);