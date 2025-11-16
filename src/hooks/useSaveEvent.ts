/**
 * Hook for saving events to the database
 * Extends the existing events table functionality
 * Integrates with event quota tracking for free tier users (3 events/month)
 */

import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from './useAuth';
import { useCheckEventQuota } from './useCheckEventQuota';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import { generateCalendarLinks } from '@/utils/calendarGenerator';
import { createCalendarShortLinks } from '@/utils/shortLinks';
import type { EventData, CalendarLinks } from '@/types';

interface SaveEventReturn {
  saveEvent: (eventData: EventData) => Promise<{
    eventId: string;
    shareId: string;
    shortLinks: CalendarLinks;
  } | null>;
  loading: boolean;
  error: string | null;
}

export function useSaveEvent(): SaveEventReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();
  const { checkQuota, incrementEventCount, MONTHLY_LIMIT } = useCheckEventQuota();
  const supabase = createClientComponentClient();

  const saveEvent = useCallback(async (eventData: EventData): Promise<{
    eventId: string;
    shareId: string;
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

    try {
      setLoading(true);
      setError(null);

      logger.info('Saving event', 'EVENT_SAVE', {
        userId: user.id,
        title: eventData.title
      });

      // Check event quota for free tier users
      // Note: If quota check fails, we still allow event creation to proceed
      // The quota system is best-effort to prevent blocking users
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
              icon: 'ℹ️'
            });
          }
        }
      } catch (quotaError) {
        // If quota check fails, log it but don't block the event creation
        logger.warn('Quota check failed, proceeding with event creation', 'EVENT_SAVE', {
          userId: user.id,
          error: quotaError instanceof Error ? quotaError.message : 'Unknown error'
        });
        // Still attempt to create the event even if quota system fails
      }

      // Ensure user profile exists before creating event (safety check)
      try {
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          logger.info('Creating missing user profile before event save', 'EVENT_SAVE', { userId: user.id });

          await supabase.from('user_profiles').insert([
            {
              user_id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              plan: 'free',
              events_created: 0,
              quota_reset_date: new Date().toISOString().split('T')[0]
            }
          ]);
        }
      } catch (profileError) {
        logger.warn('Could not ensure user profile exists', 'EVENT_SAVE', {
          userId: user.id,
          error: profileError instanceof Error ? profileError.message : 'Unknown error'
        });
        // Continue anyway - the event save might still work
      }

      // Save event to existing events table - only include fields that exist in DB
      // Sanitize time fields - ensure they're not empty strings
      const eventToSave = {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        organizer: eventData.organizer,
        start_date: eventData.startDate,
        start_time: eventData.startTime && eventData.startTime.trim() ? eventData.startTime : '00:00:00',  // Default to midnight if empty
        end_date: eventData.endDate || eventData.startDate, // Use startDate as fallback if endDate not provided
        end_time: eventData.endTime && eventData.endTime.trim() ? eventData.endTime : '00:00:00',  // Default to midnight if empty
        timezone: eventData.timezone,
        is_all_day: eventData.isAllDay || false,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
        // share_id will be auto-generated by the database
      };

      const { data: savedEvent, error: saveError } = await supabase
        .from('events')
        .insert([eventToSave])
        .select()
        .single();

      if (saveError) {
        throw new Error(`Failed to save event: ${saveError.message}`);
      }

      // Increment event count in quota system
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

      // Generate calendar links and then short links
      const calendarLinks = generateCalendarLinks(eventData);
      let shortLinks: CalendarLinks = calendarLinks; // Default to original links

      // Create short links in the background without blocking
      // This allows redirect to happen immediately
      // Get access token from session for authentication
      const accessToken = session?.access_token;
      createCalendarShortLinks(
        calendarLinks,
        eventData.title,
        user.id,
        accessToken
      )
        .then((generatedShortLinks) => {
          logger.info('Short links generated successfully (background)', 'EVENT_SAVE', {
            eventId: savedEvent.id,
            shortLinksCount: Object.keys(generatedShortLinks).length
          });
        })
        .catch((shortLinkError) => {
          logger.warn('Failed to generate short links (background), using original URLs', 'EVENT_SAVE', {
            eventId: savedEvent.id,
            error: shortLinkError instanceof Error ? shortLinkError.message : 'Unknown error'
          });
          // Silently fail - we're already using calendarLinks as fallback
        });

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
        shareId: savedEvent.share_id,
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
      setLoading(false);
    }
  }, [user, session, supabase]);

  return {
    saveEvent,
    loading,
    error
  };
}
