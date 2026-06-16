-- Migration: Events Platform B-1a — event_pages and attendees tables
-- Date: 2026-06-16
-- Purpose: Introduce the two tables required for the webcal feed endpoint (B-1a)
--          and the RSVP surface (B-2). B-1a ships first; this migration covers both
--          to avoid a second schema change when B-2 begins.
--
-- Design notes:
--   - event_pages is intentionally separate from the existing events table.
--     events = user's saved calendar event (private). event_pages = public organizer page.
--   - feed_token is the opaque UUID surfaced in webcal URLs (/api/feed/[feed_token]).
--     It is NOT the event_page id — it is rotatable and does not expose the organizer id.
--   - The feed endpoint reads via the service role (bypasses RLS), so NO public SELECT
--     policy is added for the feed read path. Organizer writes are RLS-protected.
--   - attendees INSERT is intentionally open to unauthenticated users (RSVP form is public).
--     Organizer reads their own attendees. No public read of attendee PII.
--   - All timestamps are timestamptz (timezone-aware); the ICS serializer needs UTC.
--   - Standard PostgreSQL only (A11 portability): no Supabase-proprietary extensions
--     beyond RLS and auth.uid(), which any Postgres-with-RLS provider supports.

-- ============================================================================
-- event_pages TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_pages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug            text        NOT NULL,
  title           text        NOT NULL,
  description     text,
  location        text,
  timezone        text        NOT NULL DEFAULT 'UTC',
  feed_token      uuid        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  is_published    boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_pages_slug_unique UNIQUE (slug)
);

COMMENT ON TABLE event_pages IS
  'Public-facing organizer event pages. Distinct from events (private saved calendar events).';
COMMENT ON COLUMN event_pages.user_id IS
  'Organizer — references auth.users. Cascade-deletes the page if the account is removed.';
COMMENT ON COLUMN event_pages.slug IS
  'URL slug: punktual.co/e/[slug]. Organizer-chosen; unique across the platform.';
COMMENT ON COLUMN event_pages.feed_token IS
  'Opaque UUID for webcal endpoint: /api/feed/[feed_token]. Does not expose user_id.';
COMMENT ON COLUMN event_pages.is_published IS
  'False = draft (visible only to organizer). True = public page live.';

-- Index for feed token lookup (hot path — every webcal poll hits this)
CREATE INDEX IF NOT EXISTS idx_event_pages_feed_token ON event_pages (feed_token);

-- Index for slug lookup (hot path — every page view hits this)
CREATE INDEX IF NOT EXISTS idx_event_pages_slug ON event_pages (slug);

-- Index for organizer dashboard queries
CREATE INDEX IF NOT EXISTS idx_event_pages_user_id ON event_pages (user_id);

-- ============================================================================
-- event_pages — Row Level Security
-- ============================================================================

ALTER TABLE event_pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies idempotently
DROP POLICY IF EXISTS "Organizers can view their own event pages" ON event_pages;
DROP POLICY IF EXISTS "Organizers can create their own event pages" ON event_pages;
DROP POLICY IF EXISTS "Organizers can update their own event pages" ON event_pages;
DROP POLICY IF EXISTS "Organizers can delete their own event pages" ON event_pages;
DROP POLICY IF EXISTS "Published event pages are publicly viewable" ON event_pages;

-- SELECT: organizer sees their own pages (published or draft)
CREATE POLICY "Organizers can view their own event pages" ON event_pages
FOR SELECT
USING (auth.uid() = user_id);

-- SELECT: unauthenticated / other users see only published pages
-- (for the public event landing page route /e/[slug])
CREATE POLICY "Published event pages are publicly viewable" ON event_pages
FOR SELECT
USING (is_published = true);

-- INSERT: organizer can create pages for themselves only
CREATE POLICY "Organizers can create their own event pages" ON event_pages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: organizer can update their own pages
CREATE POLICY "Organizers can update their own event pages" ON event_pages
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: organizer can delete their own pages
CREATE POLICY "Organizers can delete their own event pages" ON event_pages
FOR DELETE
USING (auth.uid() = user_id);

COMMENT ON POLICY "Organizers can view their own event pages" ON event_pages IS
  'Organizer can see all their pages (draft + published) in their dashboard.';
COMMENT ON POLICY "Published event pages are publicly viewable" ON event_pages IS
  'Public event landing page route: any user (auth or not) can read published pages.';
COMMENT ON POLICY "Organizers can create their own event pages" ON event_pages IS
  'Prevents creating pages attributed to another organizer.';
COMMENT ON POLICY "Organizers can update their own event pages" ON event_pages IS
  'Prevents editing another organizer''s page.';
COMMENT ON POLICY "Organizers can delete their own event pages" ON event_pages IS
  'Prevents deleting another organizer''s page.';

-- ============================================================================
-- attendees TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS attendees (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_page_id   uuid        NOT NULL REFERENCES event_pages(id) ON DELETE CASCADE,
  email           text        NOT NULL,
  name            text        NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendees_unique_email_per_event UNIQUE (event_page_id, email)
);

COMMENT ON TABLE attendees IS
  'RSVP / registration records. One row per attendee per event page.';
COMMENT ON COLUMN attendees.email IS
  'Attendee email. Unique per event_page — prevents duplicate RSVPs.';
COMMENT ON COLUMN attendees.name IS
  'Attendee display name as provided at RSVP time.';

-- Index for organizer attendee-list queries
CREATE INDEX IF NOT EXISTS idx_attendees_event_page_id ON attendees (event_page_id);

-- ============================================================================
-- attendees — Row Level Security
-- ============================================================================

ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies idempotently
DROP POLICY IF EXISTS "Organizers can view their event attendees" ON attendees;
DROP POLICY IF EXISTS "Anyone can register as an attendee" ON attendees;

-- SELECT: organizer can read all attendees for their pages
-- Uses a subquery to join through event_pages.user_id
CREATE POLICY "Organizers can view their event attendees" ON attendees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM event_pages ep
    WHERE ep.id = attendees.event_page_id
      AND ep.user_id = auth.uid()
  )
);

-- INSERT: unauthenticated users can register (public RSVP form)
-- No WITH CHECK on user identity — attendees are not authenticated users
CREATE POLICY "Anyone can register as an attendee" ON attendees
FOR INSERT
WITH CHECK (true);

COMMENT ON POLICY "Organizers can view their event attendees" ON attendees IS
  'Organizer sees their attendee list; attendees cannot see each other''s PII.';
COMMENT ON POLICY "Anyone can register as an attendee" ON attendees IS
  'RSVP form is public — no auth required to submit. Unique constraint prevents duplicates.';

-- ============================================================================
-- VERIFICATION QUERIES (run after applying to confirm state)
-- ============================================================================

-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' AND tablename IN ('event_pages', 'attendees');
-- Expected: both rows have rowsecurity = true

-- SELECT tablename, policyname, cmd FROM pg_policies
--   WHERE tablename IN ('event_pages', 'attendees')
--   ORDER BY tablename, policyname;
-- Expected: 5 policies on event_pages, 2 on attendees
