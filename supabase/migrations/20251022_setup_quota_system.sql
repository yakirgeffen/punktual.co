-- Migration: Add missing quota columns to user_profiles
-- Date: 2025-10-22
-- This migration ensures the quota columns exist for the event limiting system

-- Add quota columns if missing
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS events_created INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quota_reset_date DATE DEFAULT CURRENT_DATE;

-- Ensure NOT NULL constraints
ALTER TABLE user_profiles
ALTER COLUMN events_created SET NOT NULL,
ALTER COLUMN quota_reset_date SET NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_quota_reset_date ON user_profiles(quota_reset_date);

-- Create/replace the increment_event_count RPC function
CREATE OR REPLACE FUNCTION increment_event_count(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET events_created = events_created + 1,
      updated_at = NOW()
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create/replace the quota reset trigger
CREATE OR REPLACE FUNCTION reset_monthly_quota()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quota_reset_date != DATE_TRUNC('month', CURRENT_DATE)::DATE THEN
    NEW.quota_reset_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    NEW.events_created := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_reset_monthly_quota ON user_profiles;

CREATE TRIGGER trigger_reset_monthly_quota
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION reset_monthly_quota();

-- ============================================================================
-- AUTO-CREATE USER PROFILES ON SIGNUP
-- ============================================================================

-- Create function that will be triggered on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    email,
    full_name,
    plan,
    events_created,
    quota_reset_date
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'free',
    0,
    CURRENT_DATE
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
