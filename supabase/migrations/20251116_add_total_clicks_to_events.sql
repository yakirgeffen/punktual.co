-- Migration: Add denormalized total_clicks column to events table
-- Date: 2025-11-16
-- Purpose: Cache click count for fast dashboard queries (performance optimization)

-- Add total_clicks column
ALTER TABLE events ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0 NOT NULL;

-- Create index for sorting by clicks
CREATE INDEX IF NOT EXISTS idx_events_total_clicks ON events(total_clicks DESC);

-- Create trigger function to auto-increment total_clicks
CREATE OR REPLACE FUNCTION increment_event_clicks()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE events
  SET total_clicks = total_clicks + 1
  WHERE id = NEW.event_id;

  RETURN NEW;
END;
$$;

-- Create trigger on event_clicks insert
DROP TRIGGER IF EXISTS after_event_click ON event_clicks;
CREATE TRIGGER after_event_click
  AFTER INSERT ON event_clicks
  FOR EACH ROW
  EXECUTE FUNCTION increment_event_clicks();

-- Backfill existing data (count existing clicks and update events table)
DO $$
DECLARE
  event_record RECORD;
  click_count INTEGER;
BEGIN
  FOR event_record IN SELECT id FROM events LOOP
    SELECT COUNT(*)::INTEGER INTO click_count
    FROM event_clicks
    WHERE event_id = event_record.id;

    UPDATE events
    SET total_clicks = click_count
    WHERE id = event_record.id;
  END LOOP;
END;
$$;

-- Add column comment
COMMENT ON COLUMN events.total_clicks IS 'Denormalized counter of total clicks across all platforms (updated via trigger)';
