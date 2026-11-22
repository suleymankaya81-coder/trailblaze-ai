DROP POLICY IF EXISTS "Anyone can read flight prices" ON public.flight_price_cache;
REVOKE SELECT ON public.flight_price_cache FROM anon, authenticated;

DROP POLICY IF EXISTS "public read viator cache" ON public.viator_place_cache;
CREATE POLICY "Viator cache readable for published destinations" ON public.viator_place_cache
FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.destinations d WHERE d.slug = viator_place_cache.slug AND d.status = 'published'));

DROP POLICY IF EXISTS "Pin assets are public" ON public.pin_assets;
CREATE POLICY "RSS pin assets are public" ON public.pin_assets
FOR SELECT TO anon, authenticated
USING (channel = 'rss');