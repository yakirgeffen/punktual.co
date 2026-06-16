-- Migration: event_pages customization columns
-- Date: 2026-06-16
-- Purpose: Add display and branding columns to event_pages so organizers can
--          customize the visual appearance of their public event landing page.
--          This migration adds columns only — it does not touch existing columns,
--          constraints, indexes, or RLS policies already established in:
--            20260616_events_platform_b1a.sql        (table + RLS)
--            20260616120000_event_pages_datetime.sql (start_at, end_at, is_all_day)
--
-- New columns:
--   accent_color     — primary brand color for the event page (hex string)
--   bg_theme         — background palette key: 'white' | 'stone' | 'dark' | 'gradient'
--   font_choice      — body/heading font key: 'nunito' | 'inter' | 'lora'
--   cover_image_url  — optional hero/banner image for the landing page
--   host_name        — organizer display name shown on the page
--   host_logo_url    — optional organizer logo image
--   tagline          — short event subtitle shown beneath the title
--   cta_label        — label on the Add-to-Calendar call-to-action button
--   cta_color        — override color for the CTA button (NULL = use accent_color)
--   og_image_url     — manual override for the social preview image;
--                      when NULL the dynamic /api/og/event route is used instead
--
-- RLS: no new policies required. Existing policies on event_pages already cover
--      all columns in this table:
--        "Organizers can update their own event pages" — covers UPDATE of new cols
--        "Published event pages are publicly viewable" — covers SELECT of new cols
--        (policies are row-level; they apply to the full row, not individual cols)
--
-- Indexes: none added. These are display-only columns. Queries are always
--          anchored on slug or feed_token (both indexed in the base migration).
--
-- Idempotency: every ADD COLUMN uses IF NOT EXISTS so re-running this migration
--              is safe on a database that already applied it.

ALTER TABLE event_pages
  ADD COLUMN IF NOT EXISTS accent_color    text    NOT NULL DEFAULT '#10b981',
  ADD COLUMN IF NOT EXISTS bg_theme        text    NOT NULL DEFAULT 'white',
  ADD COLUMN IF NOT EXISTS font_choice     text    NOT NULL DEFAULT 'nunito',
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS host_name       text,
  ADD COLUMN IF NOT EXISTS host_logo_url   text,
  ADD COLUMN IF NOT EXISTS tagline         text,
  ADD COLUMN IF NOT EXISTS cta_label       text    NOT NULL DEFAULT 'Add to calendar',
  ADD COLUMN IF NOT EXISTS cta_color       text,
  ADD COLUMN IF NOT EXISTS og_image_url    text;

-- Column comments for schema documentation and Supabase Studio readability
COMMENT ON COLUMN event_pages.accent_color IS
  'Primary brand color for the event page. Hex string (e.g. #10b981). Defaults to Punktual emerald.';
COMMENT ON COLUMN event_pages.bg_theme IS
  'Background palette key. Accepted values: white | stone | dark | gradient. Enforced by application layer.';
COMMENT ON COLUMN event_pages.font_choice IS
  'Font key for page headings and body. Accepted values: nunito | inter | lora. Enforced by application layer.';
COMMENT ON COLUMN event_pages.cover_image_url IS
  'Optional hero/banner image URL for the public event landing page. NULL = no cover image.';
COMMENT ON COLUMN event_pages.host_name IS
  'Organizer display name shown on the event page. NULL = omit host byline.';
COMMENT ON COLUMN event_pages.host_logo_url IS
  'Optional organizer logo URL. NULL = omit logo. Displayed near host_name when both are set.';
COMMENT ON COLUMN event_pages.tagline IS
  'Short event subtitle displayed beneath the main title. NULL = no tagline.';
COMMENT ON COLUMN event_pages.cta_label IS
  'Label text on the Add-to-Calendar call-to-action button. Defaults to "Add to calendar".';
COMMENT ON COLUMN event_pages.cta_color IS
  'Override hex color for the CTA button. NULL = inherit accent_color.';
COMMENT ON COLUMN event_pages.og_image_url IS
  'Manual override URL for the social preview (OG) image. NULL = use dynamic /api/og/event route.';

-- ============================================================================
-- VERIFICATION QUERIES (run after applying to confirm state)
-- ============================================================================

-- SELECT column_name, data_type, column_default, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public'
--     AND table_name = 'event_pages'
--     AND column_name IN (
--       'accent_color', 'bg_theme', 'font_choice', 'cover_image_url',
--       'host_name', 'host_logo_url', 'tagline', 'cta_label', 'cta_color', 'og_image_url'
--     )
--   ORDER BY ordinal_position;
-- Expected: 10 rows, accent_color/bg_theme/font_choice/cta_label NOT NULL, others nullable.
