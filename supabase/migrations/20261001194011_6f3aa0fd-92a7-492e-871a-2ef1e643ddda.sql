DROP INDEX IF EXISTS public.email_leads_email_dest;
CREATE UNIQUE INDEX email_leads_email_dest ON public.email_leads (email, destination_id);