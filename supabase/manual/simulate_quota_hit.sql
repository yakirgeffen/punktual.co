-- MANUAL ACTUATION — Run in Supabase SQL editor to simulate hitting the free tier limit.
-- Use this to test what a user sees when they've used up their 5 monthly events.
--
-- Purpose: Artificially set a test account's events_created to 5 so the quota
-- gate in the application fires on the next save attempt. This lets you verify
-- the "you've reached your limit" UX without creating 5 real events first.
--
-- Prerequisites:
--   - Test account must be signed up and present in user_profiles.
--   - Replace placeholder email below with the actual test account email.
--   - Run MANUAL_set_admin_plans.sql first to confirm the baseline state.

-- Replace with the actual test account email once created.
UPDATE public.user_profiles
   SET events_created = 5,
       updated_at     = NOW()
 WHERE email = 'testuser1@example.com';  -- REPLACE WITH ACTUAL EMAIL

-- Verify
SELECT email, plan, events_created, quota_reset_date
  FROM public.user_profiles
 WHERE email = 'testuser1@example.com';
-- Expected: events_created = 5, plan = 'free'
-- Next save attempt by this account should trigger the quota-exceeded flow.

-- To reset the test account back to 0 events (start over):
-- UPDATE public.user_profiles
--    SET events_created   = 0,
--        quota_reset_date = CURRENT_DATE,
--        updated_at       = NOW()
--  WHERE email = 'testuser1@example.com';
