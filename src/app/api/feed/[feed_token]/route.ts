/**
 * Webcal feed endpoint — B-1a
 *
 * Route: GET /api/feed/[feed_token]
 *
 * Returns a valid RFC 5545 iCalendar feed for the event page identified by
 * feed_token. Calendar clients (Apple Calendar, Google Calendar, Outlook) poll
 * this URL on their own schedules; the response is CDN-cached at Vercel's edge
 * to avoid hitting Supabase on every poll.
 *
 * Design decisions:
 *   - Reads via service role (bypasses RLS). feed_token is the auth mechanism —
 *     it is an opaque UUID not guessable from the organizer's user_id or page id.
 *   - One feed_token → one event_page (v1). The structure (events: IcsEventInput[])
 *     is already multi-event — a future migration adding multiple events per
 *     feed_token requires no change to this handler.
 *   - Cache-Control: public, max-age=3600, stale-while-revalidate=86400.
 *     Calendar clients get a CDN hit; Supabase sees at most one query per feed
 *     per hour regardless of subscriber count.
 *   - Content-Disposition: inline so calendar clients display the filename
 *     rather than triggering a download dialog.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { buildIcsFeed, IcsEventInput } from '@/utils/ics';

/**
 * Shape of a row returned from event_pages.
 * Using a local interface rather than a generated DB type because the project
 * does not yet have a generated types file (see TODO in server.ts).
 */
interface EventPageRow {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  timezone: string;
  // start_at / end_at are not yet columns in event_pages v1 — see note below.
  // The table stores the page metadata; individual event occurrences for the feed
  // are derived from the page title/description until the event_occurrences table
  // is added in a future migration (B-1 scope). For B-1a the feed serializes the
  // page itself as a single VEVENT with today's date as a placeholder DTSTART.
  // This is explicitly a v1 stub — see note at end of file.
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ feed_token: string }> }
) {
  const { feed_token } = await params;

  // Basic token shape guard — UUID format (8-4-4-4-12 hex)
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(feed_token)) {
    return new NextResponse('Not found', { status: 404 });
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (err) {
    console.error('[feed] Supabase client init failed:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }

  // Fetch the event page by feed_token.
  // Service role bypasses RLS — feed_token is the access credential.
  const { data: page, error } = await supabase
    .from('event_pages')
    .select('id, title, description, location, timezone, created_at')
    .eq('feed_token', feed_token)
    .eq('is_published', true)
    .single();

  if (error || !page) {
    // Log at debug level — 404s from stale tokens are expected; not an alert condition
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "no rows returned" — not a real error
      console.error('[feed] DB error fetching event page:', error.message);
    }
    return new NextResponse('Not found', { status: 404 });
  }

  const eventPage = page as EventPageRow;

  // Build IcsEventInput array.
  //
  // B-1a v1 stub note: event_pages does not yet have start_at / end_at columns —
  // those belong in the full B-1 build when the organizer creation UI is added.
  // For the feed to be a valid, parseable VCALENDAR that calendar clients can
  // subscribe to immediately, we emit the event page as a single VEVENT using
  // page creation date as DTSTART (all-day). When B-1 adds start_at/end_at to
  // event_pages, replace the stub below with real date columns and set isAllDay
  // appropriately. The IcsEventInput type and buildIcsFeed() call are already
  // the correct final shape — only the data source changes.
  //
  // The uid is stable per page (id@punktual.co) so calendar clients track updates
  // correctly rather than creating duplicate events on re-poll.
  const createdDate = eventPage.created_at.slice(0, 10); // 'YYYY-MM-DD'

  const events: IcsEventInput[] = [
    {
      uid: `${eventPage.id}@punktual.co`,
      title: eventPage.title,
      description: eventPage.description ?? undefined,
      location: eventPage.location ?? undefined,
      startDate: createdDate,
      isAllDay: true,
      timezone: eventPage.timezone,
    },
  ];

  let icsBody: string;
  try {
    icsBody = buildIcsFeed(events, eventPage.title);
  } catch (err) {
    console.error('[feed] ICS serialization error:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }

  return new NextResponse(icsBody, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="punktual.ics"',
      // CDN caches the feed for 1 hour; stale feed served for up to 24 h while
      // revalidating in the background. Calendar clients that poll more frequently
      // than hourly get the cached response — Supabase load is bounded.
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
