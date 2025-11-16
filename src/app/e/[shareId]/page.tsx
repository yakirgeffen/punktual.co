/**
 * Event Landing Page - /e/[shareId]
 * Public page for sharing calendar events
 * Supports direct calendar redirect via ?cal=platform query param
 */

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import EventLandingClient from '@/components/EventLanding/EventLandingClient';
import { generateCalendarLinks } from '@/utils/calendarGenerator';
import type { EventData } from '@/types';

interface PageProps {
  params: Promise<{ shareId: string }>;
  searchParams: Promise<{ cal?: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params;
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: event } = await supabase
    .from('events')
    .select('title, description, start_date')
    .eq('share_id', shareId)
    .single();

  if (!event) {
    return {
      title: 'Event Not Found - Punktual',
      description: 'The event you are looking for could not be found.'
    };
  }

  const eventDate = event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : '';

  return {
    title: `${event.title} - Add to Calendar | Punktual`,
    description: event.description || `Add "${event.title}" to your calendar. Event on ${eventDate}.`,
    openGraph: {
      title: event.title,
      description: event.description || `Add this event to your calendar`,
      type: 'website',
    },
  };
}

export default async function EventLandingPage({ params, searchParams }: PageProps) {
  const { shareId } = await params;
  const { cal } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Fetch event from database using share_id
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('share_id', shareId)
    .single();

  if (error || !event) {
    notFound();
  }

  // Convert database event to EventData format
  const eventData: EventData = {
    title: event.title,
    description: event.description || '',
    location: event.location || '',
    organizer: event.organizer || '',
    startDate: event.start_date,
    startTime: event.start_time || '10:00',
    endDate: event.end_date || event.start_date,
    endTime: event.end_time || '11:00',
    timezone: event.timezone || 'UTC',
    isAllDay: event.is_all_day || false,
  };

  // Generate calendar links
  const calendarLinks = generateCalendarLinks(eventData);

  // If ?cal=platform is present, redirect directly to that calendar
  if (cal && calendarLinks[cal as keyof typeof calendarLinks]) {
    const targetUrl = calendarLinks[cal as keyof typeof calendarLinks];
    if (targetUrl) {
      // Track the click with rate limiting (server-side)
      const headers_list = await headers();
      const forwardedFor = headers_list.get('x-forwarded-for');
      const realIp = headers_list.get('x-real-ip');
      const ipAddress = forwardedFor?.split(',')[0] || realIp || '0.0.0.0';
      const userAgent = headers_list.get('user-agent') || '';
      const referrer = headers_list.get('referer') || '';

      // Check rate limit
      const { data: shouldTrack } = await supabase.rpc('check_recent_click', {
        p_event_id: event.id,
        p_ip_address: ipAddress,
        p_window_seconds: 60
      });

      // Only track if not rate limited
      if (!shouldTrack) {
        await supabase
          .from('event_clicks')
          .insert({
            event_id: event.id,
            platform: cal,
            ip_address: ipAddress,
            user_agent: userAgent,
            referrer: referrer,
            clicked_at: new Date().toISOString()
          });
      }

      // Redirect regardless of tracking success
      redirect(targetUrl);
    }
  }

  // Fetch user profile to check if it's a free or paid user
  let isFreeTier = true;
  if (event.user_id) {
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('user_id', event.user_id)
      .single();

    isFreeTier = !userProfile || userProfile.plan === 'free';
  }

  // Render landing page with event details and buttons
  return (
    <EventLandingClient
      eventData={eventData}
      calendarLinks={calendarLinks}
      shareId={shareId}
      showPoweredBy={true} // Always show on landing pages (we host it)
      showUpsell={isFreeTier} // Show "Create your own" CTA for free tier events
    />
  );
}
