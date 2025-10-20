import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Production-ready rate limiting using Upstash Redis
 *
 * This middleware protects API routes from abuse by limiting requests.
 * Works across multiple server instances via distributed Redis.
 *
 * Configuration:
 * - 60 requests per minute per IP address
 * - 100 requests per minute per authenticated user
 * - Sliding window algorithm for better fairness
 *
 * Setup:
 * 1. Create free Upstash account at https://upstash.com
 * 2. Create Redis database
 * 3. Add these env vars to Vercel:
 *    - UPSTASH_REDIS_REST_URL
 *    - UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
// Falls back to environment variable-based initialization for Vercel
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limiters for different endpoints
const ipRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'ratelimit:ip',
  analytics: true,
  timeout: 1000, // 1 second timeout for Redis calls
});

const userRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'ratelimit:user',
  analytics: true,
  timeout: 1000,
});

/**
 * Extract user ID from JWT token if present
 * Returns null if not authenticated
 */
function extractUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.substring(7);
    // JWT format: header.payload.signature
    // Payload is base64-encoded JSON
    const payload = token.split('.')[1];
    if (!payload) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    return decoded.sub || null; // 'sub' is standard JWT subject claim
  } catch (error) {
    console.error('[RATE_LIMIT] Error parsing JWT:', error);
    return null;
  }
}

/**
 * Get client IP from request headers
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
function getClientIp(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-client-ip') ||
    'unknown';

  return ip;
}

/**
 * Rate limiting middleware for API routes
 *
 * - IP-based rate limiting: 60 requests/min
 * - User-based rate limiting: 100 requests/min (if authenticated)
 * - Allows higher limits for authenticated requests
 */
export async function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip rate limiting in development if env vars not set
  if (!process.env.UPSTASH_REDIS_REST_URL && process.env.NODE_ENV !== 'production') {
    console.warn('[RATE_LIMIT] Upstash not configured, skipping rate limiting');
    return NextResponse.next();
  }

  try {
    const ip = getClientIp(request);
    const authHeader = request.headers.get('authorization');
    const userId = extractUserIdFromToken(authHeader);

    // If user is authenticated, use user-based limiter (higher limit)
    if (userId) {
      const result = await userRateLimiter.limit(userId);

      if (!result.success) {
        console.warn(`[RATE_LIMIT] User ${userId} rate limited (IP: ${ip})`);

        return NextResponse.json(
          {
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
          },
          {
            status: 429,
            headers: {
              'Retry-After': '60',
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }

      // Add rate limit headers to response
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', '100');
      response.headers.set('X-RateLimit-Remaining', Math.max(0, result.remaining).toString());
      return response;
    }

    // IP-based rate limiting for unauthenticated requests
    const result = await ipRateLimiter.limit(ip);

    if (!result.success) {
      console.warn(`[RATE_LIMIT] IP ${ip} rate limited`);

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '60');
    response.headers.set('X-RateLimit-Remaining', Math.max(0, result.remaining).toString());
    return response;
  } catch (error) {
    console.error('[RATE_LIMIT] Error in rate limiting middleware:', error);
    // Fail open - allow request if rate limiting service has issues
    return NextResponse.next();
  }
}

/**
 * Configure which routes this middleware runs on
 *
 * Currently applies to all API routes
 */
export const config = {
  matcher: '/api/:path*',
};