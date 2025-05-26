// src/components/FormSections/EventDetails.jsx
'use client';

import { useEventContext } from '@/contexts/EventContext'

export default function EventDetails() {
  const { eventData, updateEvent } = useEventContext()
  
  const handleFieldChange = (field, value) => {
    updateEvent({ [field]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={eventData.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          rows="3"
          className="input-field"
          placeholder="Enter event description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          value={eventData.location || ''}
          onChange={(e) => handleFieldChange('location', e.target.value)}
          type="text"
          className="input-field"
          placeholder="Physical address or virtual meeting link"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organizer
        </label>
        <input
          value={eventData.organizer || ''}
          onChange={(e) => handleFieldChange('organizer', e.target.value)}
          type="text"
          className="input-field"
          placeholder="Your name or organization"
        />
      </div>
    </div>
  )
}