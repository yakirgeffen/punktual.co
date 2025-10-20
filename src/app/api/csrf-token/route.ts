import { NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

/**
 * CSRF Token Generation Endpoint
 *
 * Provides CSRF tokens for state-changing requests (POST, PUT, DELETE)
 * Tokens are single-use, time-limited, and cryptographically secure
 */

function generateCSRFToken(): string {
  // Generate 32 random bytes and convert to hex
  return randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  // Hash the token to store in server
  return createHash('sha256').update(token).digest('hex');
}

export async function GET() {
  try {
    // Generate a new CSRF token
    const token = generateCSRFToken();
    const hashedToken = hashToken(token);

    // Store hashed token in httpOnly cookie
    // Client receives the unhashed token to send in headers
    const response = NextResponse.json(
      { token, success: true },
      { status: 200 }
    );

    // Set secure, httpOnly cookie with hashed token
    response.cookies.set({
      name: '__csrf_token',
      value: hashedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    // Also set a non-httpOnly cookie for client-side form detection
    response.cookies.set({
      name: '__csrf_token_client',
      value: token,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[CSRF] Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
