ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS travel_plan jsonb;
COMMENT ON COLUMN public.destinations.travel_plan IS 'Precomputed destination-specific itinerary, field intel and sourced sightseeing stops; never generated on page view.';
CREATE TABLE public.content_pipeline_jobs (job_key text PRIMARY KEY, status text NOT NULL DEFAULT 'ready', lease_until timestamptz, pause_reason text, completed integer NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.content_pipeline_jobs TO service_role;
ALTER TABLE public.content_pipeline_jobs ENABLE ROW LEVEL SECURITY;