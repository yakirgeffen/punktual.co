-- Migration: persist recurrence on events
-- Date: 2026-06-12
-- The create form has collected recurrence settings since v1, but they were
-- never saved (and never emitted) — recurrence is now generated as an RFC 5545
-- RRULE (src/utils/rrule.ts) and stored canonically here.

ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_rule TEXT;

COMMENT ON COLUMN events.is_recurring IS 'Whether the event repeats';
COMMENT ON COLUMN events.recurrence_rule IS 'RFC 5545 RRULE value (without RRULE: prefix), e.g. FREQ=WEEKLY;BYDAY=MO,WE';
