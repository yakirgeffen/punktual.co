'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid3X3, List, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button, Input } from '@heroui/react';
import { useSavedEvents } from '@/hooks/useSavedEvents';
import { useAuth } from '@/hooks/useAuth';
import EventCard from './EventCard';
import EventFilters from './EventFilters';
import EmptyState from './EmptyState';
import { logger } from '@/lib/logger';

type ViewMode = 'grid' | 'list';
type SortBy = 'created_at' | 'title' | 'last_used_at';
type SortOrder = 'asc' | 'desc';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();

  const { 
    events, 
    loading, 
    totalCount, 
    deleteEvent, 
    duplicateEvent, 
    updateLastUsed, 
    refetch 
  } = useSavedEvents({
    searchQuery,
    sortBy,
    sortOrder,
    limit: 20,
    offset: 0
  });

  // Add error boundary for dashboard
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logger.error('Dashboard runtime error', 'DASHBOARD', { 
        error: event.error?.message || event.message 
      });
      setError('Something went wrong loading your events. Please refresh the page.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleSearch = (query: string) => {
    logger.info('Dashboard search', 'DASHBOARD', { query });
    setSearchQuery(query);
  };

  const handleSort = (newSortBy: SortBy, newSortOrder: SortOrder) => {
    logger.info('Dashboard sort', 'DASHBOARD', { sortBy: newSortBy, sortOrder: newSortOrder });
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleDelete = async (eventId: string) => {
    const success = await deleteEvent(eventId);
    if (success) {
      logger.info('Event deleted from dashboard', 'DASHBOARD', { eventId });
    }
  };

  const handleDuplicate = async (eventId: string) => {
    const duplicatedEvent = await duplicateEvent(eventId);
    if (duplicatedEvent) {
      logger.info('Event duplicated from dashboard', 'DASHBOARD', { 
        originalId: eventId, 
        newId: duplicatedEvent.id 
      });
    }
  };

  const handleGenerateCalendar = async (eventId: string) => {
    await updateLastUsed(eventId);
    logger.info('Calendar generated from dashboard', 'DASHBOARD', { eventId });
    // This would redirect to the event creator with the event data loaded
    // For now, we'll just update the last used timestamp
  };

  // Auth guard: show loading state while auth initializes
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // Encourage sign-in when no authenticated user is present
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-white border border-emerald-100 shadow-sm rounded-2xl p-10 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
            🔒
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Sign in to view your events</h2>
          <p className="text-slate-600">
            The dashboard lists the campaigns you have saved. Sign in from the main navigation to
            pick up where you left off.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href="/" className="inline-flex justify-center">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5">
                Go to Homepage
              </Button>
            </Link>
            <Link href="/create" className="inline-flex justify-center">
              <Button variant="ghost" className="text-emerald-600 border border-emerald-200 px-5">
                Start an Event
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            color="primary"
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Events</h1>
            <p className="text-slate-600 mt-2">
              {loading ? 'Loading...' : `${totalCount} saved ${totalCount === 1 ? 'event' : 'events'}`}
            </p>
          </div>
          
          <Link href="/create">
            <Button 
              color="primary" 
              startContent={<Plus size={20} />}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Create New Event
            </Button>
          </Link>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                startContent={<Search size={18} className="text-slate-400" />}
                className="w-full"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                variant="bordered"
                onClick={() => setShowFilters(!showFilters)}
                startContent={<Filter size={16} />}
                className="min-w-0"
              >
                Filters
              </Button>

              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'} transition-colors`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'} transition-colors`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <EventFilters
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSort}
              onClose={() => setShowFilters(false)}
            />
          )}
        </div>

        {/* Events Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
          }>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                viewMode={viewMode}
                onDelete={() => handleDelete(event.id)}
                onDuplicate={() => handleDuplicate(event.id)}
                onGenerateCalendar={() => handleGenerateCalendar(event.id)}
              />
            ))}
          </div>
        )}

        {/* Load More (for future pagination) */}
        {events.length > 0 && events.length < totalCount && (
          <div className="flex justify-center mt-8">
            <Button
              variant="bordered"
              onClick={() => refetch({ offset: events.length })}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Events'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
