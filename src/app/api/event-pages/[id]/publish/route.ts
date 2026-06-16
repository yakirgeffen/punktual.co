import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, requireAuth } from '@/lib/supabase/server';

/**
 * POST /api/event-pages/[id]/publish
 *
 * Toggles is_published on an event page. The authenticated user must own the page.
 *
 * Request body:
 *   { published: boolean }
 *
 * Response 200:
 *   { id, isPublished, slug, eventPageUrl }
 *
 * Error responses:
 *   401 — not authenticated
 *   403 — authenticated but does not own this page
 *   404 — event page not found
 *   400 — missing or invalid body
 *   500 — database error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);

    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Missing event page id' },
        { status: 400 }
      );
    }

    // Parse body
    let body: { published?: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (typeof body.published !== 'boolean') {
      return NextResponse.json(
        { error: 'published (boolean) is required in the request body' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Fetch the page to verify ownership
    const { data: page, error: fetchError } = await supabase
      .from('event_pages')
      .select('id, user_id, slug, is_published, start_at')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('[event-pages/publish] fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch event page' },
        { status: 500 }
      );
    }

    if (!page) {
      return NextResponse.json(
        { error: 'Event page not found' },
        { status: 404 }
      );
    }

    if (page.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this event page' },
        { status: 403 }
      );
    }

    // Require a date before publishing — attendees can't save a dateless event
    // and the calendar-add buttons would have nothing to point at. Unpublishing
    // is always allowed. This is the real gate behind the dashboard's toast.
    if (body.published === true && !page.start_at) {
      return NextResponse.json(
        { error: 'Add a start date before publishing this event page.' },
        { status: 422 }
      );
    }

    // Update is_published
    const { data: updated, error: updateError } = await supabase
      .from('event_pages')
      .update({ is_published: body.published })
      .eq('id', id)
      .select('id, slug, is_published')
      .single();

    if (updateError) {
      console.error('[event-pages/publish] update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update event page' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: updated.id,
      isPublished: updated.is_published,
      slug: updated.slug,
      eventPageUrl: `/e/${updated.slug}`,
    });

  } catch (error) {
    console.error('[event-pages/publish] Unexpected error:', error);

    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
