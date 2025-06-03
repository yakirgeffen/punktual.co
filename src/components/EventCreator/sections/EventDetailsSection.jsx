'use client';
import { Input, Select, SelectItem, Switch } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';
import EnhancedTimezoneSelector from '../../forms/DateTime/EnhancedTimezoneSelector';

/**
 * Event Details Section - Comprehensive event information
 * Handles date/time, timezone, recurring events, description, location, host info, and reminders
 */
export default function EventDetailsSection() {
  const { 
    eventData, 
    fullTimeOptions, 
    filteredEndTimeOptions, 
    reminderOptions,
    handleFieldChange,
    getMinEndDate 
  } = useEventFormLogic();

  // Generate recurrence description
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
    const intervalText = recurrenceInterval > 1 ? `every ${recurrenceInterval} ` : '';
    
    switch (recurrencePattern) {
      case 'daily':
        description += `${intervalText}${recurrenceInterval === 1 ? 'daily' : 'days'}`;
        break;
      case 'weekly':
        if (weeklyDays.length > 0) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const selectedDays = weeklyDays.sort((a, b) => a - b).map(day => dayNames[day]).join(', ');
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
    
    if (recurrenceCount > 1) {
      description += ` for ${recurrenceCount} occurrence${recurrenceCount > 1 ? 's' : ''}`;
    }
    return description;
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Date & Time Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            placeholder="Select start date"
            value={eventData.startDate || ''}
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
            isRequired
            radius="md"
            labelPlacement="outside"
            classNames={{
              label: "text-sm font-medium text-gray-700 pb-1",
              input: "placeholder:text-gray-400",
              inputWrapper: "h-12"
            }}
          />
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
              {fullTimeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          )}
          {eventData.isAllDay && (
            <div className="flex items-end">
              <div className="w-full h-12 bg-gray-50 rounded-md flex items-center justify-center text-gray-500 text-sm">
                All day event
              </div>
            </div>
          )}
          
          <Input
            type="date"
            label="End Date"
            placeholder="Select end date"
            value={eventData.endDate || ''}
            onChange={(e) => handleFieldChange('endDate', e.target.value)}
            min={getMinEndDate()}
            isRequired
            radius="md"
            labelPlacement="outside"
            classNames={{
              label: "text-sm font-medium text-gray-700 pb-1",
              input: "placeholder:text-gray-400",
              inputWrapper: "h-12"
            }}
          />
          {!eventData.isAllDay && (
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
              {filteredEndTimeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
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
          onChange={(timezone) => handleFieldChange('timezone', timezone)}
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
          <div className="space-y-4 ml-6 pl-6 border-l-2 border-blue-200 bg-blue-50/30 rounded-r-lg py-4">
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
                <SelectItem key="daily" value="daily">Daily</SelectItem>
                <SelectItem key="weekly" value="weekly">Weekly</SelectItem>
                <SelectItem key="monthly" value="monthly">Monthly</SelectItem>
                <SelectItem key="yearly" value="yearly">Yearly</SelectItem>
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
                  input: "placeholder:text-gray-400",
                  inputWrapper: "h-10"
                }}
                endContent={
                  <span className="text-xs text-gray-500">
                    {eventData.recurrencePattern === 'daily'
                      ? 'days'
                      : eventData.recurrencePattern === 'weekly'
                      ? 'weeks'
                      : eventData.recurrencePattern === 'monthly'
                      ? 'months'
                      : 'years'}
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
                  input: "placeholder:text-gray-400",
                  inputWrapper: "h-10"
                }}
              />
            </div>
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
                      placeholder="Select occurrence"
                      selectedKeys={[eventData.monthlyWeekdayOrdinal?.toString() || '0']}
                      onSelectionChange={(keys) =>
                        handleFieldChange('monthlyWeekdayOrdinal', parseInt(Array.from(keys)[0]))
                      }
                      radius="md"
                      labelPlacement="outside"
                      classNames={{
                        label: "text-sm font-medium text-gray-700 pb-1",
                        trigger: "h-10"
                      }}
                    >
                      <SelectItem key="0" value="0">First</SelectItem>
                      <SelectItem key="1" value="1">Second</SelectItem>
                      <SelectItem key="2" value="2">Third</SelectItem>
                      <SelectItem key="3" value="3">Fourth</SelectItem>
                      <SelectItem key="4" value="4">Fifth</SelectItem>
                      <SelectItem key="5" value="5">Last</SelectItem>
                    </Select>
                    <Select
                      label="Day of week"
                      placeholder="Select day"
                      selectedKeys={[eventData.monthlyWeekday?.toString() || '0']}
                      onSelectionChange={(keys) =>
                        handleFieldChange('monthlyWeekday', parseInt(Array.from(keys)[0]))
                      }
                      radius="md"
                      labelPlacement="outside"
                      classNames={{
                        label: "text-sm font-medium text-gray-700 pb-1",
                        trigger: "h-10"
                      }}
                    >
                      <SelectItem key="0" value="0">Sunday</SelectItem>
                      <SelectItem key="1" value="1">Monday</SelectItem>
                      <SelectItem key="2" value="2">Tuesday</SelectItem>
                      <SelectItem key="3" value="3">Wednesday</SelectItem>
                      <SelectItem key="4" value="4">Thursday</SelectItem>
                      <SelectItem key="5" value="5">Friday</SelectItem>
                      <SelectItem key="6" value="6">Saturday</SelectItem>
                    </Select>
                  </div>
                )}
              </div>
            )}
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
                  <SelectItem key="0" value="0">January</SelectItem>
                  <SelectItem key="1" value="1">February</SelectItem>
                  <SelectItem key="2" value="2">March</SelectItem>
                  <SelectItem key="3" value="3">April</SelectItem>
                  <SelectItem key="4" value="4">May</SelectItem>
                  <SelectItem key="5" value="5">June</SelectItem>
                  <SelectItem key="6" value="6">July</SelectItem>
                  <SelectItem key="7" value="7">August</SelectItem>
                  <SelectItem key="8" value="8">September</SelectItem>
                  <SelectItem key="9" value="9">October</SelectItem>
                  <SelectItem key="10" value="10">November</SelectItem>
                  <SelectItem key="11" value="11">December</SelectItem>
                </Select>
              </div>
            )}
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
        <label className="block text-sm font-medium text-gray-700 pb-1">Event Description</label>
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
      <div className="pt-2">
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
    </div>
  );
}
