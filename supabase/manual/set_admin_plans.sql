-- MANUAL ACTUATION — Run in Supabase SQL editor, not via migration runner.
-- Run AFTER the test accounts have been created and signed up via the web app.
--
-- Purpose: Set Yakir's account to admin plan (unlimited quota, bypasses all
-- limits) and reset test accounts to a clean free-tier state before quota
-- testing begins.
--
-- Prerequisites:
--   - 20260616_add_admin_plan.sql must be applied first (adds the 'admin' plan
--     value to the check_valid_plan constraint on user_profiles).
--   - Test accounts must have signed up via the web app so their rows exist
--     in user_profiles.
--   - Replace placeholder emails below with actual test account emails.

-- 1. Set Yakir's account to admin plan (unlimited quota, bypasses all limits)
UPDATE public.user_profiles
   SET plan       = 'admin',
       updated_at = NOW()
 WHERE email = 'yakirgeffen@gmail.com';

-- 2. Set test account 1 to free plan (should already be free, but explicit)
-- Replace 'testuser1@example.com' with the actual test account email once created.
UPDATE public.user_profiles
   SET plan             = 'free',
       events_created   = 0,
       quota_reset_date = CURRENT_DATE,
       updated_at       = NOW()
 WHERE email = 'testuser1@example.com';  -- REPLACE WITH ACTUAL EMAIL

-- 3. Set test account 2 to free plan
UPDATE public.user_profiles
   SET plan             = 'free',
       events_created   = 0,
       quota_reset_date = CURRENT_DATE,
       updated_at       = NOW()
 WHERE email = 'testuser2@example.com';  -- REPLACE WITH ACTUAL EMAIL

-- 4. Verify the updates
SELECT email, plan, events_created, quota_reset_date
  FROM public.user_profiles
 WHERE email IN ('yakirgeffen@gmail.com', 'testuser1@example.com', 'testuser2@example.com');
-- Expected:
--   yakirgeffen@gmail.com  | admin | (any value — admin quota is not checked) | (any date)
--   testuser1@example.com  | free  | 0                                         | today
--   testuser2@example.com  | free  | 0                                         | today
