-- Rollback Migration: Remove event_clicks analytics system
-- Date: 2025-11-16
-- Purpose: Rollback script in case analytics system needs to be removed

-- WARNING: This will delete all analytics data!
-- Only run this if you need to completely remove the analytics system

-- Drop triggers
DROP TRIGGER IF EXISTS after_event_click ON event_clicks;

-- Drop functions
DROP FUNCTION IF EXISTS increment_event_clicks();
DROP FUNCTION IF EXISTS get_event_analytics(UUID);
DROP FUNCTION IF EXISTS check_recent_click(UUID, INET, INTEGER);
DROP FUNCTION IF EXISTS get_user_events_analytics(UUID);

-- Drop table (CASCADE will drop foreign key constraints)
DROP TABLE IF EXISTS event_clicks CASCADE;

-- Remove total_clicks column from events
ALTER TABLE events DROP COLUMN IF EXISTS total_clicks;

-- Drop indexes (will be auto-dropped with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_events_total_clicks;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Event analytics system successfully rolled back';
END;
$$;
