-- Migration: Create analytics aggregation functions
-- Date: 2025-11-16
-- Purpose: Efficient SQL functions for fetching event click analytics

-- Function 1: Get aggregated analytics for a single event
CREATE OR REPLACE FUNCTION get_event_analytics(p_event_id UUID)
RETURNS TABLE (
  total_clicks BIGINT,
  platform_breakdown JSONB,
  last_clicked_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH click_stats AS (
    SELECT
      platform,
      COUNT(*)::INTEGER as platform_count,
      MAX(clicked_at) as last_click
    FROM event_clicks
    WHERE event_id = p_event_id
    GROUP BY platform
  )
  SELECT
    COALESCE(SUM(platform_count), 0)::BIGINT as total_clicks,
    COALESCE(
      jsonb_object_agg(
        platform,
        platform_count
      ),
      '{}'::jsonb
    ) as platform_breakdown,
    MAX(last_click) as last_clicked_at
  FROM click_stats;
END;
$$;

-- Function 2: Check if IP address clicked recently (for rate limiting)
CREATE OR REPLACE FUNCTION check_recent_click(
  p_event_id UUID,
  p_ip_address INET,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  recent_click_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM event_clicks
    WHERE event_id = p_event_id
      AND ip_address = p_ip_address
      AND clicked_at >= NOW() - (p_window_seconds || ' seconds')::INTERVAL
  ) INTO recent_click_exists;

  RETURN recent_click_exists;
END;
$$;

-- Function 3: Get analytics for multiple events (dashboard view)
CREATE OR REPLACE FUNCTION get_user_events_analytics(p_user_id UUID)
RETURNS TABLE (
  event_id UUID,
  event_title TEXT,
  total_clicks BIGINT,
  last_clicked_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id as event_id,
    e.title as event_title,
    COALESCE(COUNT(ec.id), 0)::BIGINT as total_clicks,
    MAX(ec.clicked_at) as last_clicked_at
  FROM events e
  LEFT JOIN event_clicks ec ON ec.event_id = e.id
  WHERE e.user_id = p_user_id
  GROUP BY e.id, e.title
  ORDER BY last_clicked_at DESC NULLS LAST, e.created_at DESC;
END;
$$;

-- Add function comments
COMMENT ON FUNCTION get_event_analytics(UUID) IS 'Returns total clicks, platform breakdown, and last click timestamp for an event';
COMMENT ON FUNCTION check_recent_click(UUID, INET, INTEGER) IS 'Checks if an IP address has clicked an event recently (for rate limiting)';
COMMENT ON FUNCTION get_user_events_analytics(UUID) IS 'Returns click analytics for all events belonging to a user';
