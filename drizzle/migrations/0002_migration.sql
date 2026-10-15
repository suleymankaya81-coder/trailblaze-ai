CREATE TABLE public.flight_price_cache (
  airport_code text PRIMARY KEY,
  price numeric,
  origin text,
  fetched_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.flight_price_cache TO anon, authenticated;
GRANT ALL ON public.flight_price_cache TO service_role;
ALTER TABLE public.flight_price_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read flight prices" ON public.flight_price_cache FOR SELECT USING (true);