'use client';
import { Input, Select, SelectItem, Switch } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';
import EnhancedTimezoneSelector from '@/components/forms/DateTime/EnhancedTimezoneSelector';

/**
 * Event Details Section - Date & Time Management
 * Handles dates, times, timezone, all-day toggle, and recurring events
 */
export default function EventDetailsSection() {
  const { 
    eventData, 
    handleFieldChange,
  } = useEventFormLogic();

  // Generate time options with 15-minute intervals and 12-hour display
  const generateTimeOptions = (isStartTime = false) => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (let hour = 0; hour < 24; hour++) {
      ['00', '15', '30', '45'].forEach(minute => {
        const timeValue = `${hour.toString().padStart(2, '0')}:${minute}`;
        
        // Skip past times if this is for start time and it's today
        if (isStartTime && eventData.startDate === today) {
          const timeMinutes = hour * 60 + parseInt(minute);
          const nowMinutes = currentHour * 60 + currentMinute;
          if (timeMinutes < nowMinutes) return;
        }
        
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const timeLabel = `${displayHour.toString().padStart(2, '0')}:${minute} ${ampm}`;
        options.push({ value: timeValue, label: timeLabel });
      });
    }
    return options;
  };

  const startTimeOptions = generateTimeOptions(true);
  const endTimeOptions = generateTimeOptions(false);

  // Filter end time options
  const getFilteredEndTimeOptions = () => {
    if (!eventData.startTime || eventData.startDate !== eventData.endDate) {
      return endTimeOptions;
    }
    
    const [startHour, startMin] = eventData.startTime.split(':').map(Number);
    const startTotalMin = startHour * 60 + startMin;
    
    return endTimeOptions.filter(option => {
      const [optionHour, optionMin] = option.value.split(':').map(Number);
      const optionTotalMin = optionHour * 60 + optionMin;
      return optionTotalMin > startTotalMin;
    });
  };

  // Calculate duration
  const getDuration = () => {
    if (!eventData.startTime || !eventData.endTime || eventData.startDate !== eventData.endDate) {
      return '';
    }
    
    const [startHour, startMin] = eventData.startTime.split(':').map(Number);
    const [endHour, endMin] = eventData.endTime.split(':').map(Number);
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;
    const durationMin = endTotalMin - startTotalMin;
    
    if (durationMin <= 0) return '';
    
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Date & Time Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            placeholder="Select start date"
            value={eventData.startDate || ''}
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            isRequired
            radius="md"
            labelPlacement="outside"
            classNames={{
              label: "text-sm font-medium text-gray-700 pb-1",
              input: "placeholder:text-gray-400",
              inputWrapper: "h-12"
            }}
          />
          
          <Input
            type="date"
            label="End Date"
            placeholder="Select end date"
            value={eventData.endDate || ''}
            onChange={(e) => handleFieldChange('endDate', e.target.value)}
            min={eventData.startDate || new Date().toISOString().split('T')[0]}
            isRequired
            radius="md"
            labelPlacement="outside"
            classNames={{
              label: "text-sm font-medium text-gray-700 pb-1",
              input: "placeholder:text-gray-400",
              inputWrapper: "h-12"
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {!eventData.isAllDay && (
            <Select
              label="Start Time"
              placeholder="Select start time"
              selectedKeys={eventData.startTime ? [eventData.startTime] : []}
              onSelectionChange={(keys) => handleFieldChange('startTime', Array.from(keys)[0])}
              isRequired={!eventData.isAllDay}
              radius="md"
              labelPlacement="outside"
              classNames={{
                label: "text-sm font-medium text-gray-700 pb-1",
                trigger: "h-12"
              }}
            >
              {startTimeOptions.map((option) => (
                <SelectItem key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          )}
          
          {!eventData.isAllDay && (
            <div className="space-y-2">
              <Select
                label="End Time"
                placeholder="Select end time"
                selectedKeys={eventData.endTime ? [eventData.endTime] : []}
                onSelectionChange={(keys) => handleFieldChange('endTime', Array.from(keys)[0])}
                isRequired={!eventData.isAllDay}
                radius="md"
                labelPlacement="outside"
                classNames={{
                  label: "text-sm font-medium text-gray-700 pb-1",
                  trigger: "h-12"
                }}
              >
                {getFilteredEndTimeOptions().map((option) => (
                  <SelectItem key={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              
              {/* Duration indicator */}
              {getDuration() && (
                <div className="mt-2 text-xs text-gray-600">
                  Duration: {getDuration()}
                </div>
              )}
            </div>
          )}
          
          {eventData.isAllDay && (
            <div className="flex items-end">
              <div className="w-full h-12 bg-gray-50 rounded-md flex items-center justify-center text-gray-500 text-sm">
                All day event
              </div>
            </div>
          )}
        </div>
        
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
        
        <EnhancedTimezoneSelector
          value={eventData.timezone || 'UTC'}
          onChange={(timezone: string) => handleFieldChange('timezone', timezone)}
          startDate={eventData.startDate}
          startTime={eventData.startTime}
          isAllDay={eventData.isAllDay}
        />
      </div>

      {/* Recurring Event Section */}
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
          <div className="space-y-4 ml-4 pl-4 border-l-2 border-emerald-400 bg-gray-50 rounded-r-lg py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Repeat"
                placeholder="Select pattern"
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
                value={String(eventData.recurrenceInterval || 1)}
                onChange={(e) => handleFieldChange('recurrenceInterval', parseInt(e.target.value) || 1)}
                min="1"
                max="999"
                radius="md"
                labelPlacement="outside"
                classNames={{
                  label: "text-sm font-medium text-gray-700 pb-1",
                  input: "placeholder:text-gray-400",
                  inputWrapper: "h-10"
                }}
              />
              
              <Input
                type="number"
                label="For"
                placeholder="Occurrences"
                value={String(eventData.recurrenceCount || '')}
                onChange={(e) => handleFieldChange('recurrenceCount', parseInt(e.target.value) || 1)}
                min="1"
                max="999"
                radius="md"
                labelPlacement="outside"
                classNames={{
                  label: "text-sm font-medium text-gray-700 pb-1",
                  input: "placeholder:text-gray-400",
                  inputWrapper: "h-10"
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}