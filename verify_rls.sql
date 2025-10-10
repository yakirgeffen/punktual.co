-- Verification script for RLS policies
-- Run this in Supabase Dashboard → SQL Editor to verify RLS is working

-- 1. Check that RLS is enabled on all tables
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('events', 'user_profiles', 'short_links')
ORDER BY tablename;

-- 2. List all RLS policies that were created
SELECT
  schemaname,
  tablename,
  policyname as "Policy Name",
  cmd as "Command"
FROM pg_policies
WHERE tablename IN ('events', 'user_profiles', 'short_links')
ORDER BY tablename, cmd;

-- Expected results:
-- Table: events - should have 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- Table: user_profiles - should have 3 policies (SELECT, INSERT, UPDATE)
-- Table: short_links - should have 4 policies (already existed)