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
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase public environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

/**
 * Compatibility alias for the deprecated @supabase/auth-helpers-nextjs API.
 *
 * Every call site previously created its own auth-helpers client while the
 * session cookie was written in @supabase/ssr format — two libraries, two
 * storage formats, one of the root causes of the "signed in but every page
 * load shows logged out" bug (QA 2026-06-13, bug #1). All call sites now
 * share the single @supabase/ssr browser client above.
 */
export const createClientComponentClient = createClient;
