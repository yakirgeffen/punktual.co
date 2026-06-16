/**
 * Public event landing page — /e/[slug]
 *
 * Server component. No auth required. Fetches the published event_pages row
 * by slug via the anon client (public-read RLS policy covers this).
 *
 * Renders:
 *   - Optional cover/hero image
 *   - Host name + logo (if set)
 *   - Title, tagline, formatted date/time, location, description
 *   - Calendar-add buttons (Google / Apple / Outlook) via existing generator
 *   - Webcal subscribe link (the Punktual differentiator)
 *   - "Powered by Punktual" footer
 *
 * All visual properties (accent color, background theme, font) come from the
 * event_pages row. Zero-configuration defaults to Punktual's emerald brand + Nunito.
 *
 * Font scope: the organizer's font_choice applies ONLY to the event title (h1),
 * tagline, and the two section headings. Everything else stays in Nunito (the
 * app's global default) — date, timezone, location, meta text, buttons, CTA,
 * sub-copy, host name, footer.
 *
 * OG metadata: reads og_image_url (manual override) or falls back to the
 * dynamic /api/og/event route which generates a branded card.
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
// Supabase anon client (public reads only)
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
  // customization
  accent_color: string | null;
  bg_theme: string | null;
  font_choice: string | null;
  cover_image_url: string | null;
  host_name: string | null;
  host_logo_url: string | null;
  tagline: string | null;
  cta_label: string | null;
  cta_color: string | null;
  og_image_url: string | null;
}

// ---------------------------------------------------------------------------
// Theme configuration
// ---------------------------------------------------------------------------

type BgTheme = 'white' | 'stone' | 'dark' | 'gradient';
type FontChoice = 'nunito' | 'inter' | 'lora';

interface ThemeTokens {
  mainBg: string;
  cardBg: string;
  heroSectionClass: string;
  titleColor: string;
  metaColor: string;
  bodyColor: string;
  borderColor: string;
  cardBorderColor: string;
  isDark: boolean;
}

function getThemeTokens(theme: BgTheme, accentColor: string): ThemeTokens {
  switch (theme) {
    case 'dark':
      return {
        mainBg: '#0f172a',
        cardBg: '#1e293b',
        heroSectionClass: '',
        titleColor: '#f8fafc',
        metaColor: '#94a3b8',
        bodyColor: '#cbd5e1',
        borderColor: '#1e293b',
        cardBorderColor: '#334155',
        isDark: true,
      };
    case 'stone':
      return {
        mainBg: '#faf7f4',
        cardBg: '#ffffff',
        heroSectionClass: '',
        titleColor: '#1c1917',
        metaColor: '#78716c',
        bodyColor: '#57534e',
        borderColor: '#e7e5e4',
        cardBorderColor: '#e7e5e4',
        isDark: false,
      };
    case 'gradient': {
      const accent6 = accentColor.replace('#', '').slice(0, 6);
      return {
        mainBg: `linear-gradient(135deg, #${accent6}12 0%, #ffffff 60%)`,
        cardBg: '#ffffff',
        heroSectionClass: '',
        titleColor: '#111827',
        metaColor: '#6b7280',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        cardBorderColor: '#e5e7eb',
        isDark: false,
      };
    }
    case 'white':
    default:
      return {
        mainBg: '#f9fafb',
        cardBg: '#ffffff',
        heroSectionClass: '',
        titleColor: '#111827',
        metaColor: '#6b7280',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        cardBorderColor: '#e5e7eb',
        isDark: false,
      };
  }
}

function getFontFamily(font: FontChoice): string {
  switch (font) {
    case 'inter': return '"Inter", system-ui, -apple-system, sans-serif';
    case 'lora': return '"Lora", Georgia, "Times New Roman", serif';
    case 'nunito':
    default: return '"Nunito", "Varela Round", sans-serif';
  }
}

// ---------------------------------------------------------------------------
// Metadata (including OG)
// ---------------------------------------------------------------------------

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://punktual.co';

  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('event_pages')
      .select('title, description, tagline, host_name, accent_color, bg_theme, og_image_url')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (!data) return { title: 'Event | Punktual' };

    const title = data.title as string;
    const description = (data.description ?? data.tagline ?? 'View and add this event to your calendar.') as string;

    // Build OG image URL
    const ogImageUrl = (data.og_image_url as string | null) ?? (() => {
      const params = new URLSearchParams({
        title,
        ...(data.tagline ? { tagline: data.tagline as string } : {}),
        ...(data.host_name ? { host: data.host_name as string } : {}),
        ...(data.accent_color ? { accent: (data.accent_color as string).replace('#', '') } : {}),
        ...(data.bg_theme ? { theme: data.bg_theme as string } : {}),
      });
      return `${baseUrl}/api/og/event?${params.toString()}`;
    })();

    return {
      title: `${title} | Punktual`,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: ogImageUrl, width: 1200, height: 630 }],
        type: 'website',
        url: `${baseUrl}/e/${slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
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

function timestampToEventFields(
  isoString: string,
  timezone: string
): { date: string; time: string } {
  const d = new Date(isoString);
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

  const dateParts = fmt.formatToParts(d);
  const year = dateParts.find(p => p.type === 'year')?.value ?? '';
  const month = dateParts.find(p => p.type === 'month')?.value ?? '';
  const day = dateParts.find(p => p.type === 'day')?.value ?? '';
  const date = `${year}-${month}-${day}`;

  const timeParts = timeFmt.formatToParts(d);
  const hour = timeParts.find(p => p.type === 'hour')?.value?.padStart(2, '0') ?? '00';
  const minute = timeParts.find(p => p.type === 'minute')?.value?.padStart(2, '0') ?? '00';
  const safeHour = hour === '24' ? '00' : hour;
  const time = `${safeHour}:${minute}`;

  return { date, time };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default async function EventLandingPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let supabase;
  try {
    supabase = createAnonClient();
  } catch {
    notFound();
  }

  const { data: page, error } = await supabase
    .from('event_pages')
    .select([
      'id', 'slug', 'title', 'description', 'location', 'timezone',
      'feed_token', 'is_published', 'start_at', 'end_at', 'is_all_day',
      'accent_color', 'bg_theme', 'font_choice', 'cover_image_url',
      'host_name', 'host_logo_url', 'tagline', 'cta_label', 'cta_color', 'og_image_url',
    ].join(', '))
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !page) {
    notFound();
  }

  const eventPage = page as EventPageRow;
  const tz = eventPage.timezone || 'UTC';

  // Apply customization — with fallbacks to defaults
  const accentColor = eventPage.accent_color ?? '#10b981';
  const bgTheme = (eventPage.bg_theme as BgTheme) ?? 'white';
  const fontChoice = (eventPage.font_choice as FontChoice) ?? 'nunito';
  // Font applies only to display headings; all other text stays in Nunito
  const displayFontFamily = getFontFamily(fontChoice);
  const ctaLabel = eventPage.cta_label ?? 'Subscribe to this event';
  const ctaColor = eventPage.cta_color ?? accentColor;

  const tokens = getThemeTokens(bgTheme, accentColor);

  // Build calendar links
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

  // Load only the chosen font (needed for the display headings).
  // Nunito for body is already loaded by the root layout.
  const fontUrl = fontChoice === 'inter'
    ? 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
    : fontChoice === 'lora'
    ? 'https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap'
    : 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap';

  // Inline style for gradient backgrounds (can't be expressed as a Tailwind class)
  const mainBgStyle: React.CSSProperties = bgTheme === 'gradient'
    ? { background: tokens.mainBg }
    : bgTheme === 'dark'
    ? { backgroundColor: tokens.mainBg }
    : bgTheme === 'stone'
    ? { backgroundColor: tokens.mainBg }
    : {};

  return (
    <>
      {/* Load selected Google Font */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontUrl} />

      {/* No fontFamily on <main> — global Nunito handles body text by default */}
      <main
        className={`min-h-screen ${bgTheme === 'white' ? 'bg-gray-50' : ''}`}
        style={mainBgStyle}
      >
        {/* Cover image — full width, renders ABOVE the hero section */}
        {eventPage.cover_image_url && (
          <div className="w-full overflow-hidden" style={{ maxHeight: 360 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={eventPage.cover_image_url}
              alt=""
              className="w-full object-cover"
              style={{ maxHeight: 360 }}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Hero section                                                         */}
        {/* ------------------------------------------------------------------ */}
        <section
          style={{
            borderBottom: `1px solid ${tokens.borderColor}`,
            backgroundColor: tokens.cardBg,
          }}
        >
          <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16">

            {/* Host row — always Nunito */}
            {eventPage.host_name && (
              <div className="flex items-center gap-2.5 mb-5">
                {eventPage.host_logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={eventPage.host_logo_url}
                    alt={eventPage.host_name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium" style={{ color: tokens.metaColor }}>
                  Hosted by {eventPage.host_name}
                </span>
              </div>
            )}

            {/* Title — display font applies here */}
            <h1
              className="text-3xl sm:text-4xl font-bold leading-tight mb-3"
              style={{ color: tokens.titleColor, fontFamily: displayFontFamily }}
            >
              {eventPage.title}
            </h1>

            {/* Tagline — display font applies here */}
            {eventPage.tagline && (
              <p
                className="text-lg mb-5"
                style={{ color: tokens.metaColor, fontFamily: displayFontFamily }}
              >
                {eventPage.tagline}
              </p>
            )}

            {/* Date / time — always Nunito */}
            {formattedDate ? (
              <div className="flex items-start gap-3 mb-4">
                <span className="mt-0.5 flex-shrink-0" style={{ color: accentColor }} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-lg leading-snug" style={{ color: tokens.titleColor }}>
                    {formattedDate}
                  </p>
                  {timezoneLabel && (
                    <p className="text-sm mt-0.5" style={{ color: tokens.metaColor }}>{timezoneLabel}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-shrink-0" style={{ color: accentColor }} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <p className="text-base" style={{ color: tokens.metaColor }}>Date coming soon</p>
              </div>
            )}

            {/* Location — always Nunito */}
            {eventPage.location && (
              <div className="flex items-start gap-3 mb-4">
                <span className="mt-0.5 flex-shrink-0" style={{ color: accentColor }} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <p className="font-medium text-base leading-snug" style={{ color: tokens.titleColor }}>
                  {eventPage.location}
                </p>
              </div>
            )}

            {/* Description */}
            {eventPage.description && (
              <div
                className="mt-6 pt-6"
                style={{ borderTop: `1px solid ${tokens.borderColor}` }}
              >
                <p
                  className="text-base leading-relaxed whitespace-pre-wrap"
                  style={{ color: tokens.bodyColor }}
                >
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
          <div
            className="rounded-xl overflow-hidden shadow-sm"
            style={{
              backgroundColor: tokens.cardBg,
              border: `1px solid ${tokens.cardBorderColor}`,
            }}
          >
            <div
              className="px-6 py-5"
              style={{ borderBottom: `1px solid ${tokens.cardBorderColor}` }}
            >
              {/* Section heading — display font applies here */}
              <h2 className="text-xl font-bold" style={{ color: tokens.titleColor, fontFamily: displayFontFamily }}>
                Add this event to your calendar
              </h2>
              <p className="text-sm mt-1" style={{ color: tokens.metaColor }}>
                Pick your calendar and it&apos;s in there.
              </p>
            </div>

            <div className="p-6">
              {calendarLinks ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  {calendarLinks.google && (
                    <a
                      href={calendarLinks.google}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg font-medium text-sm transition-colors shadow-sm"
                      style={{
                        backgroundColor: tokens.cardBg,
                        color: tokens.titleColor,
                        border: `1px solid ${tokens.cardBorderColor}`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/platforms/icon-google.svg" alt="" width={20} height={20} aria-hidden="true" />
                      Google Calendar
                    </a>
                  )}

                  {calendarLinks.apple && (
                    <a
                      href={calendarLinks.apple}
                      download={`${eventPage.slug}.ics`}
                      className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg font-medium text-sm transition-colors shadow-sm"
                      style={{
                        backgroundColor: tokens.cardBg,
                        color: tokens.titleColor,
                        border: `1px solid ${tokens.cardBorderColor}`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/platforms/icon-apple.svg" alt="" width={20} height={20} aria-hidden="true" />
                      Apple Calendar
                    </a>
                  )}

                  {calendarLinks.outlook && (
                    <a
                      href={calendarLinks.outlook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg font-medium text-sm transition-colors shadow-sm"
                      style={{
                        backgroundColor: tokens.cardBg,
                        color: tokens.titleColor,
                        border: `1px solid ${tokens.cardBorderColor}`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/platforms/icon-outlook.svg" alt="" width={20} height={20} aria-hidden="true" />
                      Outlook
                    </a>
                  )}
                </div>
              ) : (
                /* No date set — show grayed-out placeholder buttons so layout doesn't collapse */
                <div>
                  <div className="flex flex-col sm:flex-row gap-3" aria-hidden="true">
                    {[
                      { src: '/icons/platforms/icon-google.svg', label: 'Google Calendar' },
                      { src: '/icons/platforms/icon-apple.svg', label: 'Apple Calendar' },
                      { src: '/icons/platforms/icon-outlook.svg', label: 'Outlook' },
                    ].map(({ src, label }) => (
                      <div
                        key={label}
                        className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg font-medium text-sm shadow-sm cursor-not-allowed select-none"
                        style={{
                          backgroundColor: tokens.isDark ? '#1e293b' : '#f9fafb',
                          color: tokens.isDark ? '#475569' : '#9ca3af',
                          border: `1px solid ${tokens.isDark ? '#334155' : '#e5e7eb'}`,
                          opacity: 0.6,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" width={20} height={20} aria-hidden="true" />
                        {label}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm mt-4" style={{ color: tokens.metaColor }}>
                    Calendar links show up once the organizer adds a date.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Subscribe section — the Punktual differentiator                      */}
        {/* ------------------------------------------------------------------ */}
        <section className="max-w-2xl mx-auto px-6 pb-10">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: tokens.isDark ? `${accentColor}22` : `${accentColor}14`,
              border: `1px solid ${accentColor}40`,
            }}
          >
            <div
              className="px-6 py-5"
              style={{ borderBottom: `1px solid ${accentColor}30` }}
            >
              {/* Section heading — display font applies here */}
              <h2 className="text-xl font-bold" style={{ color: tokens.titleColor, fontFamily: displayFontFamily }}>
                Stay in the loop automatically
              </h2>
              <p className="text-sm mt-1" style={{ color: tokens.metaColor }}>
                Subscribe once and your calendar updates automatically whenever details change.
              </p>
            </div>

            <div className="p-6">
              <a
                href={webcalUrl}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg font-semibold text-sm transition-colors shadow-sm w-full sm:w-auto"
                style={{
                  backgroundColor: ctaColor,
                  color: '#ffffff',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {ctaLabel}
              </a>

              <p className="text-xs mt-3" style={{ color: tokens.metaColor }}>
                Your calendar app will ask you to confirm. No account needed.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Scope line                                                            */}
        {/* ------------------------------------------------------------------ */}
        <section className="max-w-2xl mx-auto px-6 pb-10">
          <p className="text-sm text-center" style={{ color: tokens.metaColor }}>
            Free to use. Paid ticketing coming soon.
          </p>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Footer — always Nunito, no fontFamily override                        */}
        {/* ------------------------------------------------------------------ */}
        <footer
          className="py-6"
          style={{
            borderTop: `1px solid ${tokens.borderColor}`,
            backgroundColor: tokens.cardBg,
          }}
        >
          <div className="max-w-2xl mx-auto px-6 text-center">
            <Link
              href="/"
              className="text-sm transition-colors"
              style={{ color: tokens.metaColor }}
            >
              Powered by Punktual
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
