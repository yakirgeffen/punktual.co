/**
 * Hook for fetching event analytics data using React Query
 * Provides total clicks, platform breakdown, and last click timestamp
 * Only available for paid tier users
 */

import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from './useAuth';
import { useUserPlan } from './useUserPlan';

export interface EventAnalyticsData {
  totalClicks: number;
  platformBreakdown: {
    platform: string;
    clicks: number;
  }[];
  lastClickedAt?: string;
}

interface UseEventAnalyticsOptions {
  enabled?: boolean; // Allow manual control of query execution
  refetchInterval?: number | false; // Auto-refetch interval (default: false)
}

export function useEventAnalytics(
  eventId: string | undefined,
  options: UseEventAnalyticsOptions = {}
) {
  const { user } = useAuth();
  const { isPro } = useUserPlan();
  const supabase = createClientComponentClient();

  const {
    enabled = true,
    refetchInterval = false,
  } = options;

  const query = useQuery({
    queryKey: ['event-analytics', eventId],
    queryFn: async (): Promise<EventAnalyticsData> => {
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      // Call the Supabase RPC function to get aggregated analytics
      const { data, error } = await supabase.rpc('get_event_analytics', {
        p_event_id: eventId
      });

      if (error) {
        throw new Error(`Failed to fetch analytics: ${error.message}`);
      }

      // Transform the response into our EventAnalyticsData format
      const platformBreakdown: { platform: string; clicks: number }[] = [];

      if (data && data.length > 0) {
        const result = data[0];
        const breakdown = result.platform_breakdown || {};

        // Convert JSONB object to array of { platform, clicks }
        Object.entries(breakdown).forEach(([platform, clicks]) => {
          platformBreakdown.push({
            platform,
            clicks: clicks as number,
          });
        });

        // Sort by clicks descending
        platformBreakdown.sort((a, b) => b.clicks - a.clicks);

        return {
          totalClicks: Number(result.total_clicks || 0),
          platformBreakdown,
          lastClickedAt: result.last_clicked_at || undefined,
        };
      }

      // No data yet - return empty analytics
      return {
        totalClicks: 0,
        platformBreakdown: [],
        lastClickedAt: undefined,
      };
    },
    enabled: Boolean(user && isPro && eventId && enabled),
    refetchInterval,
    // Keep previous data while refetching to avoid UI flicker
    placeholderData: (previousData) => previousData,
  });

  return {
    analytics: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    // Convenience flags
    hasData: Boolean(query.data && query.data.totalClicks > 0),
    isPro,
  };
}
