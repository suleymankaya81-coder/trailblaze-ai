CREATE TABLE public.pin_assets (
  key text PRIMARY KEY,
  kind text NOT NULL,
  image_url text NOT NULL,
  template_version integer NOT NULL DEFAULT 1,
  feed text NOT NULL,
  release_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pin_assets TO anon, authenticated;
GRANT ALL ON public.pin_assets TO service_role;
ALTER TABLE public.pin_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pin assets are public" ON public.pin_assets FOR SELECT TO anon, authenticated USING (true);