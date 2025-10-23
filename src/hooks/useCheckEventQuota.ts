/**
 * Hook for checking event creation quota (free tier: 3 events/month)
 * Manages monthly quota reset and quota enforcement
 */

import { useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

interface QuotaStatus {
  eventsCreated: number;
  eventsRemaining: number;
  quotaResetDate: string;
  canCreateEvent: boolean;
  isAtLimit: boolean;
}

export function useCheckEventQuota() {
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  const MONTHLY_LIMIT = 3;

  /**
   * Get current quota status for the user
   */
  const checkQuota = useCallback(async (): Promise<QuotaStatus | null> => {
    if (!user) {
      logger.warn('Check quota - no user', 'QUOTA', {});
      return null;
    }

    try {
      // Use maybeSingle instead of single to handle missing profiles gracefully
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('events_created, quota_reset_date, plan')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('Failed to fetch quota status', 'QUOTA', {
          userId: user.id,
          error: error.message
        });
        // If profile doesn't exist, create it with default quota
        logger.info('Profile not found, creating new one', 'QUOTA', { userId: user.id });

        try {
          const newProfile = await supabase.from('user_profiles').insert([
            {
              user_id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              plan: 'free',
              events_created: 0,
              quota_reset_date: new Date().toISOString().split('T')[0]
            }
          ]).select().single();

          if (newProfile.error) throw newProfile.error;

          // Return default quota for new profile
          return {
            eventsCreated: 0,
            eventsRemaining: 3,
            quotaResetDate: new Date().toISOString().split('T')[0],
            canCreateEvent: true,
            isAtLimit: false
          };
        } catch (createError) {
          logger.error('Failed to create user profile', 'QUOTA', {
            userId: user.id,
            error: createError instanceof Error ? createError.message : 'Unknown error'
          });
          return null;
        }
      }

      if (!profile) {
        logger.warn('No profile found and unable to create one', 'QUOTA', {
          userId: user.id
        });
        return null;
      }

      // For Pro users, no quota limit
      if (profile.plan === 'pro') {
        return {
          eventsCreated: 0,
          eventsRemaining: Infinity,
          quotaResetDate: profile.quota_reset_date,
          canCreateEvent: true,
          isAtLimit: false
        };
      }

      // Check if we need to reset quota (first of month)
      const today = new Date().toISOString().split('T')[0];
      const resetDate = new Date(profile.quota_reset_date);
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      const currentMonthStartStr = currentMonthStart.toISOString().split('T')[0];

      // If quota_reset_date is not the first of current month, we need to reset
      if (profile.quota_reset_date !== currentMonthStartStr) {
        logger.info('Quota reset triggered', 'QUOTA', {
          userId: user.id,
          oldResetDate: profile.quota_reset_date,
          newResetDate: currentMonthStartStr
        });

        // Reset quota in database
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            events_created: 0,
            quota_reset_date: currentMonthStartStr
          })
          .eq('user_id', user.id);

        if (updateError) {
          logger.error('Failed to reset quota', 'QUOTA', {
            userId: user.id,
            error: updateError.message
          });
        }

        return {
          eventsCreated: 0,
          eventsRemaining: MONTHLY_LIMIT,
          quotaResetDate: currentMonthStartStr,
          canCreateEvent: true,
          isAtLimit: false
        };
      }

      const eventsRemaining = Math.max(0, MONTHLY_LIMIT - profile.events_created);

      logger.info('Quota status retrieved', 'QUOTA', {
        userId: user.id,
        eventsCreated: profile.events_created,
        eventsRemaining,
        canCreate: eventsRemaining > 0
      });

      return {
        eventsCreated: profile.events_created,
        eventsRemaining,
        quotaResetDate: profile.quota_reset_date,
        canCreateEvent: eventsRemaining > 0,
        isAtLimit: eventsRemaining === 0
      };
    } catch (error) {
      logger.error('Unexpected error checking quota', 'QUOTA', {
        userId: user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }, [user, supabase]);

  /**
   * Increment event count after successful save
   */
  const incrementEventCount = useCallback(async (): Promise<boolean> => {
    if (!user) {
      logger.warn('Increment quota - no user', 'QUOTA', {});
      return false;
    }

    try {
      // First check current quota status to ensure we're still within limit
      const status = await checkQuota();
      if (!status || !status.canCreateEvent) {
        logger.warn('Cannot increment - quota limit reached', 'QUOTA', {
          userId: user.id
        });
        return false;
      }

      // Increment counter
      const { error } = await supabase.rpc('increment_event_count', {
        user_id_param: user.id
      });

      if (error) {
        logger.error('Failed to increment event count', 'QUOTA', {
          userId: user.id,
          error: error.message
        });
        return false;
      }

      logger.info('Event count incremented', 'QUOTA', {
        userId: user.id
      });
      return true;
    } catch (error) {
      logger.error('Unexpected error incrementing quota', 'QUOTA', {
        userId: user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }, [user, supabase, checkQuota]);

  return {
    checkQuota,
    incrementEventCount,
    MONTHLY_LIMIT
  };
}
