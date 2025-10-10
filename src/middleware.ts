import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simple in-memory rate limiter for API routes
 *
 * NOTE: For production with multiple server instances, use Redis-based rate limiting
 * with Upstash or similar service to share rate limit state across instances.
 *
 * Current implementation:
 * - 60 requests per minute per IP address for API routes
 * - Cleans up old entries every 5 minutes to prevent memory leaks
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limit tracking
const rateLimitMap = new Map<string, RateLimitRecord>();

// Configuration
const WINDOW_MS = 60000; // 1 minute window
const MAX_REQUESTS = 60; // 60 requests per window
const CLEANUP_INTERVAL = 300000; // Clean up every 5 minutes

// Periodic cleanup to prevent memory leaks
let lastCleanup = Date.now();

function cleanupOldEntries() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, record] of rateLimitMap.entries()) {
      if (record.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
    lastCleanup = now;
  }
}

/**
 * Rate limiting middleware
 *
 * Protects API routes from abuse by limiting requests per IP address
 */
export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get client IP address
    const ip =
      request.ip ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const now = Date.now();
    const identifier = `api:${ip}`;

    // Periodic cleanup
    cleanupOldEntries();

    // Get or create rate limit record
    const record = rateLimitMap.get(identifier);

    if (record && record.resetTime > now) {
      // Window is still active
      if (record.count >= MAX_REQUESTS) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);

        return NextResponse.json(
          {
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': MAX_REQUESTS.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
            },
          }
        );
      }

      // Increment counter
      record.count++;

      // Add rate limit headers to response
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
      response.headers.set('X-RateLimit-Remaining', (MAX_REQUESTS - record.count).toString());
      response.headers.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

      return response;
    } else {
      // Create new window or reset expired window
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + WINDOW_MS,
      });

      // Add rate limit headers
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
      response.headers.set('X-RateLimit-Remaining', (MAX_REQUESTS - 1).toString());
      response.headers.set('X-RateLimit-Reset', new Date(now + WINDOW_MS).toISOString());

      return response;
    }
  }

  // Non-API routes pass through without rate limiting
  return NextResponse.next();
}

/**
 * Configure which routes this middleware runs on
 *
 * Currently applies to all API routes
 */
export const config = {
  matcher: '/api/:path*',
};