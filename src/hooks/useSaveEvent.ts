/**
 * Hook for saving events to the database
 * Extends the existing events table functionality
 * Integrates with event quota tracking for free tier users (5 events/month)
 *
 * 2026-06-16 — Systemic auth/token reliability fix
 *
 * Root cause of "Creating your event..." infinite hang:
 *
 * With a session older than ~1 h the Supabase access token is expired.
 * @supabase/ssr serializes all GoTrue token refreshes under a single
 * navigator.locks browser lock. When checkQuota() fires its PostgREST read
 * with an expired bearer, supabase-js tries to refresh the token -- but if
 * useAuth.hydrate()'s getUser() call is already holding the lock, the refresh
 * waits indefinitely. No timeout exists in gotrue-js for the lock-wait, so
 * the await for checkQuota() never resolves, setLoading(false) in finally
 * never fires, and the button spins forever.
 *
 * The fix (three layers):
 *
 * 1. ensureLiveSession() -- called once at the very start of saveEvent(),
 *    BEFORE any PostgREST call. It calls supabase.auth.getUser() which
 *    acquires the lock, refreshes the token if needed, and releases the lock.
 *    All subsequent DB calls in the same event loop carry a fresh bearer and
 *    do NOT need to re-acquire the lock.
 *
 * 2. Promise.race() + makeTimeout() on every DB call (both here and in
 *    useCheckEventQuota) so no single DB await can block the save path longer
 *    than its declared deadline (6 s per call, 8 s for the token refresh).
 *
 * 3. A hard 30 s outer setTimeout guard: even if somehow all the inner
 *    timeouts fail, the outer guard ensures setLoading(false) fires and the
 *    user sees a toast rather than an infinite spinner.
 *
 * Blast radius: only the save path. No changes to useAuth hydration, the
 * onAuthStateChange listener, or dashboard reads. The ensureLiveSession
 * helper is a pure additive call; it does not alter auth state.
 */

import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { useCheckEventQuota } from './useCheckEventQuota';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import { generateCalendarLinks } from '@/utils/calendarGenerator';
import { buildRRule } from '@/utils/rrule';
import { createCalendarShortLinks } from '@/utils/shortLinks';
import { ensureLiveSession, makeTimeout } from '@/lib/supabase/ensure-live-session';
import type { EventData, CalendarLinks } from '@/types';

interface SaveEventReturn {
  saveEvent: (eventData: EventData) => Promise<{
    eventId: string;
    shortLinks: CalendarLinks;
  } | null>;
  loading: boolean;
  error: string | null;
}

/** Hard deadline for each individual DB call in this hook. */
const DB_TIMEOUT_MS = 6_000;

/**
 * Hard outer deadline for the entire saveEvent flow.
 * Covers: ensureLiveSession (<=8s) + checkQuota (<=8s) + events insert (<=6s)
 * + short-link generation. Fires toast + clears loading if exceeded.
 */
const SAVE_TIMEOUT_MS = 30_000;

