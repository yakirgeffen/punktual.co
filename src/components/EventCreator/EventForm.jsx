'use client';

import { useState } from 'react';
import { useEventContext } from '@/contexts/EventContext';

export default function EventForm() {
  const { eventData, updateEvent, buttonData, updateButton } = useEventContext();
  const [openSections, setOpenSections] = useState(['event-info']);

  // Validation helpers
  const hasTitle = !!eventData.title?.trim();
  const hasStartDate = !!eventData.startDate;
  const hasStartTime = !!eventData.startTime;
  const hasEndDate = !!eventData.endDate;
  const hasEndTime = !!eventData.endTime;
  const hasPlatforms = Object.values(buttonData.selectedPlatforms || {}).some(Boolean);
  
  const isComplete = hasTitle && hasStartDate && hasStartTime && hasEndDate && hasEndTime && hasPlatforms;

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

  // Platform data
  const platforms = [
    { id: 'google', name: 'Google Calendar' },
    { id: 'apple', name: 'Apple Calendar' },
    { id: 'outlook', name: 'Microsoft Outlook' },
    { id: 'office365', name: 'Office 365' },
    { id: 'yahoo', name: 'Yahoo Calendar' }
  ];

  const handlePlatformChange = (selectedValues) => {
    const selectedPlatforms = {};
    platforms.forEach(platform => {
      selectedPlatforms[platform.id] = selectedValues.includes(platform.name);
    });
    updateButton({ selectedPlatforms });
  };

  const getSelectedPlatforms = () => {
    return platforms
      .filter(platform => buttonData.selectedPlatforms?.[platform.id])
      .map(platform => platform.name);
  };

  const toggleSection = (section) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="space-y-3">
      {/* Compact Event Information */}
      <div className="bg-white border rounded-lg p-4">
        <div className="space-y-3">
          {/* Title Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Event Title *</label>
              <input
                type="text"
                value={eventData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Product Launch, Meeting..."
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={eventData.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder="Address or meeting link"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={eventData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Event details..."
              rows={2}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={eventData.startDate || ''}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Time *</label>
              <input
                type="time"
                value={eventData.startTime || ''}
                onChange={(e) => handleFieldChange('startTime', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                value={eventData.endDate || ''}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Time *</label>
              <input
                type="time"
                value={eventData.endTime || ''}
                onChange={(e) => handleFieldChange('endTime', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Compact Platform Selection */}
      <div className="bg-white border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Calendar Platforms</label>
          {hasPlatforms && (
            <span className="text-xs text-green-600 font-medium">
              {Object.values(buttonData.selectedPlatforms || {}).filter(Boolean).length} selected
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {platforms.map(platform => (
            <label key={platform.id} className="flex items-center space-x-1.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={buttonData.selectedPlatforms?.[platform.id] || false}
                onChange={(e) => {
                  const newPlatforms = { ...buttonData.selectedPlatforms };
                  newPlatforms[platform.id] = e.target.checked;
                  updateButton({ selectedPlatforms: newPlatforms });
                }}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <img 
                src={`/icons/platforms/icon-${platform.id}.svg`} 
                alt={platform.name}
                className="w-3 h-3"
              />
              <span className="text-gray-700">{platform.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ultra Compact Customization */}
      <div className="bg-white border rounded-lg p-3">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Customization</label>
          
          {/* Button Layout - Horizontal */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Layout</label>
            <div className="flex gap-2">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="buttonLayout"
                  value="dropdown"
                  checked={buttonData.buttonLayout !== 'individual'}
                  onChange={(e) => updateButton({ buttonLayout: 'dropdown' })}
                  className="h-3 w-3 text-blue-600"
                />
                <span className="text-xs">Dropdown</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="buttonLayout"
                  value="individual"
                  checked={buttonData.buttonLayout === 'individual'}
                  onChange={(e) => updateButton({ buttonLayout: 'individual' })}
                  className="h-3 w-3 text-blue-600"
                />
                <span className="text-xs">Individual (Popular)</span>
              </label>
            </div>
          </div>

          {/* Style & Size - Horizontal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Style</label>
              <select
                value={buttonData.buttonStyle || 'standard'}
                onChange={(e) => updateButton({ buttonStyle: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="standard">Standard</option>
                <option value="outlined">Outlined</option>
                <option value="minimal">Minimal</option>
                <option value="pill">Pill</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Size</label>
              <select
                value={buttonData.buttonSize || 'medium'}
                onChange={(e) => updateButton({ buttonSize: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Color Picker - Compact */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
            <div className="flex items-center gap-2">
              {[
                { value: '#4D90FF', name: 'Blue' },
                { value: '#34C759', name: 'Green' },
                { value: '#AF52DE', name: 'Purple' },
                { value: '#FF9500', name: 'Orange' },
                { value: '#FF3B30', name: 'Red' }
              ].map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateButton({ colorScheme: color.value })}
                  className={`w-6 h-6 rounded-full border-2 ${
                    buttonData.colorScheme === color.value ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              <input
                type="color"
                value={buttonData.colorScheme || '#4D90FF'}
                onChange={(e) => updateButton({ colorScheme: e.target.value })}
                className="w-6 h-6 rounded border cursor-pointer"
              />
            </div>
          </div>

          {/* Options - Compact */}
          <div className="flex flex-wrap gap-3 text-xs">
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={buttonData.showIcons !== false}
                onChange={(e) => updateButton({ showIcons: e.target.checked })}
                className="h-3 w-3 text-blue-600"
              />
              <span>Icons</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={buttonData.responsive !== false}
                onChange={(e) => updateButton({ responsive: e.target.checked })}
                className="h-3 w-3 text-blue-600"
              />
              <span>Responsive</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={buttonData.openInNewTab !== false}
                onChange={(e) => updateButton({ openInNewTab: e.target.checked })}
                className="h-3 w-3 text-blue-600"
              />
              <span>New Tab</span>
            </label>
          </div>
        </div>
      </div>

      {/* Status */}
      {isComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <div className="text-xs text-green-800 font-medium">✓ Ready to generate!</div>
        </div>
      )}
    </div>
  );
}
