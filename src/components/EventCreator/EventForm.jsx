'use client';
import { useState } from 'react';
import { useEventContext } from '@/contexts/EventContext';
import { Input, Select, SelectItem, Checkbox, Card, CardBody, Chip, Accordion, AccordionItem, Switch } from '@heroui/react';
import { ChevronDown } from 'lucide-react';

export default function EventForm() {
  const { eventData, updateEvent, buttonData, updateButton } = useEventContext();
  const [selectedPlatformKeys, setSelectedPlatformKeys] = useState(new Set());

  // Validation helpers
  const hasTitle = !!eventData.title?.trim();
  const hasStartDate = !!eventData.startDate;
  const hasStartTime = !!eventData.startTime || eventData.isAllDay;
  const hasEndDate = !!eventData.endDate;
  const hasEndTime = !!eventData.endTime || eventData.isAllDay;
  const hasPlatforms = Object.values(buttonData.selectedPlatforms || {}).some(Boolean);
  
  const isComplete = hasTitle && hasStartDate && hasStartTime && hasEndDate && hasEndTime && hasPlatforms;

  // Handle field changes with smart defaults
  const handleFieldChange = (field, value) => {
    updateEvent({ [field]: value });
    
    // Smart defaults
    if (field === 'startDate' && value && !eventData.endDate) {
      updateEvent({ endDate: value });
    }
    if (field === 'startTime' && value && !eventData.endTime && !eventData.isAllDay) {
      const [hours, minutes] = value.split(':');
      const endHour = parseInt(hours) + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
      updateEvent({ endTime });
    }
  };

  // Timezone data (major cities)
  const timezones = [
    { value: 'America/New_York', label: 'New York (Eastern Time)' },
    { value: 'America/Chicago', label: 'Chicago (Central Time)' },
    { value: 'America/Denver', label: 'Denver (Mountain Time)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
    { value: 'America/Toronto', label: 'Toronto (Eastern Time)' },
    { value: 'America/Vancouver', label: 'Vancouver (Pacific Time)' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' }
  ];

  // Reminder options
  const reminderOptions = [
    { value: '0', label: 'At event time' },
    { value: '5', label: '5 minutes before' },
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '120', label: '2 hours before' },
    { value: '1440', label: '1 day before' },
    { value: '2880', label: '2 days before' },
    { value: '10080', label: '1 week before' }
  ];

  // Platform data
  const platforms = [
    { id: 'google', name: 'Google Calendar' },
    { id: 'apple', name: 'Apple Calendar' },
    { id: 'outlook', name: 'Microsoft Outlook' },
    { id: 'office365', name: 'Office 365' },
    { id: 'yahoo', name: 'Yahoo Calendar' }
  ];

  // Handle platform selection change
  const handlePlatformSelectionChange = (keys) => {
    const selectedArray = Array.from(keys);
    const selectedPlatforms = {};
    
    platforms.forEach(platform => {
      selectedPlatforms[platform.id] = selectedArray.includes(platform.id);
    });
    
    updateButton({ selectedPlatforms });
    setSelectedPlatformKeys(keys);
  };

  // Get selected platform keys
  const getSelectedPlatformKeys = () => {
    const selected = platforms
      .filter(platform => buttonData.selectedPlatforms?.[platform.id])
      .map(platform => platform.id);
    return new Set(selected);
  };

  // Generate recurrence description
  const getRecurrenceDescription = () => {
    if (!eventData.isRecurring) return '';
    
    const { recurrencePattern, recurrenceCount = 1, weeklyDays = [], monthlyOption, monthlyWeekday, monthlyWeekdayOrdinal, yearlyMonth } = eventData;
    
    let description = 'Repeats ';
    
    switch (recurrencePattern) {
      case 'daily':
        description += `daily for ${recurrenceCount} occurrence${recurrenceCount > 1 ? 's' : ''}`;
        break;
      case 'weekly':
        if (weeklyDays.length > 0) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const selectedDays = weeklyDays.map(day => dayNames[day]).join(', ');
          description += `weekly on ${selectedDays} for ${recurrenceCount} occurrence${recurrenceCount > 1 ? 's' : ''}`;
        } else {
          description += `weekly for ${recurrenceCount} occurrence${recurrenceCount > 1 ? 's' : ''}`;
        }
        break;
      case 'monthly':
        if (monthlyOption === 'date') {
          description += `monthly on the same date for ${recurrenceCount} occurrence${recurrenceCount > 1 ? 's' : ''}`;
        } else if (monthlyOption === 'weekday' && monthlyWeekday && monthlyWeekdayOrdinal) {
          const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'last'];
          const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          description += `monthly on the ${ordinals[monthlyWeekdayOrdinal]} ${weekdays[monthlyWeekday]} for ${recurrenceCount} occurrence${recurrenceCount > 1 ? 's' : ''}`;
        }
        break;
      case 'yearly':
        description += `yearly for ${recurrenceCount} occurrence${recurrenceCount > 1 ? 's' : ''}`;
        break;
      default:
        description = '';
    }
    
    return description;
  };

  return (
    <div className="space-y-4 pt-4">
      {/* Event Title */}
      <Card>
        <CardBody className="p-4">
          <Input
            label="Event Title"
            placeholder="Product Launch, Team Meeting, Conference..."
            value={eventData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            isRequired
            size="sm"
            classNames={{
              label: "text-sm font-medium",
              input: "text-base"
            }}
          />
        </CardBody>
      </Card>

      {/* Event Details Accordion */}
      <Accordion variant="bordered" defaultExpandedKeys={["event-details"]}>
        <AccordionItem key="event-details" title="Event Details" classNames={{ title: "text-sm font-medium" }}>
          <div className="space-y-4 pb-4">
            {/* Date, Time & Timezone */}
            <div className="space-y-4">
              {/* All Day Toggle */}
              <Switch
                isSelected={eventData.isAllDay || false}
                onValueChange={(checked) => handleFieldChange('isAllDay', checked)}
                size="sm"
              >
                <span className="text-sm">All day event</span>
              </Switch>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Input
                    type="date"
                    label="Start Date"
                    value={eventData.startDate || ''}
                    onChange={(e) => handleFieldChange('startDate', e.target.value)}
                    isRequired
                    size="sm"
                  />
                  {!eventData.isAllDay && (
                    <Input
                      type="time"
                      label="Start Time"
                      value={eventData.startTime || ''}
                      onChange={(e) => handleFieldChange('startTime', e.target.value)}
                      isRequired={!eventData.isAllDay}
                      size="sm"
                    />
                  )}
                </div>
                <div className="space-y-3">
                  <Input
                    type="date"
                    label="End Date"
                    value={eventData.endDate || ''}
                    onChange={(e) => handleFieldChange('endDate', e.target.value)}
                    isRequired
                    size="sm"
                  />
                  {!eventData.isAllDay && (
                    <Input
                      type="time"
                      label="End Time"
                      value={eventData.endTime || ''}
                      onChange={(e) => handleFieldChange('endTime', e.target.value)}
                      isRequired={!eventData.isAllDay}
                      size="sm"
                    />
                  )}
                </div>
              </div>

              {/* Timezone Selection */}
              <Select
                label="Timezone"
                placeholder="Select timezone"
                selectedKeys={[eventData.timezone || 'UTC']}
                onSelectionChange={(keys) => handleFieldChange('timezone', Array.from(keys)[0])}
                size="sm"
              >
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Recurring Event */}
            <div className="space-y-3">
              <Switch
                isSelected={eventData.isRecurring || false}
                onValueChange={(checked) => handleFieldChange('isRecurring', checked)}
                size="sm"
              >
                <span className="text-sm">Recurring event</span>
              </Switch>

              {eventData.isRecurring && (
                <div className="space-y-3 ml-6 pl-4 border-l-2 border-blue-200">
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Repeat"
                      selectedKeys={[eventData.recurrencePattern || 'weekly']}
                      onSelectionChange={(keys) => handleFieldChange('recurrencePattern', Array.from(keys)[0])}
                      size="sm"
                    >
                      <SelectItem key="daily">Daily</SelectItem>
                      <SelectItem key="weekly">Weekly</SelectItem>
                      <SelectItem key="monthly">Monthly</SelectItem>
                      <SelectItem key="yearly">Yearly</SelectItem>
                    </Select>

                    <Input
                      type="number"
                      label="Number of occurrences"
                      min={1}
                      max={999}
                      value={eventData.recurrenceCount?.toString() || '1'}
                      onChange={(e) => handleFieldChange('recurrenceCount', parseInt(e.target.value) || 1)}
                      size="sm"
                    />
                  </div>

                  {/* Weekly Days Selection */}
                  {eventData.recurrencePattern === 'weekly' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Repeat on days</label>
                      <div className="flex gap-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              const currentDays = eventData.weeklyDays || [];
                              const newDays = currentDays.includes(index) 
                                ? currentDays.filter(d => d !== index)
                                : [...currentDays, index];
                              handleFieldChange('weeklyDays', newDays);
                            }}
                            className={`w-8 h-8 rounded-full text-xs font-medium ${
                              (eventData.weeklyDays || []).includes(index)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly Options */}
                  {eventData.recurrencePattern === 'monthly' && (
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="monthlyOption"
                            value="date"
                            checked={eventData.monthlyOption === 'date' || !eventData.monthlyOption}
                            onChange={() => handleFieldChange('monthlyOption', 'date')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Same date each month</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="monthlyOption"
                            value="weekday"
                            checked={eventData.monthlyOption === 'weekday'}
                            onChange={() => handleFieldChange('monthlyOption', 'weekday')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Same weekday pattern</span>
                        </label>
                      </div>

                      {eventData.monthlyOption === 'weekday' && (
                        <div className="grid grid-cols-2 gap-3">
                          <Select
                            label="Which occurrence"
                            selectedKeys={[eventData.monthlyWeekdayOrdinal?.toString() || '0']}
                            onSelectionChange={(keys) => handleFieldChange('monthlyWeekdayOrdinal', parseInt(Array.from(keys)[0]))}
                            size="sm"
                          >
                            <SelectItem key="0">First</SelectItem>
                            <SelectItem key="1">Second</SelectItem>
                            <SelectItem key="2">Third</SelectItem>
                            <SelectItem key="3">Fourth</SelectItem>
                            <SelectItem key="4">Fifth</SelectItem>
                            <SelectItem key="5">Last</SelectItem>
                          </Select>
                          <Select
                            label="Day of week"
                            selectedKeys={[eventData.monthlyWeekday?.toString() || '0']}
                            onSelectionChange={(keys) => handleFieldChange('monthlyWeekday', parseInt(Array.from(keys)[0]))}
                            size="sm"
                          >
                            <SelectItem key="0">Sunday</SelectItem>
                            <SelectItem key="1">Monday</SelectItem>
                            <SelectItem key="2">Tuesday</SelectItem>
                            <SelectItem key="3">Wednesday</SelectItem>
                            <SelectItem key="4">Thursday</SelectItem>
                            <SelectItem key="5">Friday</SelectItem>
                            <SelectItem key="6">Saturday</SelectItem>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recurrence Description */}
                  {getRecurrenceDescription() && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">{getRecurrenceDescription()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Event Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Description</label>
              <textarea
                value={eventData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe your event..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Location */}
            <Input
              label="Location"
              placeholder="Venue address or online meeting link"
              value={eventData.location || ''}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              size="sm"
            />

            {/* Host Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Host Name"
                placeholder="Event organizer name"
                value={eventData.hostName || ''}
                onChange={(e) => handleFieldChange('hostName', e.target.value)}
                size="sm"
              />
              <Input
                type="email"
                label="Host Email"
                placeholder="organizer@company.com"
                value={eventData.hostEmail || ''}
                onChange={(e) => handleFieldChange('hostEmail', e.target.value)}
                size="sm"
              />
            </div>

            {/* Reminder */}
            <Select
              label="Remind attendees"
              placeholder="Select reminder time"
              selectedKeys={[eventData.reminderTime || '15']}
              onSelectionChange={(keys) => handleFieldChange('reminderTime', Array.from(keys)[0])}
              size="sm"
            >
              {reminderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </AccordionItem>
      </Accordion>

      {/* Platform Selection */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Calendar Platforms</label>
            {hasPlatforms && (
              <Chip size="sm" color="success" variant="flat">
                {Object.values(buttonData.selectedPlatforms || {}).filter(Boolean).length} selected
              </Chip>
            )}
          </div>
          
          <Select
            placeholder="Select calendar platforms"
            selectionMode="multiple"
            selectedKeys={getSelectedPlatformKeys()}
            onSelectionChange={handlePlatformSelectionChange}
            size="sm"
            isRequired
          >
            {platforms.map((platform) => (
              <SelectItem key={platform.id} value={platform.id}>
                {platform.name}
              </SelectItem>
            ))}
          </Select>
        </CardBody>
      </Card>

      {/* Customization */}
      <Card>
        <CardBody className="p-4">
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Button Customization</label>
            
            {/* Layout Options */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">Layout Style</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="buttonLayout"
                    value="dropdown"
                    checked={buttonData.buttonLayout !== 'individual'}
                    onChange={() => updateButton({ buttonLayout: 'dropdown' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Dropdown</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="buttonLayout"
                    value="individual"
                    checked={buttonData.buttonLayout === 'individual'}
                    onChange={() => updateButton({ buttonLayout: 'individual' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Individual</span>
                  <Chip size="sm" color="primary" variant="flat" className="ml-1">Popular</Chip>
                </label>
              </div>
            </div>

            {/* Style & Size */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Button Style"
                selectedKeys={[buttonData.buttonStyle || 'standard']}
                onSelectionChange={(keys) => updateButton({ buttonStyle: Array.from(keys)[0] })}
                size="sm"
              >
                <SelectItem key="standard">Standard</SelectItem>
                <SelectItem key="outlined">Outlined</SelectItem>
                <SelectItem key="minimal">Minimal</SelectItem>
                <SelectItem key="pill">Pill</SelectItem>
              </Select>

              <Select
                label="Button Size"
                selectedKeys={[buttonData.buttonSize || 'medium']}
                onSelectionChange={(keys) => updateButton({ buttonSize: Array.from(keys)[0] })}
                size="sm"
              >
                <SelectItem key="small">Small</SelectItem>
                <SelectItem key="medium">Medium</SelectItem>
                <SelectItem key="large">Large</SelectItem>
              </Select>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">Button Color</label>
              <div className="flex items-center gap-3">
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
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      buttonData.colorScheme === color.value ? 'border-gray-800 ring-2 ring-blue-200' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
                <input
                  type="color"
                  value={buttonData.colorScheme || '#4D90FF'}
                  onChange={(e) => updateButton({ colorScheme: e.target.value })}
                  className="w-8 h-8 rounded border cursor-pointer"
                  title="Custom color"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="block text-xs text-gray-600 mb-2">Additional Options</label>
              <div className="flex flex-wrap gap-4">
                <Checkbox
                  isSelected={buttonData.showIcons !== false}
                  onValueChange={(checked) => updateButton({ showIcons: checked })}
                  size="sm"
                >
                  <span className="text-sm">Show icons</span>
                </Checkbox>
                <Checkbox
                  isSelected={buttonData.responsive !== false}
                  onValueChange={(checked) => updateButton({ responsive: checked })}
                  size="sm"
                >
                  <span className="text-sm">Responsive design</span>
                </Checkbox>
                <Checkbox
                  isSelected={buttonData.openInNewTab !== false}
                  onValueChange={(checked) => updateButton({ openInNewTab: checked })}
                  size="sm"
                >
                  <span className="text-sm">Open in new tab</span>
                </Checkbox>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Status */}
      {isComplete && (
        <Card className="border-success bg-success-50">
          <CardBody className="p-3">
            <div className="flex items-center gap-2 text-success-800">
              <span className="text-sm">✓</span>
              <span className="text-sm font-medium">Ready to generate your calendar button!</span>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}