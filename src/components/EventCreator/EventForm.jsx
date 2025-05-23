// src/components/EventCreator/EventForm.jsx
'use client';

import { useEventContext } from '@/contexts/EventContext'
import BasicDetails from '../FormSections/BasicDetails'
import EventDetails from '../FormSections/EventDetails'
import CollapsibleSection from '../UI/CollapsibleSection'

export default function EventForm() {
  const { eventData, updateEvent } = useEventContext()

  return (
    <div className="space-y-6">
      {/* Always visible - Basic Details */}
      <div className="card">
        <BasicDetails />
      </div>

      {/* Always visible - Event Details */}
      <div className="card">
        <h3 className="section-title">Event Details</h3>
        <EventDetails />
      </div>
    </div>
  )
}