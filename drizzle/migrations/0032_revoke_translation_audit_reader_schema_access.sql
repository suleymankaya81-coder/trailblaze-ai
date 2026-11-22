REVOKE ALL ON SCHEMA translation_fix FROM supabase_read_only_user, anon, authenticated, PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA translation_fix FROM supabase_read_only_user;
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname='audit_backup') THEN
REVOKE ALL ON SCHEMA audit_backup FROM supabase_read_only_user, anon, authenticated, PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA audit_backup FROM supabase_read_only_user;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA audit_backup FROM supabase_read_only_user;
END IF;
END $$;