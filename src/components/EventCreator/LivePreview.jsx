// src/components/EventCreator/LivePreview.jsx
'use client';

import React from 'react';
import { useEventContext } from '../../contexts/EventContext';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon } from 'lucide-react';

const LivePreview = () => {
  const { eventData } = useEventContext();

  // Smart placeholder functions
  const getDisplayTitle = () => {
    return eventData.title?.trim() || 'Your Event Title';
  };

  const getDisplayDate = () => {
    if (eventData.startDate) {
      const date = new Date(eventData.startDate);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Event Date';
  };

  const getDisplayTime = () => {
    if (eventData.isAllDay) {
      return 'All Day';
    }
    
    if (eventData.startTime && eventData.endTime) {
      const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      };
      
      return `${formatTime(eventData.startTime)} - ${formatTime(eventData.endTime)}`;
    }
    
    if (eventData.startTime) {
      const [hours, minutes] = eventData.startTime.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    
    return '10:00 AM - 11:00 AM';
  };

  const getDisplayLocation = () => {
    return eventData.location?.trim() || 'Event Location';
  };

  const getDisplayDescription = () => {
    return eventData.description?.trim() || 'Join us for this exciting event! More details will be provided closer to the date.';
  };

  const getDisplayOrganizer = () => {
    return eventData.organizer?.trim() || 'Event Organizer';
  };

  // Determine if we have enough data for a realistic preview
  const hasMinimalData = eventData.title?.trim() || eventData.startDate || eventData.startTime;
  
  // Style classes based on whether data is real or placeholder
  const getTitleClass = () => {
    return eventData.title?.trim() 
      ? 'text-2xl font-bold text-gray-900' 
      : 'text-2xl font-bold text-gray-400 italic';
  };

  const getDetailClass = (hasRealData) => {
    return hasRealData 
      ? 'text-gray-600' 
      : 'text-gray-400 italic';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Preview Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Live Preview
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          See how your event will appear to attendees
        </p>
      </div>

      {/* Event Preview Card */}
      <div className="p-6">
        <div className="border rounded-lg p-6 bg-gray-50">
          {/* Event Title */}
          <h1 className={getTitleClass()}>
            {getDisplayTitle()}
          </h1>

          {/* Event Details Grid */}
          <div className="mt-4 space-y-3">
            {/* Date & Time */}
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
              <div>
                <div className={getDetailClass(eventData.startDate)}>
                  {getDisplayDate()}
                </div>
                <div className={getDetailClass(eventData.startTime || eventData.isAllDay)}>
                  {getDisplayTime()}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
              <div className={getDetailClass(eventData.location?.trim())}>
                {getDisplayLocation()}
              </div>
            </div>

            {/* Organizer */}
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
              <div className={getDetailClass(eventData.organizer?.trim())}>
                Organized by {getDisplayOrganizer()}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">About this event</h3>
            <div className={getDetailClass(eventData.description?.trim())}>
              {getDisplayDescription()}
            </div>
          </div>

          {/* Add to Calendar Button Preview */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Add to Calendar
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Button will work with Google, Apple, Outlook, and other calendar platforms
            </p>
          </div>
        </div>

        {/* Preview Status */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {hasMinimalData ? (
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              ) : (
                <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                {hasMinimalData ? (
                  <>
                    <span className="font-medium">Preview active:</span> Add more details to see a complete preview
                  </>
                ) : (
                  <>
                    <span className="font-medium">Using placeholder data:</span> Start filling the form to see your event preview
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Field Completion Checklist */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Event Completion</h4>
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <div className={`h-1.5 w-1.5 rounded-full mr-2 ${eventData.title?.trim() ? 'bg-green-400' : 'bg-gray-300'}`}></div>
              <span className={eventData.title?.trim() ? 'text-gray-900' : 'text-gray-500'}>Event title</span>
            </div>
            <div className="flex items-center text-sm">
              <div className={`h-1.5 w-1.5 rounded-full mr-2 ${eventData.startDate ? 'bg-green-400' : 'bg-gray-300'}`}></div>
              <span className={eventData.startDate ? 'text-gray-900' : 'text-gray-500'}>Event date</span>
            </div>
            <div className="flex items-center text-sm">
              <div className={`h-1.5 w-1.5 rounded-full mr-2 ${eventData.startTime || eventData.isAllDay ? 'bg-green-400' : 'bg-gray-300'}`}></div>
              <span className={eventData.startTime || eventData.isAllDay ? 'text-gray-900' : 'text-gray-500'}>Event time</span>
            </div>
            <div className="flex items-center text-sm">
              <div className={`h-1.5 w-1.5 rounded-full mr-2 ${eventData.location?.trim() ? 'bg-green-400' : 'bg-gray-300'}`}></div>
              <span className={eventData.location?.trim() ? 'text-gray-900' : 'text-gray-500'}>Location</span>
            </div>
            <div className="flex items-center text-sm">
              <div className={`h-1.5 w-1.5 rounded-full mr-2 ${eventData.description?.trim() ? 'bg-green-400' : 'bg-gray-300'}`}></div>
              <span className={eventData.description?.trim() ? 'text-gray-900' : 'text-gray-500'}>Description</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;