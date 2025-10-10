/**
 * Client-Side Supabase Client Utilities
 *
 * IMPORTANT: These clients use NEXT_PUBLIC_* environment variables
 * and are safe to use in client components ('use client').
 *
 * Security:
 * - Only uses the anonymous/public key (respects RLS)
 * - All data access is controlled by Row-Level Security policies
 * - Never exposes service role key or admin privileges
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in Client Components
 *
 * This is a singleton client that maintains the user's session
 * across the application.
 *
 * Features:
 * - Automatic session management via cookies
 * - Automatic token refresh
 * - Respects Row-Level Security policies
 * - Safe to use in browser/client components
 *
 * Usage in client components:
 * ```tsx
 * 'use client';
 * import { createClient } from '@/lib/supabase/client';
 *
 * export default function MyComponent() {
 *   const supabase = createClient();
 *   // Use supabase client...
 * }
 * ```
 *
 * @returns Supabase client instance for browser use
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase public environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Legacy compatibility export
 *
 * This maintains compatibility with the existing useAuth hook
 * which uses createClientComponentClient from @supabase/auth-helpers-nextjs
 *
 * @deprecated Consider migrating to the new createClient() function above
 */
export { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
