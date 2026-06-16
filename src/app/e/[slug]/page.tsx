/**
 * Public event landing page — /e/[slug]
 *
 * Server component. No auth required. Fetches the published event_pages row
 * by slug via the anon client (public-read RLS policy covers this).
 *
 * Renders:
 *   - Hero: title, formatted date/time, location, description
 *   - Calendar-add buttons (Google / Apple / Outlook) via existing generator
 *   - Webcal subscribe link (the Punktual differentiator)
 *   - Scope line re: RSVP / ticketing
 *   - "Powered by Punktual" footer
 *
 * 404s cleanly if slug is not found or page is not published.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { generateCalendarLinks } from '@/utils/calendarGenerator';
import type { EventData } from '@/types';

// ---------------------------------------------------------------------------
// Supabase anon client (public reads only — no service role needed here
// because the RLS policy "Published event pages are publicly viewable" allows
// SELECT on event_pages WHERE is_published = true using the anon key).
// ---------------------------------------------------------------------------

function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventPageRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  location: string | null;
  timezone: string;
  feed_token: string;
  is_published: boolean;
  start_at: string | null;
  end_at: string | null;
  is_all_day: boolean;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('event_pages')
      .select('title, description')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (!data) return { title: 'Event | Punktual' };

    return {
      title: `${data.title} | Punktual`,
      description: data.description ?? `View and add this event to your calendar.`,
    };
  } catch {
    return { title: 'Event | Punktual' };
  }
}

// ---------------------------------------------------------------------------
// Date/time formatting helpers (server-side, no browser APIs)
// ---------------------------------------------------------------------------

function formatEventDate(
  startAt: string | null,
  endAt: string | null,
  isAllDay: boolean,
  timezone: string
): string | null {
  if (!startAt) return null;

  try {
    const start = new Date(startAt);
    const end = endAt ? new Date(endAt) : null;

    const dateOpts: Intl.DateTimeFormatOptions = {
      timeZone: timezone || 'UTC',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };

    const timeOpts: Intl.DateTimeFormatOptions = {
      timeZone: timezone || 'UTC',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    if (isAllDay) {
      const startStr = start.toLocaleDateString('en-US', dateOpts);
      if (end) {
        // Check if same day
        const startDay = start.toLocaleDateString('en-US', { timeZone: timezone || 'UTC' });
        const endDay = end.toLocaleDateString('en-US', { timeZone: timezone || 'UTC' });
        if (startDay !== endDay) {
          const endStr = end.toLocaleDateString('en-US', dateOpts);
          return `${startStr} – ${endStr}`;
        }
      }
      return startStr;
    }

    const startDateStr = start.toLocaleDateString('en-US', dateOpts);
    const startTimeStr = start.toLocaleTimeString('en-US', timeOpts);

    if (end) {
      const startDay = start.toLocaleDateString('en-US', { timeZone: timezone || 'UTC' });
      const endDay = end.toLocaleDateString('en-US', { timeZone: timezone || 'UTC' });
      const endTimeStr = end.toLocaleTimeString('en-US', timeOpts);

      if (startDay === endDay) {
        return `${startDateStr}, ${startTimeStr} – ${endTimeStr}`;
      }

      const endDateStr = end.toLocaleDateString('en-US', dateOpts);
      return `${startDateStr}, ${startTimeStr} – ${endDateStr}, ${endTimeStr}`;
    }

    return `${startDateStr}, ${startTimeStr}`;
  } catch {
    return null;
  }
}

/**
 * Returns a short human-readable timezone label, e.g. "Eastern Time (ET)".
 * Falls back to the raw IANA string if Intl is unavailable.
 */
function formatTimezone(ianaZone: string): string {
  if (!ianaZone || ianaZone === 'UTC') return 'UTC';
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaZone,
      timeZoneName: 'long',
    });
    const parts = formatter.formatToParts(new Date());
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value ?? ianaZone;
    return tzName;
  } catch {
    return ianaZone;
  }
}

/**
 * Convert a timestamptz string + timezone to EventData date/time fields
 * so we can pass them to generateCalendarLinks.
 */
