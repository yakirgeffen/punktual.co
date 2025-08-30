-- Create short_links table for URL shortening functionality
CREATE TABLE IF NOT EXISTS short_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_id VARCHAR(8) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  click_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id), -- optional if you have user auth
  event_title VARCHAR(255), -- helpful for your own tracking
  is_active BOOLEAN DEFAULT true -- for future expiration feature
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_short_links_short_id ON short_links(short_id);
CREATE INDEX IF NOT EXISTS idx_short_links_user_id ON short_links(user_id);
CREATE INDEX IF NOT EXISTS idx_short_links_created_at ON short_links(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read of active short links" ON short_links;
DROP POLICY IF EXISTS "Allow users to create short links" ON short_links;
DROP POLICY IF EXISTS "Allow users to view their own short links" ON short_links;
DROP POLICY IF EXISTS "Allow users to update their own short links" ON short_links;

-- Allow anyone to read active short links (for redirects)
CREATE POLICY "Allow public read of active short links" ON short_links
FOR SELECT USING (is_active = true);

-- Allow authenticated users to insert their own links
CREATE POLICY "Allow users to create short links" ON short_links
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own links
CREATE POLICY "Allow users to view their own short links" ON short_links
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own links (for deactivation)
CREATE POLICY "Allow users to update their own short links" ON short_links
FOR UPDATE USING (auth.uid() = user_id);

-- Add a comment to the table
COMMENT ON TABLE short_links IS 'Short URL links for calendar events with click tracking';

-- Add comments to key columns
COMMENT ON COLUMN short_links.short_id IS 'The unique 8-character short identifier used in URLs';
COMMENT ON COLUMN short_links.original_url IS 'The original long URL that this short link redirects to';
COMMENT ON COLUMN short_links.click_count IS 'Number of times this short link has been accessed';
COMMENT ON COLUMN short_links.event_title IS 'Optional title of the event for easier identification';
COMMENT ON COLUMN short_links.is_active IS 'Whether this short link is still active and should redirect';