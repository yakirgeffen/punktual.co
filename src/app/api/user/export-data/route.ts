import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, requireAuth } from '@/lib/supabase/server';
import { logAuditEvent, getClientIp, getUserAgent } from '@/lib/audit';

/**
 * GDPR Data Export Endpoint
 *
 * Allows authenticated users to export all their personal data
 * Includes:
 * - User profile information
 * - All events they created
 * - All short links and metadata
 * - Creation/modification timestamps
 *
 * Returns JSON format compatible with data portability requirements
 * Rate limited to 1 request per hour per user
 */

// Simple in-memory rate limit for export (could be moved to Redis)
const exportRateLimit = new Map<string, number>();

function checkExportRateLimit(userId: string): boolean {
  const lastExport = exportRateLimit.get(userId);
  const now = Date.now();

  if (lastExport && now - lastExport < 3600000) { // 1 hour
    return false;
  }

  exportRateLimit.set(userId, now);
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request);

    // Check rate limit (1 export per hour)
    if (!checkExportRateLimit(user.id)) {
      console.warn(`[GDPR] Rate limit exceeded for user ${user.id}`);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'You can export your data once per hour. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Create service role client
    const supabase = createServiceRoleClient();

    console.log(`[GDPR] Starting data export for user ${user.id}`);

    // Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch all events
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id);

    // Fetch all short links
    const { data: shortLinks } = await supabase
      .from('short_links')
      .select('*')
      .eq('user_id', user.id);

    // Compile exported data
    const exportData = {
      export_metadata: {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        data_version: '1.0',
        format: 'GDPR Compliant',
      },
      user_profile: profile || {},
      events: events || [],
      short_links: shortLinks || [],
      summary: {
        total_events: events?.length || 0,
        total_short_links: shortLinks?.length || 0,
        account_created: profile?.created_at || null,
      },
    };

    // Log audit event
    await logAuditEvent({
      type: 'DATA_EXPORT',
      userId: user.id,
      action: 'EXPORT_PERSONAL_DATA',
      resource: 'all',
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      success: true,
      metadata: {
        reason: 'GDPR right to portability',
        events_exported: events?.length || 0,
        short_links_exported: shortLinks?.length || 0,
        exported_at: new Date().toISOString(),
      },
    });

    console.log(`[GDPR] Data export completed for user ${user.id}`);

    // Return as JSON file download
    return NextResponse.json(exportData, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="punktual-data-export-${user.id}.json"`,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('[GDPR] Error exporting user data:', error);

    // Log failed export attempt
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to export data. Please try again or contact support.',
      },
      { status: 500 }
    );
  }
}
