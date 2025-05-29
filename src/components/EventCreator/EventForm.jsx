'use client';
import { useState, useEffect, useMemo } from 'react';
import { useEventContext } from '@/contexts/EventContext';
import { Input, Select, SelectItem, Checkbox, Card, CardBody, Chip, Accordion, AccordionItem, Switch, Autocomplete, AutocompleteItem } from '@heroui/react';
import { ChevronDown } from 'lucide-react';

export default function EventForm() {
  const { eventData, updateEvent, buttonData, updateButton } = useEventContext();
  const [selectedPlatformKeys, setSelectedPlatformKeys] = useState(new Set());
  const [timezoneSearch, setTimezoneSearch] = useState('');

  // Validation helpers
  const hasTitle = !!eventData.title?.trim();
  const hasStartDate = !!eventData.startDate;
  const hasStartTime = !!eventData.startTime || eventData.isAllDay;
  const hasEndDate = !!eventData.endDate;
  const hasEndTime = !!eventData.endTime || eventData.isAllDay;
  const hasPlatforms = Object.values(buttonData.selectedPlatforms || {}).some(Boolean);
  
  // Date validation
  const isValidDateRange = useMemo(() => {
    if (!eventData.startDate || !eventData.endDate) return true;
    
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    
    if (eventData.startDate === eventData.endDate) {
      // Same day - check times if not all day
      if (!eventData.isAllDay && eventData.startTime && eventData.endTime) {
        return eventData.startTime <= eventData.endTime;
      }
      return true;
    }
    
    return startDate <= endDate;
  }, [eventData.startDate, eventData.endDate, eventData.startTime, eventData.endTime, eventData.isAllDay]);
  
  const isComplete = hasTitle && hasStartDate && hasStartTime && hasEndDate && hasEndTime && hasPlatforms && isValidDateRange;

  // Handle field changes with smart defaults and validation
  const handleFieldChange = (field, value) => {
    updateEvent({ [field]: value });
    
    // Smart defaults
    if (field === 'startDate' && value) {
      // Set end date to start date if not set or if end date is before start date
      if (!eventData.endDate || new Date(value) > new Date(eventData.endDate)) {
        updateEvent({ endDate: value });
      }
    }
    
    if (field === 'startTime' && value && !eventData.isAllDay) {
      // Set end time to 1 hour later if not set or if end time is before start time (same day)
      if (!eventData.endTime || (eventData.startDate === eventData.endDate && value >= eventData.endTime)) {
        const [hours, minutes] = value.split(':');
        const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
        const endMinutes = startMinutes + 60; // Add 1 hour
        const endHour = Math.floor(endMinutes / 60) % 24;
        const endMin = endMinutes % 60;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
        updateEvent({ endTime });
      }
    }

    if (field === 'isAllDay' && value) {
      // Clear times when switching to all-day
      updateEvent({ startTime: '', endTime: '' });
    }
  };

  // Comprehensive timezone data with major cities
  const timezones = [
    // North America
    { value: 'America/New_York', label: 'New York (Eastern Time)', search: 'new york eastern est edt' },
    { value: 'America/Chicago', label: 'Chicago (Central Time)', search: 'chicago central cst cdt' },
    { value: 'America/Denver', label: 'Denver (Mountain Time)', search: 'denver mountain mst mdt' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time)', search: 'los angeles pacific pst pdt california' },
    { value: 'America/Toronto', label: 'Toronto (Eastern Time)', search: 'toronto eastern canada' },
    { value: 'America/Vancouver', label: 'Vancouver (Pacific Time)', search: 'vancouver pacific canada' },
    { value: 'America/Phoenix', label: 'Phoenix (Mountain Time)', search: 'phoenix arizona mountain' },
    { value: 'America/Anchorage', label: 'Anchorage (Alaska Time)', search: 'anchorage alaska akst akdt' },
    { value: 'Pacific/Honolulu', label: 'Honolulu (Hawaii Time)', search: 'honolulu hawaii hst' },
    
    // Europe
    { value: 'Europe/London', label: 'London (GMT)', search: 'london uk britain gmt bst greenwich' },
    { value: 'Europe/Paris', label: 'Paris (CET)', search: 'paris france cet cest' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)', search: 'berlin germany cet cest' },
    { value: 'Europe/Rome', label: 'Rome (CET)', search: 'rome italy cet cest' },
    { value: 'Europe/Madrid', label: 'Madrid (CET)', search: 'madrid spain cet cest' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)', search: 'amsterdam netherlands cet cest' },
    { value: 'Europe/Stockholm', label: 'Stockholm (CET)', search: 'stockholm sweden cet cest' },
    { value: 'Europe/Vienna', label: 'Vienna (CET)', search: 'vienna austria cet cest' },
    { value: 'Europe/Zurich', label: 'Zurich (CET)', search: 'zurich switzerland cet cest' },
    { value: 'Europe/Dublin', label: 'Dublin (GMT)', search: 'dublin ireland gmt ist' },
    { value: 'Europe/Helsinki', label: 'Helsinki (EET)', search: 'helsinki finland eet eest' },
    { value: 'Europe/Athens', label: 'Athens (EET)', search: 'athens greece eet eest' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)', search: 'moscow russia msk' },
    
    // Asia Pacific
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', search: 'tokyo japan jst' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)', search: 'shanghai china beijing cst' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', search: 'hong kong hkt' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)', search: 'singapore sgt' },
    { value: 'Asia/Seoul', label: 'Seoul (KST)', search: 'seoul south korea kst' },
    { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', search: 'bangkok thailand ict' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)', search: 'dubai uae emirates gst' },
    { value: 'Asia/Kolkata', label: 'Mumbai/Delhi (IST)', search: 'mumbai delhi india kolkata ist' },
    { value: 'Asia/Karachi', label: 'Karachi (PKT)', search: 'karachi pakistan pkt' },
    { value: 'Asia/Jakarta', label: 'Jakarta (WIB)', search: 'jakarta indonesia wib' },
    { value: 'Asia/Manila', label: 'Manila (PHT)', search: 'manila philippines pht' },
    
    // Australia & Oceania
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)', search: 'sydney australia aedt aest' },
    { value: 'Australia/Melbourne', label: 'Melbourne (AEDT)', search: 'melbourne australia aedt aest' },
    { value: 'Australia/Perth', label: 'Perth (AWST)', search: 'perth australia awst' },
    { value: 'Australia/Brisbane', label: 'Brisbane (AEST)', search: 'brisbane australia aest' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT)', search: 'auckland new zealand nzdt nzst' },
    
    // South America
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', search: 'sao paulo brazil brt brst' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)', search: 'buenos aires argentina art' },
    { value: 'America/Santiago', label: 'Santiago (CLT)', search: 'santiago chile clt clst' },
    { value: 'America/Lima', label: 'Lima (PET)', search: 'lima peru pet' },
    { value: 'America/Bogota', label: 'Bogotá (COT)', search: 'bogota colombia cot' },
    
    // Africa & Middle East
    { value: 'Africa/Cairo', label: 'Cairo (EET)', search: 'cairo egypt eet eest' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', search: 'johannesburg south africa sast' },
    { value: 'Africa/Lagos', label: 'Lagos (WAT)', search: 'lagos nigeria wat' },
    { value: 'Asia/Jerusalem', label: 'Jerusalem (IST)', search: 'jerusalem israel ist idt' },
    { value: 'Asia/Riyadh', label: 'Riyadh (AST)', search: 'riyadh saudi arabia ast' },
    
    // UTC
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', search: 'utc coordinated universal time gmt' }
  ];

  // Filter timezones based on search
  const filteredTimezones = useMemo(() => {
    if (!timezoneSearch.trim()) return timezones;
    
    const searchLower = timezoneSearch.toLowerCase();
    return timezones.filter(tz => 
      tz.label.toLowerCase().includes(searchLower) || 
      tz.search.toLowerCase().includes(searchLower)
    );
  }, [timezoneSearch]);

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

  // Generate recurrence description with enhanced logic
  const getRecurrenceDescription = () => {
    if (!eventData.isRecurring) return '';
    
    const { 
      recurrencePattern, 
      recurrenceCount = 1, 
      weeklyDays = [], 
      monthlyOption = 'date',
      monthlyWeekday = 0, 
      monthlyWeekdayOrdinal = 0,
      yearlyMonth = 0,
      recurrenceInterval = 1
    } = eventData;
    
    let description = 'Repeats ';
    
    // Add interval if > 1
    const intervalText = recurrenceInterval > 1 ? `every ${recurrenceInterval} ` : '';
    
    switch (recurrencePattern) {
      case 'daily':
        description += `${intervalText}${recurrenceInterval === 1 ? 'daily' : 'days'}`;
        break;
        
      case 'weekly':
        if (weeklyDays.length > 0) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const selectedDays = weeklyDays
            .sort((a, b) => a - b)
            .map(day => dayNames[day])
            .join(', ');
          description += `${intervalText}${recurrenceInterval === 1 ? 'weekly' : 'weeks'} on ${selectedDays}`;
        } else {
          description += `${intervalText}${recurrenceInterval === 1 ? 'weekly' : 'weeks'}`;
        }
        break;
        
      case 'monthly':
        if (monthlyOption === 'date') {
          description += `${intervalText}${recurrenceInterval === 1 ? 'monthly' : 'months'} on the same date`;
        } else if (monthlyOption === 'weekday') {
          const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'last'];
          const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          description += `${intervalText}${recurrenceInterval === 1 ? 'monthly' : 'months'} on the ${ordinals[monthlyWeekdayOrdinal]} ${weekdays[monthlyWeekday]}`;
        }
        break;
        
      case 'yearly':
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if (yearlyMonth !== undefined && yearlyMonth >= 0) {
          description += `${intervalText}${recurrenceInterval === 1 ? 'yearly' : 'years'} in ${months[yearlyMonth]}`;
        } else {
          description += `${intervalText}${recurrenceInterval === 1 ? 'yearly' : 'years'}`;
        }
        break;
        
      default:
        description = '';
    }
    
    // Add occurrence count
    if (recurrenceCount > 1) {
      description += ` for ${recurrenceCount} occurrence${recurrenceCount > 1 ? 's' : ''}`;
    }
    
    return description;
  };

  // Set default timezone on component mount
  useEffect(() => {
    if (!eventData.timezone) {
      // Try to detect user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const matchingTimezone = timezones.find(tz => tz.value === userTimezone);
      
      if (matchingTimezone) {
        handleFieldChange('timezone', userTimezone);
      } else {
        handleFieldChange('timezone', 'UTC');
      }
    }
  }, []);

  return (
    <div className="space-y-6 pt-4">
      {/* Event Title */}
      <Card className="shadow-sm">
        <CardBody className="p-6">
          <Input
            label="Event Title"
            placeholder="Product Launch, Team Meeting, Conference..."
            value={eventData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            isRequired
            radius="md"
            labelPlacement="outside"
            classNames={{
              label: "text-sm font-medium text-gray-700 pb-1",
              input: "text-base",
              inputWrapper: "h-12"
            }}
            isInvalid={!hasTitle && eventData.title !== undefined}
            errorMessage={!hasTitle && eventData.title !== undefined ? "Event title is required" : ""}
          />
        </CardBody>
      </Card>

      {/* Event Details Accordion */}
      <Accordion variant="bordered" defaultExpandedKeys={["event-details"]} className="shadow-sm">
        <AccordionItem key="event-details" title="Event Details" classNames={{ title: "text-lg font-semibold" }}>
          <div className="space-y-6 pb-4">
            {/* Date & Time Section */}
            <div className="space-y-4">
              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date - Top Left */}
                <Input
                  type="date"
                  label="Start Date"
                  value={eventData.startDate || ''}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  isRequired
                  radius="md"
                  labelPlacement="outside"
                  classNames={{
                    label: "text-sm font-medium text-gray-700 pb-1",
                    inputWrapper: "h-12"
                  }}
                  isInvalid={!hasStartDate && eventData.startDate !== undefined}
                />
                
                {/* Start Time - Top Right */}
                <Input
                  type="time"
                  label="Start Time"
                  value={eventData.startTime || ''}
                  onChange={(e) => handleFieldChange('startTime', e.target.value)}
                  isRequired={!eventData.isAllDay}
                  isDisabled={eventData.isAllDay}
                  radius="md"
                  labelPlacement="outside"
                  classNames={{
                    label: "text-sm font-medium text-gray-700 pb-1",
                    inputWrapper: "h-12"
                  }}
                  isInvalid={!eventData.isAllDay && !hasStartTime && eventData.startTime !== undefined}
                />
                
                {/* End Date - Bottom Left */}
                <Input
                  type="date"
                  label="End Date"
                  value={eventData.endDate || ''}
                  onChange={(e) => handleFieldChange('endDate', e.target.value)}
                  isRequired
                  radius="md"
                  labelPlacement="outside"
                  classNames={{
                    label: "text-sm font-medium text-gray-700 pb-1",
                    inputWrapper: "h-12"
                  }}
                  isInvalid={(!hasEndDate && eventData.endDate !== undefined) || !isValidDateRange}
                  errorMessage={!isValidDateRange ? "End date/time must be after start date/time" : ""}
                />
                
                {/* End Time - Bottom Right */}
                <Input
                  type="time"
                  label="End Time"
                  value={eventData.endTime || ''}
                  onChange={(e) => handleFieldChange('endTime', e.target.value)}
                  isRequired={!eventData.isAllDay}
                  isDisabled={eventData.isAllDay}
                  radius="md"
                  labelPlacement="outside"
                  classNames={{
                    label: "text-sm font-medium text-gray-700 pb-1",
                    inputWrapper: "h-12"
                  }}
                  isInvalid={(!eventData.isAllDay && !hasEndTime && eventData.endTime !== undefined) || !isValidDateRange}
                />
              </div>

              {/* All Day Toggle - Below dates and times */}
              <div className="pt-2">
                <Switch
                  isSelected={eventData.isAllDay || false}
                  onValueChange={(checked) => handleFieldChange('isAllDay', checked)}
                  size="md"
                  classNames={{
                    label: "text-sm font-medium text-gray-700"
                  }}
                >
                  All day event
                </Switch>
              </div>

              {/* Timezone Selection with Search */}
              <Autocomplete
                label="Timezone"
                placeholder="Search for a city or timezone..."
                selectedKey={eventData.timezone || 'UTC'}
                onSelectionChange={(key) => handleFieldChange('timezone', key)}
                onInputChange={setTimezoneSearch}
                radius="md"
                labelPlacement="outside"
                classNames={{
                  label: "text-sm font-medium text-gray-700 pb-1",
                  trigger: "h-12"
                }}
              >
                {filteredTimezones.map((tz) => (
                  <AutocompleteItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            </div>

            {/* Recurring Event - Enhanced */}
            <div className="space-y-4">
              <Switch
                isSelected={eventData.isRecurring || false}
                onValueChange={(checked) => handleFieldChange('isRecurring', checked)}
                size="md"
                classNames={{
                  label: "text-sm font-medium text-gray-700"
                }}
              >
                Recurring event
              </Switch>

              {eventData.isRecurring && (
                <div className="space-y-4 ml-6 pl-6 border-l-2 border-blue-200 bg-blue-50/30 rounded-r-lg py-4">
                  {/* Basic Recurrence Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label="Repeat"
                      selectedKeys={[eventData.recurrencePattern || 'weekly']}
                      onSelectionChange={(keys) => handleFieldChange('recurrencePattern', Array.from(keys)[0])}
                      radius="md"
                      labelPlacement="outside"
                      classNames={{
                        label: "text-sm font-medium text-gray-700 pb-1",
                        trigger: "h-10"
                      }}
                    >
                      <SelectItem key="daily">Daily</SelectItem>
                      <SelectItem key="weekly">Weekly</SelectItem>
                      <SelectItem key="monthly">Monthly</SelectItem>
                      <SelectItem key="yearly">Yearly</SelectItem>
                    </Select>

                    <Input
                      type="number"
                      label="Every"
                      placeholder="1"
                      min={1}
                      max={99}
                      value={eventData.recurrenceInterval?.toString() || '1'}
                      onChange={(e) => handleFieldChange('recurrenceInterval', parseInt(e.target.value) || 1)}
                      radius="md"
                      labelPlacement="outside"
                      classNames={{
                        label: "text-sm font-medium text-gray-700 pb-1",
                        inputWrapper: "h-10"
                      }}
                      endContent={
                        <span className="text-xs text-gray-500">
                          {eventData.recurrencePattern === 'daily' ? 'days' :
                           eventData.recurrencePattern === 'weekly' ? 'weeks' :
                           eventData.recurrencePattern === 'monthly' ? 'months' : 'years'}
                        </span>
                      }
                    />

                    <Input
                      type="number"
                      label="Occurrences"
                      placeholder="10"
                      min={1}
                      max={999}
                      value={eventData.recurrenceCount?.toString() || '1'}
                      onChange={(e) => handleFieldChange('recurrenceCount', parseInt(e.target.value) || 1)}
                      radius="md"
                      labelPlacement="outside"
                      classNames={{
                        label: "text-sm font-medium text-gray-700 pb-1",
                        inputWrapper: "h-10"
                      }}
                    />
                  </div>

                  {/* Weekly Days Selection */}
                  {eventData.recurrencePattern === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Repeat on days</label>
                      <div className="flex gap-2">
                        {[
                          { index: 0, short: 'S', full: 'Sunday' },
                          { index: 1, short: 'M', full: 'Monday' },
                          { index: 2, short: 'T', full: 'Tuesday' },
                          { index: 3, short: 'W', full: 'Wednesday' },
                          { index: 4, short: 'T', full: 'Thursday' },
                          { index: 5, short: 'F', full: 'Friday' },
                          { index: 6, short: 'S', full: 'Saturday' }
                        ].map((day) => (
                          <button
                            key={day.index}
                            type="button"
                            onClick={() => {
                              const currentDays = eventData.weeklyDays || [];
                              const newDays = currentDays.includes(day.index) 
                                ? currentDays.filter(d => d !== day.index)
                                : [...currentDays, day.index].sort();
                              handleFieldChange('weeklyDays', newDays);
                            }}
                            className={`w-10 h-10 rounded-full text-sm font-medium border-2 transition-all ${
                              (eventData.weeklyDays || []).includes(day.index)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                            }`}
                            title={day.full}
                          >
                            {day.short}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly Options */}
                  {eventData.recurrencePattern === 'monthly' && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="monthlyOption"
                            value="date"
                            checked={eventData.monthlyOption === 'date' || !eventData.monthlyOption}
                            onChange={() => handleFieldChange('monthlyOption', 'date')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">Same date each month (e.g., 15th of every month)</span>
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="monthlyOption"
                            value="weekday"
                            checked={eventData.monthlyOption === 'weekday'}
                            onChange={() => handleFieldChange('monthlyOption', 'weekday')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">Same weekday pattern (e.g., first Monday of every month)</span>
                        </label>
                      </div>

                      {eventData.monthlyOption === 'weekday' && (
                        <div className="grid grid-cols-2 gap-4 ml-7">
                          <Select
                            label="Which occurrence"
                            selectedKeys={[eventData.monthlyWeekdayOrdinal?.toString() || '0']}
                            onSelectionChange={(keys) => handleFieldChange('monthlyWeekdayOrdinal', parseInt(Array.from(keys)[0]))}
                            radius="md"
                            labelPlacement="outside"
                            classNames={{
                              label: "text-sm font-medium text-gray-700 pb-1",
                              trigger: "h-10"
                            }}
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
                            radius="md"
                            labelPlacement="outside"
                            classNames={{
                              label: "text-sm font-medium text-gray-700 pb-1",
                              trigger: "h-10"
                            }}
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

                  {/* Yearly Options */}
                  {eventData.recurrencePattern === 'yearly' && (
                    <div>
                      <Select
                        label="Month"
                        placeholder="Select month (optional)"
                        selectedKeys={eventData.yearlyMonth !== undefined ? [eventData.yearlyMonth.toString()] : []}
                        onSelectionChange={(keys) => {
                          const key = Array.from(keys)[0];
                          handleFieldChange('yearlyMonth', key ? parseInt(key) : undefined);
                        }}
                        radius="md"
                        labelPlacement="outside"
                        classNames={{
                          label: "text-sm font-medium text-gray-700 pb-1",
                          trigger: "h-10"
                        }}
                      >
                        <SelectItem key="0">January</SelectItem>
                        <SelectItem key="1">February</SelectItem>
                        <SelectItem key="2">March</SelectItem>
                        <SelectItem key="3">April</SelectItem>
                        <SelectItem key="4">May</SelectItem>
                        <SelectItem key="5">June</SelectItem>
                        <SelectItem key="6">July</SelectItem>
                        <SelectItem key="7">August</SelectItem>
                        <SelectItem key="8">September</SelectItem>
                        <SelectItem key="9">October</SelectItem>
                        <SelectItem key="10">November</SelectItem>
                        <SelectItem key="11">December</SelectItem>
                      </Select>
                    </div>
                  )}

                  {/* Recurrence Description */}
                  {getRecurrenceDescription() && (
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                      <p className="text-sm text-blue-800 font-medium">{getRecurrenceDescription()}</p>
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
                placeholder="Describe your event, agenda, what attendees should expect..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Location */}
            <Input
              label="Location"
              placeholder="Conference room, venue address, or meeting link"
              value={eventData.location || ''}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              radius="md"
              labelPlacement="outside"
              classNames={{
                label: "text-sm font-medium text-gray-700 pb-1",
                input: "text-base placeholder:text-gray-400",
                inputWrapper: "h-12"
              }}
            />

            {/* Host Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Host Name"
                placeholder="Event organizer or company name"
                value={eventData.hostName || ''}
                onChange={(e) => handleFieldChange('hostName', e.target.value)}
                radius="md"
                labelPlacement="outside"
                classNames={{
                  label: "text-sm font-medium text-gray-700 pb-1",
                  input: "text-base placeholder:text-gray-400",
                  inputWrapper: "h-12"
                }}
              />
              <Input
                type="email"
                label="Host Email"
                placeholder="organizer@company.com"
                value={eventData.hostEmail || ''}
                onChange={(e) => handleFieldChange('hostEmail', e.target.value)}
                radius="md"
                labelPlacement="outside"
                classNames={{
                  label: "text-sm font-medium text-gray-700 pb-1",
                  input: "text-base placeholder:text-gray-400",
                  inputWrapper: "h-12"
                }}
              />
            </div>

            {/* Reminder */}
            <Select
              label="Remind attendees"
              placeholder="Select when to remind attendees"
              selectedKeys={[eventData.reminderTime || '15']}
              onSelectionChange={(keys) => handleFieldChange('reminderTime', Array.from(keys)[0])}
              radius="md"
              labelPlacement="outside"
              classNames={{
                label: "text-sm font-medium text-gray-700 pb-1",
                trigger: "h-12"
              }}
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
      <Card className="shadow-sm">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-semibold text-gray-700">Calendar Platforms</label>
            {hasPlatforms && (
              <Chip size="sm" color="success" variant="flat">
                {Object.values(buttonData.selectedPlatforms || {}).filter(Boolean).length} selected
              </Chip>
            )}
          </div>
          
          <Select
            placeholder="Select which calendar platforms to support"
            selectionMode="multiple"
            selectedKeys={getSelectedPlatformKeys()}
            onSelectionChange={handlePlatformSelectionChange}
            radius="md"
            isRequired
            classNames={{
              trigger: "h-12"
            }}
            isInvalid={!hasPlatforms && Object.keys(buttonData.selectedPlatforms || {}).length > 0}
            errorMessage={!hasPlatforms && Object.keys(buttonData.selectedPlatforms || {}).length > 0 ? "Select at least one calendar platform" : ""}
          >
            {platforms.map((platform) => (
              <SelectItem key={platform.id} value={platform.id}>
                {platform.name}
              </SelectItem>
            ))}
          </Select>
        </CardBody>
      </Card>

      {/* Button Customization */}
      <Card className="shadow-sm">
        <CardBody className="p-6">
          <div className="space-y-6">
            <label className="text-lg font-semibold text-gray-700">Button Customization</label>
            
            {/* Layout Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Layout Style</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="buttonLayout"
                    value="dropdown"
                    checked={buttonData.buttonLayout !== 'individual'}
                    onChange={() => updateButton({ buttonLayout: 'dropdown' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Single button with dropdown</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="buttonLayout"
                    value="individual"
                    checked={buttonData.buttonLayout === 'individual'}
                    onChange={() => updateButton({ buttonLayout: 'individual' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Individual platform buttons</span>
                  <Chip size="sm" color="primary" variant="flat">Popular</Chip>
                </label>
              </div>
            </div>

            {/* Style & Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Button Style"
                selectedKeys={[buttonData.buttonStyle || 'standard']}
                onSelectionChange={(keys) => updateButton({ buttonStyle: Array.from(keys)[0] })}
                radius="md"
                labelPlacement="outside"
                classNames={{
                  label: "text-sm font-medium text-gray-700 pb-1",
                  trigger: "h-12"
                }}
              >
                <SelectItem key="standard">Standard</SelectItem>
                <SelectItem key="outlined">Outlined</SelectItem>
                <SelectItem key="minimal">Minimal</SelectItem>
                <SelectItem key="pill">Pill-shaped</SelectItem>
              </Select>

              <Select
                label="Button Size"
                selectedKeys={[buttonData.buttonSize || 'medium']}
                onSelectionChange={(keys) => updateButton({ buttonSize: Array.from(keys)[0] })}
                radius="md"
                labelPlacement="outside"
                classNames={{
                  label: "text-sm font-medium text-gray-700 pb-1",
                  trigger: "h-12"
                }}
              >
                <SelectItem key="small">Small</SelectItem>
                <SelectItem key="medium">Medium</SelectItem>
                <SelectItem key="large">Large</SelectItem>
              </Select>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Button Color</label>
              <div className="flex items-center gap-4">
                {[
                  { value: '#4D90FF', name: 'Blue' },
                  { value: '#34C759', name: 'Green' },
                  { value: '#AF52DE', name: 'Purple' },
                  { value: '#FF9500', name: 'Orange' },
                  { value: '#FF3B30', name: 'Red' },
                  { value: '#000000', name: 'Black' }
                ].map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => updateButton({ colorScheme: color.value })}
                    className={`w-10 h-10 rounded-full border-3 transition-all hover:scale-110 ${
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
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                  title="Custom color"
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-3">Additional Options</label>
              <div className="flex flex-wrap gap-6">
                <Checkbox
                  isSelected={buttonData.showIcons !== false}
                  onValueChange={(checked) => updateButton({ showIcons: checked })}
                  size="md"
                >
                  <span className="text-sm">Show calendar icons</span>
                </Checkbox>
                <Checkbox
                  isSelected={buttonData.responsive !== false}
                  onValueChange={(checked) => updateButton({ responsive: checked })}
                  size="md"
                >
                  <span className="text-sm">Responsive design</span>
                </Checkbox>
                <Checkbox
                  isSelected={buttonData.openInNewTab !== false}
                  onValueChange={(checked) => updateButton({ openInNewTab: checked })}
                  size="md"
                >
                  <span className="text-sm">Open in new tab</span>
                </Checkbox>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Status Indicator */}
      {isComplete ? (
        <Card className="border-2 border-success-300 bg-success-50 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center gap-3 text-success-800">
              <div className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="text-sm font-semibold">Ready to generate your calendar button!</span>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card className="border-2 border-warning-300 bg-warning-50 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center gap-3 text-warning-800">
              <div className="w-6 h-6 rounded-full bg-warning-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <span className="text-sm font-semibold">Please complete the required fields:</span>
                <ul className="text-xs mt-1 ml-2">
                  {!hasTitle && <li>• Event title</li>}
                  {!hasStartDate && <li>• Start date</li>}
                  {!hasStartTime && !eventData.isAllDay && <li>• Start time</li>}
                  {!hasEndDate && <li>• End date</li>}
                  {!hasEndTime && !eventData.isAllDay && <li>• End time</li>}
                  {!hasPlatforms && <li>• At least one calendar platform</li>}
                  {!isValidDateRange && <li>• Valid date/time range</li>}
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}