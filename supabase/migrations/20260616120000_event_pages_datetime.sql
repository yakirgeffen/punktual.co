-- Migration: add datetime columns to event_pages
--
-- Adds start_at, end_at, and is_all_day to event_pages so the public landing
-- page (/e/[slug]) can display accurate event times and generate correct
-- calendar-add links. The feed endpoint (/api/feed/[feed_token]) is updated
-- in the same pass to use real timestamps instead of the created_at stub.
--
-- Columns are nullable (start_at, end_at) so existing rows survive without
-- data migration. The application treats NULL start_at as "no time set yet"
-- and renders a graceful fallback on the landing page.
--
-- is_all_day is NOT NULL with DEFAULT false so existing rows inherit the
-- timed-event assumption (which matches the placeholder DTSTART behavior
-- already in the feed endpoint).

ALTER TABLE event_pages
  ADD COLUMN IF NOT EXISTS start_at  timestamptz,
  ADD COLUMN IF NOT EXISTS end_at    timestamptz,
  ADD COLUMN IF NOT EXISTS is_all_day boolean NOT NULL DEFAULT false;

-- Index: the public landing page and feed endpoint both filter by slug and
-- feed_token respectively; those indexes already exist from the initial
-- migration. No new indexes required for these columns in v1 (queries filter
-- on slug/feed_token first, datetime columns only appear in SELECT).
