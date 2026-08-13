CREATE TYPE public.offer_category AS ENUM ('stay','rv_rental','gear_rental','gear_purchase','activity');

CREATE TABLE public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  region text,
  tagline text,
  hero_image text,
  gallery text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'published',
  seo_title text,
  seo_description text,
  aliases text[] NOT NULL DEFAULT '{}',
  best_season text,
  scenic_score numeric,
  camping_score numeric,
  avg_daily_budget numeric,
  trip_duration_days text,
  similar_slugs text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.destinations TO anon;
GRANT SELECT ON public.destinations TO authenticated;
GRANT ALL ON public.destinations TO service_role;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Destinations are publicly readable" ON public.destinations FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  category public.offer_category NOT NULL,
  subcategory text,
  title text NOT NULL,
  image text,
  price_display text,
  price_value numeric,
  price_unit text,
  external_url text,
  why_recommended text,
  description text,
  duration text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX offers_destination_id_idx ON public.offers(destination_id);
CREATE INDEX offers_category_idx ON public.offers(category);
GRANT SELECT ON public.offers TO anon;
GRANT SELECT ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Offers are publicly readable" ON public.offers FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.click_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid REFERENCES public.offers(id) ON DELETE SET NULL,
  destination_slug text,
  session_id text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  referrer_page text,
  outcome text
);

CREATE INDEX click_events_offer_id_idx ON public.click_events(offer_id);
GRANT INSERT ON public.click_events TO anon;
GRANT INSERT ON public.click_events TO authenticated;
GRANT ALL ON public.click_events TO service_role;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record click events" ON public.click_events FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();