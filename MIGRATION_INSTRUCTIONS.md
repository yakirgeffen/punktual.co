# Database Migration Instructions

## ⚠️ MUST RUN BEFORE TESTING

The analytics features won't work without these migrations!

## How to Run Migrations

1. Go to https://supabase.com/dashboard
2. Select your `punktual.co` project
3. Click **SQL Editor** in the left sidebar
4. Click **"New Query"**
5. Copy/paste each migration below **IN ORDER**
6. Click **"Run"** for each one
7. Verify no errors

---

## Migration 1: Create event_clicks Table

**Copy this entire block and paste into SQL Editor:**

```sql
-- Migration: Create event_clicks table for analytics tracking
-- Date: 2025-11-16
-- Purpose: Track calendar button clicks for analytics (paid users)

-- Create event_clicks table
CREATE TABLE IF NOT EXISTS event_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('google', 'apple', 'outlook', 'office365', 'outlookcom', 'yahoo')),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Optional tracking fields for advanced analytics (can be NULL for privacy)
  user_agent TEXT,
  referrer TEXT,
  ip_address INET
);

-- Indexes for performance
CREATE INDEX idx_event_clicks_event_id ON event_clicks(event_id);
CREATE INDEX idx_event_clicks_clicked_at ON event_clicks(clicked_at DESC);
CREATE INDEX idx_event_clicks_platform ON event_clicks(platform);
CREATE INDEX idx_event_clicks_event_platform ON event_clicks(event_id, platform);
CREATE INDEX idx_event_clicks_ip_time ON event_clicks(ip_address, clicked_at DESC);

-- Row Level Security (RLS)
ALTER TABLE event_clicks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public click tracking" ON event_clicks;
DROP POLICY IF EXISTS "Users can view their event clicks" ON event_clicks;

-- Policy 1: Allow anyone to insert clicks (public landing pages need this)
CREATE POLICY "Allow public click tracking" ON event_clicks
  FOR INSERT WITH CHECK (true);

-- Policy 2: Users can only view clicks for their own events
CREATE POLICY "Users can view their event clicks" ON event_clicks
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- Table comments
COMMENT ON TABLE event_clicks IS 'Tracks calendar button clicks from landing pages for analytics';
```

**Expected Result:** "Success. No rows returned"

---

## Migration 2: Create Analytics Functions

**Copy this entire block:**

```sql
-- Migration: Create analytics RPC functions
-- Date: 2025-11-16
-- Purpose: SQL functions for efficient analytics queries

-- Function 1: Get aggregated analytics for a single event
CREATE OR REPLACE FUNCTION get_event_analytics(p_event_id UUID)
RETURNS TABLE (
  total_clicks BIGINT,
  platform_breakdown JSONB,
  last_clicked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_clicks,
    jsonb_object_agg(platform, click_count) AS platform_breakdown,
    MAX(clicked_at) AS last_clicked_at
  FROM (
    SELECT
      platform,
      COUNT(*)::INTEGER AS click_count
    FROM event_clicks
    WHERE event_id = p_event_id
    GROUP BY platform
  ) platform_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Check if IP recently clicked (for rate limiting)
CREATE OR REPLACE FUNCTION check_recent_click(
  p_event_id UUID,
  p_ip_address INET,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  recent_click_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM event_clicks
    WHERE event_id = p_event_id
      AND ip_address = p_ip_address
      AND clicked_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL
  ) INTO recent_click_exists;

  RETURN recent_click_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Get analytics for all user's events (for dashboard)
CREATE OR REPLACE FUNCTION get_user_events_analytics(p_user_id UUID)
RETURNS TABLE (
  event_id UUID,
  event_title TEXT,
  total_clicks BIGINT,
  last_clicked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id AS event_id,
    e.title AS event_title,
    COALESCE(COUNT(ec.id), 0)::BIGINT AS total_clicks,
    MAX(ec.clicked_at) AS last_clicked_at
  FROM events e
  LEFT JOIN event_clicks ec ON e.id = ec.event_id
  WHERE e.user_id = p_user_id
  GROUP BY e.id, e.title
  ORDER BY total_clicks DESC, e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_event_analytics(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_recent_click(UUID, INET, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_events_analytics(UUID) TO authenticated;

-- Function comments
COMMENT ON FUNCTION get_event_analytics IS 'Returns aggregated click analytics for a single event';
COMMENT ON FUNCTION check_recent_click IS 'Checks if IP address clicked event within time window (for rate limiting)';
COMMENT ON FUNCTION get_user_events_analytics IS 'Returns click analytics for all events owned by a user';
```

**Expected Result:** "Success. No rows returned"

---

## Migration 3: Add Denormalized Click Counter

**Copy this entire block:**

```sql
-- Migration: Add denormalized click counter to events table
-- Date: 2025-11-16
-- Purpose: Performance optimization - avoid COUNT queries on dashboard

-- Add total_clicks column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0 NOT NULL;

-- Create index for sorting by clicks
CREATE INDEX IF NOT EXISTS idx_events_total_clicks ON events(total_clicks DESC);

-- Backfill existing data
UPDATE events e
SET total_clicks = (
  SELECT COUNT(*)
  FROM event_clicks ec
  WHERE ec.event_id = e.id
)
WHERE EXISTS (
  SELECT 1 FROM event_clicks ec WHERE ec.event_id = e.id
);

-- Create trigger function to auto-increment
CREATE OR REPLACE FUNCTION increment_event_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events
  SET total_clicks = total_clicks + 1
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS after_event_click ON event_clicks;

-- Create trigger
CREATE TRIGGER after_event_click
  AFTER INSERT ON event_clicks
  FOR EACH ROW
  EXECUTE FUNCTION increment_event_clicks();

-- Column comment
COMMENT ON COLUMN events.total_clicks IS 'Denormalized counter for fast dashboard queries (auto-incremented by trigger)';
```

**Expected Result:** "Success. No rows returned" (or shows number of rows updated if you have existing events)

---

## ✅ Verification

After running all 3 migrations, verify they worked:

```sql
-- Check table exists
SELECT COUNT(*) FROM event_clicks;

-- Check functions exist
SELECT proname FROM pg_proc WHERE proname IN (
  'get_event_analytics',
  'check_recent_click',
  'get_user_events_analytics'
);

-- Check column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'total_clicks';
```

**Expected:**
- First query: Returns `0` (empty table)
- Second query: Returns 3 rows with function names
- Third query: Returns 1 row: `total_clicks`

---

## 🎉 Done!

Once all 3 migrations run successfully, you're ready to test locally!

Continue with the **LOCAL_TESTING_GUIDE.md** instructions.
