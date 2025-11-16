/**
 * Click Tracking API Route
 * Tracks calendar button clicks with rate limiting
 * POST /api/track-click
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

// Rate limiting constants
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, platform } = body;

    // Validation
    if (!eventId || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, platform' },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms = ['google', 'apple', 'outlook', 'office365', 'outlookcom', 'yahoo'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    // Get client IP address
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || '0.0.0.0';

    // Get user agent and referrer for analytics
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || '';

    // Create service role client (bypasses RLS for rate limit check)
    const supabase = createServiceRoleClient();

    // Rate limiting: Check if this IP clicked this event recently
    const { data: recentClickCheck } = await supabase.rpc('check_recent_click', {
      p_event_id: eventId,
      p_ip_address: ipAddress,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS
    });

    if (recentClickCheck === true) {
      // Duplicate click detected - return success without tracking
      return NextResponse.json(
        {
          success: true,
          tracked: false,
          message: 'Duplicate click detected (rate limited)'
        },
        { status: 200 }
      );
    }

    // Track the click
    const { error: insertError } = await supabase
      .from('event_clicks')
      .insert({
        event_id: eventId,
        platform,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        clicked_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error tracking click:', insertError);
      return NextResponse.json(
        { error: 'Failed to track click', details: insertError.message },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json(
      {
        success: true,
        tracked: true,
        message: 'Click tracked successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Disable OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 405 });
}
