-- Migration: Add Row Level Security (RLS) policies for events and user_profiles tables
-- Date: 2025-10-10
-- Purpose: Enforce data isolation between users and prevent unauthorized access

-- ============================================================================
-- EVENTS TABLE - Row Level Security
-- ============================================================================

-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent migration)
DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Users can create their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

-- SELECT: Users can only view their own events
CREATE POLICY "Users can view their own events" ON events
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only create events for themselves
CREATE POLICY "Users can create their own events" ON events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own events
CREATE POLICY "Users can update their own events" ON events
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own events
CREATE POLICY "Users can delete their own events" ON events
FOR DELETE
USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON POLICY "Users can view their own events" ON events IS
  'Prevents users from viewing events created by other users';
COMMENT ON POLICY "Users can create their own events" ON events IS
  'Ensures users can only create events associated with their own user_id';
COMMENT ON POLICY "Users can update their own events" ON events IS
  'Prevents users from modifying events they do not own';
COMMENT ON POLICY "Users can delete their own events" ON events IS
  'Prevents users from deleting events they do not own';


-- ============================================================================
-- USER_PROFILES TABLE - Row Level Security
-- ============================================================================

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent migration)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON user_profiles;

-- SELECT: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can create their own profile (during signup)
CREATE POLICY "Users can create their own profile" ON user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Optional: Allow public viewing of certain profile fields (if needed for public profiles feature)
-- Uncomment this if you want to support public profile pages in the future:
-- CREATE POLICY "Public profiles are viewable" ON user_profiles
-- FOR SELECT
-- USING (is_public = true); -- Add is_public column if you need this feature

-- Add comments for documentation
COMMENT ON POLICY "Users can view their own profile" ON user_profiles IS
  'Prevents users from viewing other users profile data';
COMMENT ON POLICY "Users can create their own profile" ON user_profiles IS
  'Allows authenticated users to create their own profile during signup';
COMMENT ON POLICY "Users can update their own profile" ON user_profiles IS
  'Prevents users from modifying other users profiles';


-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- After running this migration, verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('events', 'user_profiles', 'short_links');

-- Verify policies exist:
-- SELECT schemaname, tablename, policyname, cmd, qual FROM pg_policies WHERE tablename IN ('events', 'user_profiles', 'short_links');

-- Test queries (run as authenticated user):
-- SELECT * FROM events; -- Should only return your events
-- SELECT * FROM user_profiles; -- Should only return your profile
-- SELECT * FROM short_links; -- Should return active public links + your links