export function useSaveEvent(): SaveEventReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();
  const { checkQuota, incrementEventCount, MONTHLY_LIMIT } = useCheckEventQuota();
  const supabase = createClientComponentClient();

  const saveEvent = useCallback(async (eventData: EventData): Promise<{
    eventId: string;
    shortLinks: CalendarLinks;
  } | null> => {
    if (!user) {
      const errorMsg = 'You must be logged in to save events';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    if (!eventData.title?.trim()) {
      const errorMsg = 'Event title is required';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    // Outer safety net: if the inner timeouts somehow all fail, this guard
    // still clears loading and shows a toast so the button never spins forever.
    let saveCompleted = false;
    const outerTimeout = setTimeout(() => {
      if (!saveCompleted) {
        setLoading(false);
        const msg = 'Event creation timed out. Please try again.';
        setError(msg);
        toast.error(msg);
      }
    }, SAVE_TIMEOUT_MS);

    try {
      setLoading(true);
      setError(null);

      logger.info('Saving event', 'EVENT_SAVE', {
        userId: user.id,
        title: eventData.title
      });

      // Step 0: ensure a live token before any RLS-gated DB call
      // getUser() acquires the navigator.locks token-refresh lock, refreshes
      // if the access token is expired, writes the fresh token into the
      // singleton client's internal state, and releases the lock. All
      // subsequent .from() calls carry the fresh bearer without needing the
      // lock. If the lock is still held by useAuth.hydrate(), this call
      // waits -- but with an 8 s timeout rather than indefinitely.
      try {
        await ensureLiveSession(supabase, 8_000);
        logger.info('Session validated / token refreshed', 'EVENT_SAVE', { userId: user.id });
      } catch (sessionError) {
        const msg = sessionError instanceof Error
          ? sessionError.message
          : 'Session expired -- please sign in again.';
        logger.error('Session validation failed', 'EVENT_SAVE', { userId: user.id, error: msg });
        setError(msg);
        toast.error(msg);
        return null;
      }

      // Step 1: quota check (best-effort, non-blocking on failure)
      let quotaStatus = null;
      try {
        quotaStatus = await checkQuota();
        if (quotaStatus && !quotaStatus.canCreateEvent) {
          const errorMsg = `Monthly event limit reached (${MONTHLY_LIMIT} events per month). Quota resets on ${new Date(quotaStatus.quotaResetDate).toLocaleDateString()}.`;
          setError(errorMsg);
          toast.error(errorMsg);
          logger.warn('Event creation blocked - quota limit', 'EVENT_SAVE', {
            userId: user.id,
            quotaStatus
          });
          return null;
        }

        if (quotaStatus) {
          logger.info('Quota check passed', 'EVENT_SAVE', {
            userId: user.id,
            eventsRemaining: quotaStatus.eventsRemaining
          });

          // Show remaining events info
          if (quotaStatus.eventsRemaining < MONTHLY_LIMIT) {
            toast(`${quotaStatus.eventsRemaining} event${quotaStatus.eventsRemaining === 1 ? '' : 's'} remaining this month`, {
              icon: 'info'
            });
          }
        }
      } catch (quotaError) {
        // If quota check fails or times out, log and continue -- don't block
        logger.warn('Quota check failed, proceeding with event creation', 'EVENT_SAVE', {
          userId: user.id,
          error: quotaError instanceof Error ? quotaError.message : 'Unknown error'
        });
      }

      // Step 2: ensure user profile exists (safety check)
      try {
        const { data: existingProfile } = await Promise.race([
          supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle(),
          makeTimeout(DB_TIMEOUT_MS, 'useSaveEvent -> user_profiles existence check')
        ]);

        if (!existingProfile) {
          logger.info('Creating missing user profile before event save', 'EVENT_SAVE', { userId: user.id });

          await Promise.race([
            supabase.from('user_profiles').insert([
              {
                user_id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                plan: 'free',
                events_created: 0,
                quota_reset_date: new Date().toISOString().split('T')[0]
              }
            ]),
            makeTimeout(DB_TIMEOUT_MS, 'useSaveEvent -> user_profiles insert')
          ]);
        }
      } catch (profileError) {
        logger.warn('Could not ensure user profile exists', 'EVENT_SAVE', {
          userId: user.id,
          error: profileError instanceof Error ? profileError.message : 'Unknown error'
        });
        // Continue anyway - the event save might still work
      }

      // Step 3: insert the event
      // Sanitize time fields -- ensure they're not empty strings
      const eventToSave = {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        organizer: eventData.organizer,
        start_date: eventData.startDate,
        start_time: eventData.startTime && eventData.startTime.trim() ? eventData.startTime : '00:00:00',
        end_date: eventData.endDate || eventData.startDate,
        end_time: eventData.endTime && eventData.endTime.trim() ? eventData.endTime : '00:00:00',
        timezone: eventData.timezone,
        is_all_day: eventData.isAllDay || false,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
        // share_id will be auto-generated by the database
      };

      // Recurrence is stored as a canonical RFC 5545 RRULE (migration
      // 20260612_add_recurrence_to_events.sql). If that migration hasn't run
      // on this database yet, retry the insert without the recurrence columns
      // rather than failing the whole save.
      const rrule = buildRRule(eventData);
      const recurrenceColumns = {
        is_recurring: !!rrule,
        recurrence_rule: rrule
      };

      let { data: savedEvent, error: saveError } = await Promise.race([
        supabase
          .from('events')
          .insert([{ ...eventToSave, ...recurrenceColumns }])
          .select()
          .single(),
        makeTimeout(DB_TIMEOUT_MS, 'useSaveEvent -> events insert')
      ]);

      if (saveError && /recurrence|is_recurring/.test(saveError.message)) {
        logger.warn('Recurrence columns missing (migration not applied) -- saving without them', 'EVENT_SAVE', {
          userId: user.id
        });
        ({ data: savedEvent, error: saveError } = await Promise.race([
          supabase
            .from('events')
            .insert([eventToSave])
            .select()
            .single(),
          makeTimeout(DB_TIMEOUT_MS, 'useSaveEvent -> events insert (no recurrence)')
        ]));
      }

      if (saveError) {
        throw new Error(`Failed to save event: ${saveError.message}`);
      }

      // Step 4: increment quota (best-effort, non-blocking)
      const incrementSuccess = await incrementEventCount();
      if (!incrementSuccess) {
        logger.warn('Failed to increment event count, but event was saved', 'EVENT_SAVE', {
          eventId: savedEvent.id
        });
        // Don't fail the event save if quota increment fails - it's logged
      } else {
        logger.info('Event count incremented successfully', 'EVENT_SAVE', {
          eventId: savedEvent.id
        });
      }

      // Step 5: generate calendar + short links
      // Generate calendar links, then short links. The previous version fired
      // short-link creation in the background and DISCARDED the results -- the
      // UI only ever saw the long URLs (review finding W5). Awaiting here means
      // the returned shortLinks are the real ones; per-platform failures fall
      // back to the original URL inside createCalendarShortLinks.
      const calendarLinks = generateCalendarLinks(eventData);
      let shortLinks: CalendarLinks = calendarLinks;

      const accessToken = session?.access_token;
      try {
        shortLinks = await createCalendarShortLinks(
          calendarLinks,
          eventData.title,
          user.id,
          accessToken
        );
        logger.info('Short links generated', 'EVENT_SAVE', {
          eventId: savedEvent.id,
          shortLinksCount: Object.keys(shortLinks).length
        });
      } catch (shortLinkError) {
        logger.warn('Failed to generate short links, using original URLs', 'EVENT_SAVE', {
          eventId: savedEvent.id,
          error: shortLinkError instanceof Error ? shortLinkError.message : 'Unknown error'
        });
      }

      logger.info('Event saved successfully', 'EVENT_SAVE', {
        eventId: savedEvent.id,
        userId: user.id,
        title: eventData.title,
        hasShortLinks: Object.keys(shortLinks).length > 0
      });

      // Track event creation
      if (typeof window !== 'undefined') {
        const { trackCalendarEventCreated } = await import('@/lib/analytics');
        trackCalendarEventCreated('generator');
      }

      toast.success(`"${eventData.title}" saved with calendar links!`);

      return {
        eventId: savedEvent.id,
        shortLinks
      };

    } catch (error) {
      console.error('Full save event error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save event';
      logger.error('Save event error', 'EVENT_SAVE', {
        userId: user?.id,
        title: eventData.title,
        error: errorMessage,
        fullError: error
      });

      setError(errorMessage);
      toast.error(errorMessage);
      return null;

    } finally {
      saveCompleted = true;
      clearTimeout(outerTimeout);
      setLoading(false);
    }
  }, [user, session, supabase, checkQuota, incrementEventCount, MONTHLY_LIMIT]);

  return {
    saveEvent,
    loading,
    error
  };
}
