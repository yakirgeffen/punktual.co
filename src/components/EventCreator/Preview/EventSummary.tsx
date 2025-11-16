/**
 * EventSummary.tsx
 * Displays event details in preview panel
 * Extracted from UnifiedPreview for reusability
 */

'use client';

import React from 'react';
import type { EventData } from '@/types';

interface EventSummaryProps {
  eventData: EventData;
}

const EventSummary: React.FC<EventSummaryProps> = ({ eventData }) => {
  // Format date/time for display
  const formatDateTime = () => {
    if (!eventData?.startDate) return null;

    try {
      const startDate = new Date(eventData.startDate);
      const dateStr = startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Handle all-day events
      if (eventData.isAllDay) {
        if (eventData.endDate && eventData.endDate !== eventData.startDate) {
          const endDate = new Date(eventData.endDate);
          const endDateStr = endDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          return `${dateStr} - ${endDateStr} (All day)`;
        }
        return `${dateStr} (All day)`;
      }

      // Handle regular events with time
      if (!eventData.startTime) return dateStr;

      const [hours, minutes] = eventData.startTime.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      const timeStr = `${hour12}:${minutes} ${ampm}`;

      // Include end time if different day or show time range
      if (eventData.endDate && eventData.endTime) {
        const endDate = new Date(eventData.endDate);
        const isSameDay = startDate.toDateString() === endDate.toDateString();

        if (isSameDay) {
          const [endHours, endMinutes] = eventData.endTime.split(':');
          const endHour = parseInt(endHours, 10);
          const endAmpm = endHour >= 12 ? 'PM' : 'AM';
          const endHour12 = endHour % 12 || 12;
          const endTimeStr = `${endHour12}:${endMinutes} ${endAmpm}`;

          return `${dateStr}, ${timeStr} - ${endTimeStr}`;
        } else {
          const endDateStr = endDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          return `${dateStr} ${timeStr} - ${endDateStr}`;
        }
      }

      return `${dateStr}, ${timeStr}`;
    } catch {
      return null;
    }
  };

  const formattedDateTime = formatDateTime();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="space-y-3">
        {/* Title */}
        {eventData?.title && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 break-words leading-tight">
              {eventData.title}
            </h2>
          </div>
        )}

        {/* Date & Time */}
        {formattedDateTime && (
          <div className="flex items-start gap-2.5 text-gray-700">
            <span className="text-base mt-0.5">🕒</span>
            <p className="font-medium text-sm flex-1">{formattedDateTime}</p>
          </div>
        )}

        {/* Location */}
        {eventData?.location && (
          <div className="flex items-start gap-2.5 text-gray-700">
            <span className="text-base mt-0.5">📍</span>
            <span className="text-sm break-words flex-1">{eventData.location}</span>
          </div>
        )}

        {/* Description */}
        {eventData?.description && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-gray-600 text-sm whitespace-pre-wrap break-words leading-relaxed">
              {eventData.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSummary;
