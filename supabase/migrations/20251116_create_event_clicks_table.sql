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
CREATE INDEX idx_event_clicks_event_platform ON event_clicks(event_id, platform);  -- Composite for aggregations
CREATE INDEX idx_event_clicks_ip_time ON event_clicks(ip_address, clicked_at DESC); -- For rate limiting

-- Row Level Security (RLS)
ALTER TABLE event_clicks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean migration)
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

-- Table and column comments for documentation
COMMENT ON TABLE event_clicks IS 'Tracks calendar button clicks from landing pages for analytics';
COMMENT ON COLUMN event_clicks.event_id IS 'Reference to the parent event';
COMMENT ON COLUMN event_clicks.platform IS 'Which calendar platform was clicked (google, apple, etc.)';
COMMENT ON COLUMN event_clicks.clicked_at IS 'Timestamp when the button was clicked';
COMMENT ON COLUMN event_clicks.ip_address IS 'Client IP address for duplicate detection and rate limiting';
COMMENT ON COLUMN event_clicks.user_agent IS 'Browser user agent for device analytics';
COMMENT ON COLUMN event_clicks.referrer IS 'HTTP referrer for traffic source tracking';
