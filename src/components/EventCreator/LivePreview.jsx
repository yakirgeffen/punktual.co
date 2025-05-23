// src/components/EventCreator/LivePreview.jsx
'use client';

import { useEventContext } from '@/contexts/EventContext'

export default function LivePreview() {
  const { eventData, buttonData } = useEventContext()

  // Format event date and time display
  const formatEventDateTime = (eventData) => {
    if (!eventData.startDate) return '';
    
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    const isSameDay = eventData.startDate === eventData.endDate;
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    if (eventData.isAllDay) {
      // All-day events
      if (isSameDay) {
        return formatDate(startDate);
      } else {
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
    } else {
      // Timed events
      if (isSameDay) {
        return `${formatDate(startDate)} at ${formatTime(eventData.startTime)} - ${formatTime(eventData.endTime)}`;
      } else {
        return `${formatDate(startDate)} at ${formatTime(eventData.startTime)} - ${formatDate(endDate)} at ${formatTime(eventData.endTime)}`;
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Live Preview</h2>

      {/* Button Preview */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Button Preview</h3>
        <div className="bg-gray-50 p-8 rounded-lg border-2 border-dashed border-gray-200 text-center">
          <button
            className="inline-flex items-center font-semibold px-4 py-2.5 rounded-md transition-colors"
            style={{
              backgroundColor: buttonData.colorScheme,
              color: '#FFFFFF'
            }}
          >
            📅 Add to Calendar
          </button>
        </div>
      </div>

      {/* Event Summary */}
      {eventData.title && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Event Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">{eventData.title}</h4>
            {eventData.startDate && (
              <p className="text-sm text-gray-600 mt-1">
                {formatEventDateTime(eventData)}
              </p>
            )}
            {eventData.location && (
              <p className="text-sm text-gray-600 mt-1">
                📍 {eventData.location}
              </p>
            )}
            {eventData.description && (
              <p className="text-sm text-gray-700 mt-2">{eventData.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Selected Platforms */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Platforms</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(buttonData.selectedPlatforms)
            .filter(([_, selected]) => selected)
            .map(([key, _]) => (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            ))}
        </div>
      </div>
    </div>
  )
}