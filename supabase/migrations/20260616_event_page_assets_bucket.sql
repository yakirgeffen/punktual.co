-- Migration: event-page-assets storage bucket + policies
-- Date: 2026-06-16
-- Purpose: Public storage bucket backing the event-page customization feature —
--          cover/hero images, host logos, and custom OG override images uploaded
--          by organizers from the edit-event-page editor.
--
-- Applied to punktual-prod (tusfsqivanmjqaldkdtx) via Supabase MCP 2026-06-16.
-- Mirrored here so a fresh database replay reproduces the same storage setup.
--
-- Path convention: {auth.uid()}/<filename> — the upload code writes under the
-- organizer's uid folder so the per-user INSERT/DELETE policies below can scope
-- writes to the owner. Reads are public (cover images render on the public page).
--
-- Idempotency: ON CONFLICT on the bucket; DROP POLICY IF EXISTS before each
-- CREATE POLICY (CREATE POLICY has no IF NOT EXISTS form). Safe to re-run.

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-page-assets', 'event-page-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Organizers can upload event assets" ON storage.objects;
CREATE POLICY "Organizers can upload event assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-page-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Organizers can delete their own event assets" ON storage.objects;
CREATE POLICY "Organizers can delete their own event assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-page-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Event assets are publicly readable" ON storage.objects;
CREATE POLICY "Event assets are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-page-assets');
