DO $$ BEGIN CREATE TYPE public.permit_level AS ENUM ('high','moderate','none'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS permit_level public.permit_level,
  ADD COLUMN IF NOT EXISTS nearest_airport_code text,
  ADD COLUMN IF NOT EXISTS nearest_airport_name text,
  ADD COLUMN IF NOT EXISTS airport_lat double precision,
  ADD COLUMN IF NOT EXISTS airport_lng double precision,
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision,
  ADD COLUMN IF NOT EXISTS drive_minutes integer,
  ADD COLUMN IF NOT EXISTS drive_miles numeric,
  ADD COLUMN IF NOT EXISTS route_geojson jsonb;

CREATE TABLE public.email_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  destination_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.email_leads TO service_role;
ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX email_leads_email_dest ON public.email_leads (lower(email), destination_id);