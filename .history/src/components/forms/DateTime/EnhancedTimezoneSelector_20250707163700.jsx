'use client';
import { useState, useMemo, useEffect } from 'react';
import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { Clock, MapPin } from 'lucide-react';
import { 
  getAllTimezones, 
  searchTimezonesAndCities, 
  getCurrentTimeInTimezone,
  getTimezoneOffset 
} from '@/utils/timezoneUtils';

/**
 * Enhanced Timezone Selector with city search and smart suggestions
 * Features:
 * - City-based search (e.g., "Miami" → "New York (Eastern Time)")
 * - Current time display for selected timezone
 * - Smart geographic fallbacks
 * - Comprehensive city database
 */
export default function EnhancedTimezoneSelector({ 
  value, 
  onChange, 
  startDate, 
  startTime, 
  isAllDay 
}) {
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Get all timezones with enhanced data
  const allTimezones = useMemo(() => getAllTimezones(), []);

  // Filter timezones based on search
  const filteredTimezones = useMemo(() => 
    searchTimezonesAndCities(timezoneSearch, allTimezones),
    [timezoneSearch, allTimezones]
  );

  // Update current time for selected timezone
  useEffect(() => {
    if (value) {
      const time = getCurrentTimeInTimezone(value);
      setCurrentTime(time);
      
      // Update time every minute
      const interval = setInterval(() => {
        setCurrentTime(getCurrentTimeInTimezone(value));
      }, 60000);
      
      return () => clearInterval(interval);
    } else {
      setCurrentTime('');
    }
  }, [value]);

  const handleSelectionChange = (key) => {
    if (key !== value) {
      onChange(key);
    }
  };

  // Get timezone preview for event time conversion
  const getTimezonePreview = () => {
    if (!startTime || !value || isAllDay) {
      return null;
    }
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const eventTimezone = value;
    if (userTimezone === eventTimezone) {
      return null;
    }
    try {
      const eventDateTime = new Date(`${startDate}T${startTime}`);
      const eventTime = eventDateTime.toLocaleString('en-US', {
        timeZone: eventTimezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const userTime = eventDateTime.toLocaleString('en-US', {
        timeZone: userTimezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const eventTzName = eventTimezone.split('/').pop()?.replace(/_/g, ' ') || eventTimezone;
      const userTzName = userTimezone.split('/').pop()?.replace(/_/g, ' ') || userTimezone;
      return `${eventTime} ${eventTzName} • ${userTime} ${userTzName} (local time)`;
    } catch {
      return null;
    }
  };

  // Format display for autocomplete items
  const formatItemDisplay = (timezone) => {
    const time = timezone.currentTime || getCurrentTimeInTimezone(timezone.value);
    const offset = timezone.offset || getTimezoneOffset(timezone.value);
    
    if (timezone.isCityMapping) {
      return `${timezone.originalCity} → ${timezone.city} (${offset}) - ${time}`;
    }
    
    return `${timezone.label} (${offset}) - ${time}`;
  };

  return (
    <div className="space-y-3">
      <Autocomplete
        label="Timezone"
        placeholder={isDropdownOpen && !timezoneSearch ? "" : "Search for city or timezone..."}
        selectedKey={value || 'UTC'}
        onSelectionChange={handleSelectionChange}
        onInputChange={setTimezoneSearch}
        onOpenChange={setIsDropdownOpen}
        radius="md"
        labelPlacement="outside"
        classNames={{
          label: "text-sm font-medium text-gray-700 pb-1",
          trigger: "h-12"
        }}
        startContent={<MapPin className="h-4 w-4 text-gray-400" />}
      >
        {filteredTimezones.map((tz) => (
          <AutocompleteItem 
            key={tz.value} 
            value={tz.value}
            textValue={tz.isCityMapping ? `${tz.originalCity} ${tz.city}` : tz.label}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {tz.isCityMapping ? (
                    <>
                      <span className="text-blue-600">{tz.originalCity}</span>
                      <span className="text-gray-500 mx-1">→</span>
                      <span>{tz.city}</span>
                    </>
                  ) : (
                    tz.label
                  )}
                </span>
                <span className="text-xs text-gray-500">
                  {tz.offset} • {tz.currentTime}
                </span>
              </div>
              {tz.isCityMapping && (
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Same timezone
                </div>
              )}
            </div>
          </AutocompleteItem>
        ))}
      </Autocomplete>
      
      {/* Event Time Preview */}
      {getTimezonePreview() && (
        <div className="bg-emerald-50 border border-blue-emerald rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              {getTimezonePreview()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
