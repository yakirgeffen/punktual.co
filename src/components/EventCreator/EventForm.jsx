// src/components/EventCreator/EventForm.jsx
'use client';

import { useState } from 'react';
import { useEventContext } from '@/contexts/EventContext';

export default function EventForm() {
  const { eventData, updateEvent, buttonData, updateButton } = useEventContext();
  const [showOptional, setShowOptional] = useState(false);

  // Progress tracking
  const hasTitle = !!eventData.title?.trim();
  const hasStartDate = !!eventData.startDate;
  const hasStartTime = !!eventData.startTime;
  const hasEndDate = !!eventData.endDate;
  const hasEndTime = !!eventData.endTime;
  const hasPlatforms = Object.values(buttonData.selectedPlatforms || {}).some(Boolean);
  
  const isComplete = hasTitle && hasStartDate && hasStartTime && hasEndDate && hasEndTime && hasPlatforms;
  const completedCount = [hasTitle, hasStartDate, hasStartTime, hasEndDate, hasEndTime, hasPlatforms].filter(Boolean).length;

  // Handle field changes with smart defaults
  const handleFieldChange = (field, value) => {
    updateEvent({ [field]: value });
    
    // Smart defaults
    if (field === 'startDate' && value && !eventData.endDate) {
      updateEvent({ endDate: value });
    }
    if (field === 'startTime' && value && !eventData.endTime) {
      const [hours, minutes] = value.split(':');
      const endHour = parseInt(hours) + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
      updateEvent({ endTime });
    }
  };

  // Platform data using your existing images
  const platforms = [
    { id: 'google', name: 'Google', logo: '/icons/platforms/icon-google.svg' },
    { id: 'apple', name: 'Apple', logo: '/icons/platforms/icon-apple.svg' },
    { id: 'outlook', name: 'Outlook', logo: '/icons/platforms/icon-outlook.svg' },
    { id: 'office365', name: 'O365', logo: '/icons/platforms/icon-office365.svg' },
    { id: 'yahoo', name: 'Yahoo', logo: '/icons/platforms/icon-yahoo.svg' }
  ];

  const togglePlatform = (platformId) => {
    const current = buttonData.selectedPlatforms || {};
    const updated = {
      ...current,
      [platformId]: !current[platformId]
    };
    updateButton({ selectedPlatforms: updated });
  };

  return (
    <div className="space-y-3">
      {/* Progress Header */}
      <div className="bg-white rounded-lg border p-3 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Create Calendar Event</h2>
            <p className="text-xs text-gray-500 mt-1">
              {isComplete ? 'Ready to generate! 🎉' : `${completedCount}/6 fields complete`}
            </p>
          </div>
          <div className="flex space-x-1">
            {[hasTitle, hasStartDate, hasStartTime, hasEndDate, hasEndTime, hasPlatforms].map((completed, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  completed ? 'bg-green-500 shadow-sm' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Essential Fields */}
      <div className="bg-white rounded-lg border p-3 shadow-sm">
        <div className="space-y-3">
          {/* Event Title */}
          <div>
            <div className="flex items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Event Title</label>
              {hasTitle && <span className="ml-2 text-green-500 text-sm">✓</span>}
            </div>
            <input
              type="text"
              value={eventData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Product Launch, Meeting, Webinar..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center mb-1">
                <label className="text-sm font-medium text-gray-700">Start</label>
                {hasStartDate && hasStartTime && <span className="ml-2 text-green-500 text-sm">✓</span>}
              </div>
              <div className="space-y-2">
                <input
                  type="date"
                  value={eventData.startDate || ''}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={eventData.startTime || ''}
                  onChange={(e) => handleFieldChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center mb-1">
                <label className="text-sm font-medium text-gray-700">End</label>
                {hasEndDate && hasEndTime && <span className="ml-2 text-green-500 text-sm">✓</span>}
              </div>
              <div className="space-y-2">
                <input
                  type="date"
                  value={eventData.endDate || ''}
                  onChange={(e) => handleFieldChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={eventData.endTime || ''}
                  onChange={(e) => handleFieldChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Optional Fields Toggle */}
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            <span className="font-medium text-gray-900">Add Description & Location</span>
            <span className="text-gray-500">
              {showOptional ? '▲' : '▼'}
            </span>
          </button>

          {/* Optional Fields */}
          {showOptional && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={eventData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Event details, agenda, or instructions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={eventData.location || ''}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  placeholder="Address or meeting link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform Selection - Only show when event details are complete */}
      {hasTitle && hasStartDate && hasStartTime && hasEndDate && hasEndTime && (
        <div className="bg-white rounded-lg border p-3 shadow-sm">
          <div className="flex items-center mb-3">
            <h3 className="text-base font-semibold text-gray-900">Calendar Platforms</h3>
            {hasPlatforms && <span className="ml-2 text-green-500 text-sm">✓</span>}
          </div>
          
          <p className="text-xs text-gray-500 mb-3">
            Choose which calendar platforms to support
          </p>

          <div className="grid grid-cols-5 gap-2">
            {platforms.map(platform => {
              const isSelected = buttonData.selectedPlatforms?.[platform.id];
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`p-2 rounded-lg border-2 text-center transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={platform.logo} 
                    alt={platform.name}
                    className="w-4 h-4 mx-auto mb-1"
                  />
                  <div className="text-xs font-medium text-gray-700">{platform.name}</div>
                  {isSelected && (
                    <div className="text-green-500 text-xs mt-1">✓</div>
                  )}
                </button>
              );
            })}
          </div>

          {hasPlatforms && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {Object.values(buttonData.selectedPlatforms || {}).filter(Boolean).length} platforms selected
              </span>
            </div>
          )}
        </div>
      )}

      {/* Completion Status */}
      {isComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <div>
              <p className="font-medium text-green-900">Event Ready!</p>
              <p className="text-sm text-green-700">Your calendar button is ready to generate.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}