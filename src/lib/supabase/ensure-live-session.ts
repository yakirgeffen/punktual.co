/**
 * ensureLiveSession — proactive token-refresh guard for auth-gated DB ops
 *
 * Problem this solves
 * -------------------
 * @supabase/ssr (^0.7.x) uses a browser navigator.locks to serialize
 * GoTrue token refreshes — only one in-flight refresh at a time. When a
 * caller fires an RLS-gated PostgREST query with an expired access token,
 * the supabase-js client transparently triggers a refresh under that lock.
 * If the lock is already held (e.g. by the concurrent getUser() call in
 * useAuth.hydrate()), the PostgREST call blocks indefinitely — there is no
 * default timeout in gotrue-js for the lock wait. The result: a user with
 * a session older than ~1h clicks "Create Event", checkQuota() calls
 * maybeSingle(), and the UI hangs forever because setLoading(false) is in
 * the finally block that never fires.
 *
 * The fix
 * -------
 * Call getUser() once, before any RLS-gated DB operation, from the mutation
 * path (saveEvent). getUser() both validates the current token AND triggers
 * a refresh if needed. Since it runs first — and the useAuth hydrate()
 * getUser() call has already completed by the time a user can interact with
 * the /create page — the lock is free. All subsequent DB calls in the same
 * event loop carry the now-fresh token in the Authorization header without
 * needing to re-acquire the lock.
 *
 * This also acts as a hard gate: if the session cannot be validated (revoked
 * refresh token, network error) we surface a clear error instead of hanging.
 *
 * Usage
 * -----
 * import { ensureLiveSession, makeTimeout } from '@/lib/supabase/ensure-live-session';
 * // at the top of the mutation, before any .from() calls:
 * await ensureLiveSession(supabase, 8_000);
 *
 * // wrapping a DB call with a timeout:
 * const result = await Promise.race([
 *   supabase.from('table').select('*').eq('id', id).maybeSingle(),
 *   makeTimeout(6_000, 'user_profiles select')
 * ]);
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns a Promise that rejects after `ms` milliseconds with a clear label.
 * Use with Promise.race() at the call site to apply per-query deadlines while
 * preserving TypeScript's native inference of the Supabase builder return type.
 *
 * @example
 * const { data, error } = await Promise.race([
 *   supabase.from('user_profiles').select('id').eq('user_id', uid).maybeSingle(),
 *   makeTimeout(6_000, 'user_profiles existence check')
 * ]);
 */
export function makeTimeout(ms: number, label: string): Promise<never> {
  return new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms: ${label}`)), ms)
  );
}

/**
 * Validates / refreshes the Supabase session before DB ops.
 * Calls supabase.auth.getUser() which hits GoTrue /auth/v1/user and
 * triggers a silent refresh if the access token is expired. This acquires
 * and releases the navigator.locks token-refresh lock before any subsequent
 * PostgREST call needs it — preventing the lock-contention deadlock.
 *
 * @param supabase - the singleton browser client (from createClient())
 * @param timeoutMs - hard timeout for the getUser round-trip (default 8 000 ms)
 * @returns the validated user object
 * @throws if no session, validation fails, or the call times out
 */
export async function ensureLiveSession(
  supabase: SupabaseClient,
  timeoutMs = 8_000
): Promise<{ id: string; email?: string }> {
  const result = await Promise.race([
    supabase.auth.getUser(),
    makeTimeout(timeoutMs, 'ensureLiveSession → supabase.auth.getUser()')
  ]);

  const { data, error } = result as Awaited<ReturnType<typeof supabase.auth.getUser>>;

  if (error || !data?.user) {
    throw new Error(error?.message ?? 'Session expired — please sign in again.');
  }

  return data.user;
}
