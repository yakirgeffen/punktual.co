/**
 * CSRF Protection Utilities
 *
 * Helper functions for CSRF token validation and middleware integration
 */

import { createHash } from 'crypto';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

/**
 * Validate CSRF token from request
 *
 * Compares client-provided token with server-stored hash
 */
export function validateCSRFToken(
  clientToken: string | null | undefined,
  serverHashedToken: string | null | undefined
): boolean {
  if (!clientToken || !serverHashedToken) {
    console.warn('[CSRF] Missing token or cookie');
    return false;
  }

  try {
    // Hash the client token and compare with server hash
    const clientHash = createHash('sha256').update(clientToken).digest('hex');
    return clientHash === serverHashedToken;
  } catch (error) {
    console.error('[CSRF] Error validating token:', error);
    return false;
  }
}

/**
 * Extract CSRF token from request
 *
 * Checks multiple sources:
 * 1. X-CSRF-Token header
 * 2. csrf_token form field
 */
export function getCSRFTokenFromRequest(
  headers: Headers | null,
  body: Record<string, any> | null
): string | null {
  // Check header first
  if (headers) {
    const headerToken = headers.get('x-csrf-token');
    if (headerToken) return headerToken;
  }

  // Check form body
  if (body?.csrf_token) {
    return body.csrf_token;
  }

  return null;
}

/**
 * Middleware helper to validate CSRF for state-changing requests
 */
export async function validateCSRFMiddleware(
  method: string,
  headers: Headers,
  body: any
): Promise<{ valid: boolean; error?: string }> {
  // Only validate state-changing requests
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return { valid: true };
  }

  // GET CSRF token from request
  const clientToken = getCSRFTokenFromRequest(headers, body);
  if (!clientToken) {
    return {
      valid: false,
      error: 'CSRF token missing',
    };
  }

  // Get server-stored hash from cookie
  const cookieHeader = headers.get('cookie');
  let serverHash: string | null = null;

  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    serverHash = cookies['__csrf_token'] || null;
  }

  if (!serverHash) {
    return {
      valid: false,
      error: 'CSRF token not found in session',
    };
  }

  // Validate tokens match
  if (!validateCSRFToken(clientToken, serverHash)) {
    console.warn('[CSRF] Token validation failed');
    return {
      valid: false,
      error: 'CSRF token validation failed',
    };
  }

  return { valid: true };
}

/**
 * Simple cookie parser for reading httpOnly cookies from header
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const [name, value] = cookie.split('=').map((c) => c.trim());
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

/**
 * Format CSRF token for inclusion in forms
 */
export function renderCSRFTokenField(token: string): string {
  return `<input type="hidden" name="csrf_token" value="${escapeHtml(token)}" />`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
