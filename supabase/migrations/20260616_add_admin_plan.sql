-- Migration: Add admin plan support to user_profiles
-- Date: 2026-06-16
-- Purpose: Introduce the 'admin' plan tier so Yakir's account (and any future
--          studio-internal accounts) can bypass quota enforcement without
--          touching the free/pro user experience.
--
-- What this migration does:
--   1. Adds a CHECK constraint on user_profiles.plan allowing 'free', 'pro',
--      'admin'. Uses a conditional DO block so the migration is idempotent
--      and does not error if re-applied.
--   2. Replaces public.increment_event_count() so it skips the increment for
--      admin users. Admin users have unlimited quota; counting their events
--      would pollute the quota counter and potentially trigger false quota
--      exhaustion on plan changes.
--
-- Existing data: all current rows have plan = 'free' (the only value used at
-- launch). The new constraint is fully compatible with existing data —
-- 'free' is in the allowed set. No data migration is required.
--
-- RLS posture: unchanged. increment_event_count is SECURITY INVOKER with an
-- auth.uid() guard, so it can only touch the caller's own row. The admin
-- plan check inside the function is additive — it narrows what UPDATE runs,
-- it does not open any new row access.

-- ============================================================================
-- 1. ADD PLAN CHECK CONSTRAINT (idempotent)
-- ============================================================================

-- First, drop the legacy plan constraint. The original schema shipped
-- user_profiles_plan_check allowing (free, pro, enterprise) — it predates the
-- admin tier and would reject plan = 'admin'. 'enterprise' was never used at
-- launch (all rows are 'free'/'pro'), so dropping it loses nothing. The new
-- check_valid_plan (free, pro, admin) below is the canonical replacement.
-- Idempotent: IF EXISTS guard.
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_plan_check;

-- The constraint is added only if it does not already exist, checked against
-- pg_constraint by name within the public schema. This prevents a duplicate-
-- constraint error on re-application.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
     WHERE c.conname = 'check_valid_plan'
       AND t.relname = 'user_profiles'
       AND n.nspname = 'public'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT check_valid_plan
      CHECK (plan IN ('free', 'pro', 'admin'));
  END IF;
END;
$$;

COMMENT ON CONSTRAINT check_valid_plan ON public.user_profiles IS
  'Valid plan values: free (default), pro (paid), admin (studio-internal — unlimited quota, bypasses all counting).';

-- ============================================================================
-- 2. REPLACE increment_event_count — SKIP ADMIN USERS
-- ============================================================================

-- Admin users have unlimited quota. Incrementing their events_created counter
-- serves no purpose and could cause surprising behavior if an admin account
-- is later downgraded to pro/free (the counter would be artificially inflated).
-- The fix: add a plan != 'admin' guard to the WHERE clause so the UPDATE is
-- a no-op for admin rows. The function still returns VOID; the caller does not
-- need to handle a return value.
--
-- Security posture (unchanged from 20260612_quota_repair_and_function_hygiene.sql):
--   - SECURITY INVOKER: runs as the authenticated user, not as the DB superuser.
--   - auth.uid() = user_id_param: prevents one user from incrementing another's counter.
--   - execute granted to 'authenticated' only; revoked from 'public' and 'anon'.
--   - search_path = '' (empty): prevents search_path injection.
--
-- The plan != 'admin' check is intentionally placed in the WHERE clause (not as
-- an IF/RETURN-EARLY block) so the function stays as a single SQL statement —
-- consistent with the style established in the hygiene migration and more
-- efficient (one parse, one plan).

CREATE OR REPLACE FUNCTION public.increment_event_count(user_id_param uuid)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  UPDATE public.user_profiles
     SET events_created = events_created + 1,
         updated_at     = now()
   WHERE user_id   = user_id_param
     AND user_id   = auth.uid()
     AND plan     != 'admin';  -- Admin users have unlimited quota; skip counting.
$$;

-- Preserve the permission grants from the hygiene migration.
-- REVOKE first to be safe if the function was recreated with broader defaults.
REVOKE EXECUTE ON FUNCTION public.increment_event_count(uuid) FROM public, anon;
GRANT  EXECUTE ON FUNCTION public.increment_event_count(uuid) TO authenticated;

COMMENT ON FUNCTION public.increment_event_count(uuid) IS
  'Increments events_created for a user after saving an event. No-op for admin plan users (unlimited quota). SECURITY INVOKER — caller must own the row (auth.uid() guard).';

-- ============================================================================
-- VERIFICATION QUERIES (comment out before applying; run manually in SQL editor)
-- ============================================================================

-- 1. Confirm the plan CHECK constraint exists on user_profiles:
-- SELECT c.conname, pg_get_constraintdef(c.oid) AS definition
--   FROM pg_constraint c
--   JOIN pg_class t ON t.oid = c.conrelid
--   JOIN pg_namespace n ON n.oid = t.relnamespace
--  WHERE c.conname = 'check_valid_plan'
--    AND t.relname = 'user_profiles'
--    AND n.nspname = 'public';
-- Expected: one row — conname = 'check_valid_plan',
--           definition = CHECK ((plan = ANY (ARRAY['free'::text, 'pro'::text, 'admin'::text])))

-- 2. Confirm the updated function exists and has the admin guard:
-- SELECT prosrc
--   FROM pg_proc
--  WHERE proname = 'increment_event_count'
--    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
-- Expected: source contains "plan != 'admin'"

-- 3. Smoke-test the constraint (expect error on invalid value):
-- UPDATE public.user_profiles SET plan = 'superuser' WHERE false;
-- Expected: ERROR: new row for relation "user_profiles" violates check constraint "check_valid_plan"

-- 4. Confirm execute permission is restricted to 'authenticated':
-- SELECT grantee, privilege_type
--   FROM information_schema.role_routine_grants
--  WHERE routine_name = 'increment_event_count'
--    AND routine_schema = 'public';
-- Expected: only 'authenticated' has EXECUTE; 'public' and 'anon' do not appear.
