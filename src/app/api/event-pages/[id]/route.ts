import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, requireAuth } from '@/lib/supabase/server';

/**
 * PATCH /api/event-pages/[id]
 *
 * Updates an event page (any subset of fields including customization).
 * The authenticated user must own the page.
 *
 * Request body — all fields optional, only supplied fields are updated:
 *   title            string
 *   description      string | null
 *   location         string | null
 *   timezone         string
 *   start_at         string | null  (ISO 8601)
 *   end_at           string | null  (ISO 8601)
 *   is_all_day       boolean
 *   accent_color     string | null  (hex, e.g. '#10b981')
 *   bg_theme         'white' | 'stone' | 'dark' | 'gradient' | null
 *   font_choice      'nunito' | 'inter' | 'lora' | null
 *   cover_image_url  string | null
 *   host_name        string | null
 *   host_logo_url    string | null
 *   tagline          string | null
 *   cta_label        string | null
 *   cta_color        string | null
 *   og_image_url     string | null
 *
 * Response 200:
 *   { id, slug, updatedAt }
 *
 * Error responses:
 *   401 — not authenticated
 *   403 — authenticated but does not own this page
 *   404 — event page not found
 *   400 — no valid fields supplied
 *   500 — database error
 */

// Columns we accept for update — whitelist prevents arbitrary column injection
const ALLOWED_COLUMNS = new Set([
  'title', 'description', 'location', 'timezone',
  'start_at', 'end_at', 'is_all_day',
  'accent_color', 'bg_theme', 'font_choice', 'cover_image_url',
  'host_name', 'host_logo_url', 'tagline',
  'cta_label', 'cta_color', 'og_image_url',
]);

const VALID_BG_THEMES = new Set(['white', 'stone', 'dark', 'gradient']);
const VALID_FONT_CHOICES = new Set(['nunito', 'inter', 'lora']);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing event page id' }, { status: 400 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Build the update object — only whitelisted keys, with type validation
    const update: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_COLUMNS.has(key)) continue;

      // Light validation per field
      if (key === 'bg_theme' && value !== null && !VALID_BG_THEMES.has(value as string)) {
        return NextResponse.json(
          { error: `bg_theme must be one of: ${[...VALID_BG_THEMES].join(', ')}` },
          { status: 400 }
        );
      }
      if (key === 'font_choice' && value !== null && !VALID_FONT_CHOICES.has(value as string)) {
        return NextResponse.json(
          { error: `font_choice must be one of: ${[...VALID_FONT_CHOICES].join(', ')}` },
          { status: 400 }
        );
      }
      if (key === 'accent_color' && value !== null) {
        if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{3,8}$/.test(value as string)) {
          return NextResponse.json(
            { error: 'accent_color must be a valid hex color string' },
            { status: 400 }
          );
        }
      }
      if (key === 'cta_color' && value !== null) {
        if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{3,8}$/.test(value as string)) {
          return NextResponse.json(
            { error: 'cta_color must be a valid hex color string' },
            { status: 400 }
          );
        }
      }

      update[key] = value;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields supplied' }, { status: 400 });
    }

    // Always update updated_at
    update['updated_at'] = new Date().toISOString();

    const supabase = createServiceRoleClient();

    // Verify ownership
    const { data: page, error: fetchError } = await supabase
      .from('event_pages')
      .select('id, user_id, slug')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('[event-pages/patch] fetch error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch event page' }, { status: 500 });
    }

    if (!page) {
      return NextResponse.json({ error: 'Event page not found' }, { status: 404 });
    }

    if (page.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this event page' },
        { status: 403 }
      );
    }

    // Apply update
    const { data: updated, error: updateError } = await supabase
      .from('event_pages')
      .update(update)
      .eq('id', id)
      .select('id, slug, updated_at')
      .single();

    if (updateError) {
      console.error('[event-pages/patch] update error:', updateError);
      return NextResponse.json({ error: 'Failed to update event page' }, { status: 500 });
    }

    return NextResponse.json({
      id: updated.id,
      slug: updated.slug,
      updatedAt: updated.updated_at,
    });

  } catch (error) {
    console.error('[event-pages/patch] unexpected error:', error);
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/event-pages/[id]
 *
 * Fetches a single event page for the authenticated owner.
 * Used by the edit flow to pre-populate the form.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing event page id' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: page, error } = await supabase
      .from('event_pages')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[event-pages/get] fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch event page' }, { status: 500 });
    }

    if (!page) {
      return NextResponse.json({ error: 'Event page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });

  } catch (error) {
    console.error('[event-pages/get] unexpected error:', error);
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
