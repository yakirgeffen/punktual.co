import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, requireAuth } from '@/lib/supabase/server';
import type { CreateShortLinkRequest, CreateShortLinkResponse } from '@/types';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { logAuditEvent, getClientIp, getUserAgent } from '@/lib/audit';

/**
 * Input validation schema for short link creation
 *
 * Enforces:
 * - originalUrl must be a valid URL (max 2048 chars)
 * - eventTitle is optional (max 255 chars)
 * - userId must be a valid UUID if provided
 */
const CreateShortLinkSchema = z.object({
  originalUrl: z
    .string()
    .url({ message: 'Original URL must be a valid URL' })
    .max(2048, { message: 'URL cannot exceed 2048 characters' }),
  eventTitle: z
    .string()
    .max(255, { message: 'Event title cannot exceed 255 characters' })
    .optional(),
  userId: z
    .string()
    .uuid({ message: 'User ID must be a valid UUID' })
    .optional(),
});

/**
 * Generates a cryptographically secure random short ID
 *
 * Uses Node.js crypto module instead of Math.random() for:
 * - Cryptographic security (unpredictable)
 * - Better collision resistance
 * - URL-safe base64 encoding
 *
 * @returns 8-character alphanumeric short ID
 */
function generateShortId(): string {
  // Generate 6 random bytes and convert to base64url (URL-safe)
  // base64url gives us ~1.33x output length, so 6 bytes → 8 chars
  return randomBytes(6)
    .toString('base64url')
    .slice(0, 8)
    .toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request);

    // Parse and validate request body
    const body: CreateShortLinkRequest = await request.json();

    // Validate input with Zod schema
    const validationResult = CreateShortLinkSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { originalUrl, eventTitle, userId } = validationResult.data;

    // Verify the userId matches the authenticated user
    if (userId && userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: User ID mismatch' },
        { status: 403 }
      );
    }

    // Create service role client for this operation
    // (needed to bypass RLS for short_links table operations)
    const supabase = createServiceRoleClient();

    // Generate unique short ID
    let shortId: string = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      shortId = generateShortId();
      const { data: existing } = await supabase
        .from('short_links')
        .select('short_id')
        .eq('short_id', shortId)
        .single();

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique ID' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('short_links')
      .insert({
        short_id: shortId,
        original_url: originalUrl,
        event_title: eventTitle,
        user_id: userId || user.id // Use authenticated user ID
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);

      // Log failed short link creation
      await logAuditEvent({
        type: 'SHORT_LINK_CREATE',
        userId: user.id,
        action: 'CREATE_SHORT_LINK',
        resource: shortId,
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
        success: false,
        errorMessage: error.message,
      });

      return NextResponse.json(
        { error: 'Failed to create short link' },
        { status: 500 }
      );
    }

    // Log successful short link creation
    await logAuditEvent({
      type: 'SHORT_LINK_CREATE',
      userId: user.id,
      action: 'CREATE_SHORT_LINK',
      resource: data.short_id,
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      success: true,
      metadata: {
        eventTitle: eventTitle || 'Untitled',
        originalUrl: originalUrl.substring(0, 100), // Truncate for logging
      },
    });

    const shortUrl = `https://punktual.co/eventid=${data.short_id}`;

    const response: CreateShortLinkResponse = {
      success: true,
      shortUrl,
      shortId: data.short_id
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Server error:', error);

    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}