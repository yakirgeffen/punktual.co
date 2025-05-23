// src/components/EventCreator/EventForm.jsx
'use client';

import { useEventContext } from '@/contexts/EventContext'

export default function EventForm() {
  const { eventData, updateEvent } = useEventContext()

  const handleChange = (field, value) => {
    updateEvent({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Basic Details Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={eventData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter event title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={eventData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={eventData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={eventData.isAllDay}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAllDay"
              checked={eventData.isAllDay}
              onChange={(e) => handleChange('isAllDay', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isAllDay" className="ml-2 block text-sm text-gray-700">
              All-day event
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}