import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from './useAuth';
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

interface UseRecentEventsReturn {
  events: DatabaseEvent[];
  loading: boolean;
  deleteEvent: (eventId: string) => Promise<boolean>;
  duplicateEvent: (eventId: string) => Promise<DatabaseEvent>;
  refetch: () => Promise<void>;
}

export function useRecentEvents(): UseRecentEventsReturn {
  const [events, setEvents] = useState<DatabaseEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  const fetchRecentEvents = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_used_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching recent events:', error);
      toast.error('Failed to load recent events');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchRecentEvents();
    } else {
      setEvents([]);
      setLoading(false);
    }
  }, [user, fetchRecentEvents]);

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const duplicateEvent = async (eventId: string): Promise<DatabaseEvent> => {
    try {
      const eventToDuplicate = events.find(event => event.id === eventId);
      if (!eventToDuplicate) throw new Error('Event not found');

      // Check usage limits
      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('events_created')
        .eq('user_id', user?.id)
        .eq('month', new Date().toISOString().slice(0, 7) + '-01')
        .single();

      if (usageError && usageError.code !== 'PGRST116') throw usageError;

      const currentUsage = (usageData as UsageData)?.events_created || 0;
      if (currentUsage >= 5) {
        throw new Error('You have reached your monthly limit of 5 events');
      }

      // Create duplicate event
      const { title, description, location, organizer, ...eventData } = eventToDuplicate;
      const duplicatedEvent = {
        ...eventData,
        title: `${title} (Copy)`,
        description,
        location,
        organizer,
        user_id: user?.id,
        share_id: null // Will be auto-generated
      };

      const { data: newEvent, error } = await supabase
        .from('events')
        .insert([duplicatedEvent])
        .select()
        .single();

      if (error) throw error;

      // Update usage tracking
      await supabase.rpc('increment_usage', {
        user_id: user?.id,
        month: new Date().toISOString().slice(0, 7) + '-01'
      });

      await fetchRecentEvents();
      return newEvent as DatabaseEvent;
    } catch (error) {
      console.error('Error duplicating event:', error);
      throw error;
    }
  };

  return {
    events,
    loading,
    deleteEvent,
    duplicateEvent,
    refetch: fetchRecentEvents
  };
}