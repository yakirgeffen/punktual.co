/**
 * Hook for managing all saved events (extends useRecentEvents)
 * Provides full CRUD operations with search, filter, and pagination
 */

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import type { EventData } from '@/types';

interface DatabaseEvent extends EventData {
  id: string;
  user_id: string;
  share_id?: string;
  created_at: string;
  updated_at?: string;
  last_used_at?: string;
}

interface UsageData {
  events_created: number;
  user_id: string;
  month: string;
}

interface UseSavedEventsOptions {
  searchQuery?: string;
  sortBy?: 'created_at' | 'title' | 'last_used_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  favoritesOnly?: boolean;
}

interface UseSavedEventsReturn {
  events: DatabaseEvent[];
  loading: boolean;
  totalCount: number;
  deleteEvent: (eventId: string) => Promise<boolean>;
  duplicateEvent: (eventId: string) => Promise<DatabaseEvent | null>;
  updateLastUsed: (eventId: string) => Promise<void>;
  refetch: (options?: UseSavedEventsOptions) => Promise<void>;
  hasMore: boolean;
}

export function useSavedEvents(
  initialOptions: UseSavedEventsOptions = {}
): UseSavedEventsReturn {
  const [events, setEvents] = useState<DatabaseEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  const defaultOptions = {
    searchQuery: '',
    sortBy: 'created_at' as const,
    sortOrder: 'desc' as const,
    limit: 20,
    offset: 0,
    favoritesOnly: false,
    ...initialOptions
  };

  const [options, setOptions] = useState<UseSavedEventsOptions>(defaultOptions);

  const fetchSavedEvents = useCallback(async (
    fetchOptions: UseSavedEventsOptions = options
  ): Promise<void> => {
    if (!user) {
      setEvents([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      logger.info('Fetching saved events', 'DASHBOARD', { 
        userId: user.id, 
        options: fetchOptions 
      });

      // Build query
      let query = supabase
        .from('events')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Apply search filter
      if (fetchOptions.searchQuery?.trim()) {
        query = query.ilike('title', `%${fetchOptions.searchQuery.trim()}%`);
      }

      // Apply favorites filter (would need to add is_favorite column to events table)
      // For now, we'll skip this until the database schema is updated

      // Apply sorting
      const sortBy = fetchOptions.sortBy || 'created_at';
      const sortOrder = fetchOptions.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const limit = fetchOptions.limit || 20;
      const offset = fetchOptions.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch events: ${error.message}`);
      }

      // DB rows are snake_case; the UI (EventCard, embed generator) reads
      // camelCase EventData fields — map here so dates/times actually render.
      const mapped = (data || []).map((row: Record<string, unknown>) => ({
        ...row,
        startDate: row.start_date,
        startTime: row.start_time,
        endDate: row.end_date,
        endTime: row.end_time,
        isAllDay: row.is_all_day,
      })) as DatabaseEvent[];

      setEvents(mapped);
      setTotalCount(count || 0);

      logger.info('Successfully fetched saved events', 'DASHBOARD', { 
        userId: user.id, 
        count: data?.length || 0,
        totalCount: count || 0
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load events';
      logger.error('Fetch saved events error', 'DASHBOARD', { 
        userId: user.id, 
        error: errorMessage 
      });
      
      toast.error(errorMessage);
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    // Only fetch if user is available and initialized
    if (user) {
      fetchSavedEvents(options);
    }
  }, [user, fetchSavedEvents]);

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      logger.info('Deleting event', 'DASHBOARD', { eventId, userId: user.id });

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to delete event: ${error.message}`);
      }

      // Update local state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      setTotalCount(prevCount => prevCount - 1);

      toast.success('Event deleted successfully');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      logger.error('Delete event error', 'DASHBOARD', { 
        eventId, 
        userId: user.id, 
        error: errorMessage 
      });
      
      toast.error(errorMessage);
      return false;
    }
  };

  const duplicateEvent = async (eventId: string): Promise<DatabaseEvent | null> => {
    if (!user) return null;

    try {
      const eventToDuplicate = events.find(event => event.id === eventId);
      if (!eventToDuplicate) {
        throw new Error('Event not found');
      }

      // Build the insert payload explicitly from DB columns. The previous
      // version (a) checked a `usage_tracking` table that doesn't exist —
      // a missing table errors with a non-PGRST116 code, so EVERY duplicate
      // attempt threw — and (b) spread the whole row, carrying the original
      // `id` (PK conflict) and camelCase display fields (unknown columns).
      const row = eventToDuplicate as unknown as Record<string, unknown>;
      const { title, description, location, organizer } = eventToDuplicate;
      const now = new Date().toISOString();
      const duplicatedEvent = {
        title: `${title} (Copy)`,
        description,
        location,
        organizer,
        start_date: row.start_date,
        start_time: row.start_time,
        end_date: row.end_date,
        end_time: row.end_time,
        timezone: row.timezone,
        is_all_day: row.is_all_day ?? false,
        is_recurring: row.is_recurring ?? false,
        recurrence_rule: row.recurrence_rule ?? null,
        user_id: user.id,
        created_at: now,
        updated_at: now
        // share_id auto-generated by the database
      };

      const { data: newEvent, error } = await supabase
        .from('events')
        .insert([duplicatedEvent])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to duplicate event: ${error.message}`);
      }

      toast.success(`"${title}" duplicated successfully!`);
      
      // Refresh the events list
      await fetchSavedEvents();
      
      return newEvent as DatabaseEvent;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate event';
      logger.error('Duplicate event error', 'DASHBOARD', { 
        eventId, 
        userId: user.id, 
        error: errorMessage 
      });
      
      toast.error(errorMessage);
      return null;
    }
  };

  const updateLastUsed = async (eventId: string): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Update last used error', 'DASHBOARD', { 
          eventId, 
          userId: user.id, 
          error: error.message 
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update last used';
      logger.error('Update last used error', 'DASHBOARD', { 
        eventId, 
        userId: user.id, 
        error: errorMessage 
      });
    }
  };

  const refetch = useCallback(async (newOptions?: UseSavedEventsOptions): Promise<void> => {
    const fetchOptions = newOptions ? { ...options, ...newOptions } : options;
    setOptions(fetchOptions);
    await fetchSavedEvents(fetchOptions);
  }, [fetchSavedEvents, options]);

  const hasMore = events.length < totalCount;

  return {
    events,
    loading,
    totalCount,
    deleteEvent,
    duplicateEvent,
    updateLastUsed,
    refetch,
    hasMore
  };
}