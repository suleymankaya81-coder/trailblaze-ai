DO $$ DECLARE c text; BEGIN
SELECT conname INTO c FROM pg_constraint WHERE conrelid='public.destinations'::regclass AND pg_get_constraintdef(oid) ILIKE '%access_type%';
IF c IS NOT NULL THEN EXECUTE format('ALTER TABLE public.destinations DROP CONSTRAINT %I', c); END IF; END $$;
ALTER TABLE public.destinations ADD CONSTRAINT destinations_access_type_check CHECK (access_type IN ('road','fly-in','ferry'));