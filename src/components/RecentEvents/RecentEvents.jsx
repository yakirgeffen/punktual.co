// src/components/RecentEvents/RecentEvents.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRecentEvents } from '@/hooks/useRecentEvents'
import EventCard from './EventCard'
import AuthPrompt from './AuthPrompt'
import { ClockIcon } from 'lucide-react'

export default function RecentEvents() {
  const { user } = useAuth()
  const { events, loading, deleteEvent, duplicateEvent } = useRecentEvents()

  if (!user) {
    return <AuthPrompt />
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <ClockIcon className="w-5 h-5 text-gray-400" />
        <h3 className="section-title mb-0">Recent Events</h3>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent events yet. Create your first event above!</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={() => deleteEvent(event.id)}
              onDuplicate={() => duplicateEvent(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}