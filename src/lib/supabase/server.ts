/**
 * Server-Side Supabase Client Utilities
 *
 * IMPORTANT: These clients should ONLY be used in server-side contexts:
 * - API routes (route.ts files)
 * - Server Components
 * - Server Actions
 *
 * NEVER import or use these in client components ('use client')
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client with SERVICE ROLE privileges
 *
 * ⚠️ DANGER: Bypasses Row-Level Security (RLS)
 *
 * Use cases:
 * - Admin operations that need to bypass RLS
 * - System-level operations (e.g., short link creation for any user)
 * - Bulk operations that would be inefficient with RLS
 *
 * Security requirements:
 * - ONLY use in API routes or server-side functions
 * - Validate user authentication before performing sensitive operations
 * - Log all operations for audit trail
 * - Never return the client itself to the client-side
 *
 * @returns Supabase client with admin privileges
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Creates a Supabase client for Server Components with user context
 *
 * This client respects Row-Level Security (RLS) and uses the authenticated
 * user's session from cookies.
 *
 * Use cases:
 * - Server Components that need to fetch user-specific data
 * - Server Actions that should respect RLS
 * - Authenticated API routes that should use user permissions
 *
 * Security features:
 * - Respects RLS policies
 * - Uses session from httpOnly cookies
 * - Automatically handles token refresh
 *
 * @returns Supabase client with user-level permissions
 */
export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  const cookieStore = await cookies();

  // Get session from cookies
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    },
  });

  // Set the session if we have tokens
  if (accessToken && refreshToken) {
    await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  return client;
}

/**
 * Helper function to verify user authentication in API routes
 *
 * Use this before performing sensitive operations to ensure the request
 * is coming from an authenticated user.
 *
 * @param request - Next.js request object
 * @returns User object if authenticated, throws error otherwise
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const user = await requireAuth(request);
 *   // Now safe to perform authenticated operations
 *   // user.id contains the authenticated user's ID
 * }
 * ```
 */
export async function requireAuth(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;

  if (!accessToken) {
    throw new Error('Authentication required');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error } = await client.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error('Invalid or expired authentication token');
  }

  return user;
}

/**
 * Type-safe database client with full TypeScript support
 *
 * TODO: Generate types from Supabase schema using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 *
 * Then import and use like:
 * import { Database } from '@/types/database';
 * const client = createServiceRoleClient<Database>();
 */
