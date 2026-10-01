-- Intentionally a no-op.
-- This file's original contents were applied to production under version
-- 20260814075924 (identical SQL), so this version never entered the
-- migration ledger. Keeping a second CREATE TABLE here broke clean replays.
-- The saved_plans table + save_trip_plan function now live (idempotently)
-- in 20260814075924; execute grants are tightened in 20260814110610.
SELECT 1;