function timestampToEventFields(
  isoString: string,
  timezone: string
): { date: string; time: string } {
  const d = new Date(isoString);
  // Get the wall-clock date/time in the event's timezone
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone || 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // en-CA locale gives YYYY-MM-DD format natively
  const dateParts = fmt.formatToParts(d);
  const year = dateParts.find(p => p.type === 'year')?.value ?? '';
  const month = dateParts.find(p => p.type === 'month')?.value ?? '';
  const day = dateParts.find(p => p.type === 'day')?.value ?? '';
  const date = `${year}-${month}-${day}`;

  const timeParts = timeFmt.formatToParts(d);
  const hour = timeParts.find(p => p.type === 'hour')?.value?.padStart(2, '0') ?? '00';
  const minute = timeParts.find(p => p.type === 'minute')?.value?.padStart(2, '0') ?? '00';
  // Intl hour12:false can give "24" for midnight — clamp it
  const safeHour = hour === '24' ? '00' : hour;
  const time = `${safeHour}:${minute}`;

  return { date, time };
}

// ---------------------------------------------------------------------------
// Calendar icon SVGs (inline, no external dependency)
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.525 24.565c0-1.67-.15-3.27-.43-4.81H24v9.1h12.1c-.52 2.8-2.1 5.17-4.47 6.76v5.62h7.23c4.23-3.9 6.67-9.64 6.67-16.67z"/>
      <path fill="#34A853" d="M24 46c6.08 0 11.18-2.02 14.9-5.48l-7.23-5.62c-2.02 1.35-4.6 2.15-7.67 2.15-5.9 0-10.89-3.98-12.68-9.33H3.88v5.8C7.59 41.04 15.26 46 24 46z"/>
      <path fill="#FBBC05" d="M11.32 27.72A13.97 13.97 0 0 1 10.8 24c0-1.29.22-2.53.52-3.72v-5.8H3.88A21.98 21.98 0 0 0 2 24c0 3.54.85 6.9 2.3 9.87l5.94-4.59 1.08-1.56z"/>
      <path fill="#EA4335" d="M24 10.95c3.32 0 6.3 1.14 8.65 3.38l6.48-6.48C35.17 4.15 30.07 2 24 2 15.26 2 7.59 6.96 3.88 14.28l7.44 5.8C13.11 14.93 18.1 10.95 24 10.95z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 814 1000" aria-hidden="true">
      <path fill="currentColor" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 380.8 43.2 370.2 43.2 350c0-203.4 136.6-311.1 274.4-311.1 69.1 0 126.4 45.7 170.1 45.7 42.1 0 108.2-48.3 185.3-48.3zM611.4 40.1c33.1-38.3 57.3-91.3 57.3-144.3 0-7.4-.6-14.8-1.9-21.5-54.5 2.1-119.1 36.6-158.1 79.7-30.7 34.4-60.2 87.5-60.2 141.4 0 8 1.3 16 1.9 18.5 3.2.6 8.4 1.3 13.6 1.3 49 0 109.4-32.5 147.4-75.1z"/>
    </svg>
  );
}

function OutlookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#0078d4" d="M24 7.387v10.478L19.2 21V10.2L24 7.387zM0 8.046V20.77l10.8 1.8V5.4L0 8.046zm11.96-2.646v18l7.04-2.01V7.4l-7.04-1.999z"/>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default async function EventLandingPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Fetch the published event page
  let supabase;
  try {
    supabase = createAnonClient();
  } catch {
    // Env vars missing — surface gracefully in dev, fail silently in prod (notFound)
    notFound();
  }

  const { data: page, error } = await supabase
    .from('event_pages')
    .select('id, slug, title, description, location, timezone, feed_token, is_published, start_at, end_at, is_all_day')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !page) {
    notFound();
  }

  const eventPage = page as EventPageRow;
  const tz = eventPage.timezone || 'UTC';

  // Build EventData for the calendar generator
  let calendarLinks: ReturnType<typeof generateCalendarLinks> | null = null;

  if (eventPage.start_at) {
    const start = timestampToEventFields(eventPage.start_at, tz);
    const end = eventPage.end_at ? timestampToEventFields(eventPage.end_at, tz) : null;

    const eventData: EventData = {
      title: eventPage.title,
      description: eventPage.description ?? undefined,
      location: eventPage.location ?? undefined,
      startDate: start.date,
      startTime: eventPage.is_all_day ? undefined : start.time,
      endDate: end?.date ?? start.date,
      endTime: eventPage.is_all_day ? undefined : (end?.time ?? start.time),
      timezone: tz,
      isAllDay: eventPage.is_all_day,
    };

    calendarLinks = generateCalendarLinks(eventData);
  }

  const formattedDate = formatEventDate(eventPage.start_at, eventPage.end_at, eventPage.is_all_day, tz);
  const timezoneLabel = eventPage.is_all_day ? null : formatTimezone(tz);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://punktual.co';
  const webcalUrl = `webcal://${baseUrl.replace(/^https?:\/\//, '')}/api/feed/${eventPage.feed_token}`;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ------------------------------------------------------------------ */}
      {/* Hero section                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-6">
            {eventPage.title}
          </h1>

          {/* Date / time */}
          {formattedDate ? (
            <div className="flex items-start gap-3 mb-4">
              <span className="text-emerald-500 mt-0.5 flex-shrink-0" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              <div>
                <p className="text-gray-800 font-semibold text-lg leading-snug">{formattedDate}</p>
                {timezoneLabel && (
                  <p className="text-gray-500 text-sm mt-0.5">{timezoneLabel}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-emerald-500 flex-shrink-0" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              <p className="text-gray-500 text-base">Date to be announced</p>
            </div>
          )}

          {/* Location */}
          {eventPage.location && (
            <div className="flex items-start gap-3 mb-4">
              <span className="text-emerald-500 mt-0.5 flex-shrink-0" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <p className="text-gray-800 font-medium text-base leading-snug">{eventPage.location}</p>
            </div>
          )}

          {/* Description */}
          {eventPage.description && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                {eventPage.description}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Calendar-add section                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Add this event to your calendar</h2>
            <p className="text-gray-500 text-sm mt-1">
              Choose your calendar app to save a copy of this event.
            </p>
          </div>

          <div className="p-6">
            {calendarLinks ? (
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Google Calendar */}
                {calendarLinks.google && (
                  <a
                    href={calendarLinks.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium text-gray-800 text-sm shadow-sm"
                  >
                    <GoogleIcon />
                    Google Calendar
                  </a>
                )}

                {/* Apple Calendar */}
                {calendarLinks.apple && (
                  <a
                    href={calendarLinks.apple}
                    download={`${eventPage.slug}.ics`}
                    className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium text-gray-800 text-sm shadow-sm"
                  >
                    <span className="text-gray-800">
                      <AppleIcon />
                    </span>
                    Apple Calendar
                  </a>
                )}

                {/* Outlook */}
                {calendarLinks.outlook && (
                  <a
                    href={calendarLinks.outlook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium text-gray-800 text-sm shadow-sm"
                  >
                    <OutlookIcon />
                    Outlook
                  </a>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">
                Calendar links will appear once the organizer sets the event date and time.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Subscribe section — the Punktual differentiator                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-emerald-100">
            <h2 className="text-xl font-bold text-gray-900">
              Never miss an update
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Subscribe once and your calendar updates automatically whenever details change.
            </p>
          </div>

          <div className="p-6">
            <a
              href={webcalUrl}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors shadow-sm w-full sm:w-auto"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Subscribe — get every update automatically in your calendar
            </a>

            <p className="text-gray-500 text-xs mt-3">
              Your calendar app will ask you to confirm the subscription — that&apos;s it. No account needed.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Scope line: RSVP / ticketing                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <p className="text-gray-400 text-sm text-center">
          RSVP is free. Paid ticketing is coming soon.
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                                */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-emerald-500 transition-colors text-sm"
          >
            Powered by Punktual
          </Link>
        </div>
      </footer>
    </main>
  );
}
