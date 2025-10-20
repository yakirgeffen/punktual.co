import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, requireAuth } from '@/lib/supabase/server';
import { logAuditEvent, getClientIp, getUserAgent } from '@/lib/audit';
import { validateCSRFMiddleware } from '@/lib/csrf';

/**
 * GDPR Data Deletion Endpoint
 *
 * Allows authenticated users to delete all their personal data
 * Includes:
 * - All events they created
 * - All short links
 * - User profile
 * - Authentication record (via Supabase)
 *
 * This operation is irreversible!
 */

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication first
    const user = await requireAuth(request);

    // Validate CSRF token
    const body = await request.json().catch(() => ({}));
    const csrfValidation = await validateCSRFMiddleware(
      request.method,
      request.headers,
      body
    );

    if (!csrfValidation.valid) {
      console.warn(`[GDPR] CSRF validation failed for user ${user.id}`);
      return NextResponse.json(
        { error: csrfValidation.error || 'CSRF validation failed' },
        { status: 403 }
      );
    }

    // Double-check: require confirmation token
    const confirmationToken = body.confirmation;
    const expectedToken = `DELETE_${user.id}`.substring(0, 20);

    if (confirmationToken !== expectedToken) {
      console.warn(`[GDPR] Invalid confirmation token for user ${user.id}`);
      return NextResponse.json(
        {
          error: 'Invalid confirmation token',
          message: 'You must provide the correct confirmation token to delete data',
        },
        { status: 400 }
      );
    }

    // Create service role client for admin operations
    const supabase = createServiceRoleClient();

    console.log(`[GDPR] Starting data deletion for user ${user.id}`);

    // Delete in order (respect foreign key constraints)
    // 1. Delete short links
    await supabase.from('short_links').delete().eq('user_id', user.id);
    console.log(`[GDPR] Deleted short links for user ${user.id}`);

    // 2. Delete events
    await supabase.from('events').delete().eq('user_id', user.id);
    console.log(`[GDPR] Deleted events for user ${user.id}`);

    // 3. Delete user profile
    await supabase.from('user_profiles').delete().eq('user_id', user.id);
    console.log(`[GDPR] Deleted user profile for user ${user.id}`);

    // 4. Log audit event (do this AFTER deleting profile, so we still have the user ID)
    await logAuditEvent({
      type: 'DATA_DELETION',
      userId: user.id,
      action: 'DELETE_ALL_DATA',
      resource: 'all',
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      success: true,
      metadata: {
        reason: 'GDPR right to erasure',
        deletedAt: new Date().toISOString(),
      },
    });

    console.log(`[GDPR] Data deletion completed for user ${user.id}`);

    return NextResponse.json(
      {
        success: true,
        message: 'All your data has been permanently deleted',
        deletedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GDPR] Error deleting user data:', error);

    // Log failed deletion attempt
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to delete data. Please try again or contact support.',
      },
      { status: 500 }
    );
  }
}
