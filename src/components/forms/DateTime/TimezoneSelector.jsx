'use client';
import { useState, useMemo } from 'react';
import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { Clock } from 'lucide-react';

export default function TimezoneSelector({ 
  value, 
  onChange, 
  startDate, 
  startTime, 
  isAllDay 
}) {
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getAllTimezones = () => {
    const timeZones = Intl.supportedValuesOf('timeZone');
    return timeZones.map(tz => {
      const parts = tz.split('/');
      const city = parts[parts.length - 1]?.replace(/_/g, ' ') || tz;
      const region = parts[0]?.replace(/_/g, ' ') || '';
      let displayName = city;
      if (region && region !== city && parts.length > 1) {
        displayName = `${city}, ${region}`;
      }
      return {
        value: tz,
        label: displayName,
        searchTerms: `${tz.toLowerCase()} ${city.toLowerCase()} ${region.toLowerCase()}`
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  };

  const allTimezones = useMemo(() => getAllTimezones(), []);

  const filteredTimezones = useMemo(() => {
    if (!timezoneSearch.trim()) {
      const popularTimezones = [
        'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'America/Toronto', 'America/Vancouver', 'Europe/London', 'Europe/Paris',
        'Europe/Berlin', 'Europe/Madrid', 'Asia/Tokyo', 'Asia/Shanghai',
        'Asia/Singapore', 'Asia/Dubai', 'Australia/Sydney', 'UTC'
      ];
      const popular = allTimezones.filter(tz => popularTimezones.includes(tz.value));
      const others = allTimezones.filter(tz => !popularTimezones.includes(tz.value));
      return [...popular, ...others];
    }
    const searchLower = timezoneSearch.toLowerCase();
    return allTimezones.filter(tz => tz.searchTerms.includes(searchLower));
  }, [timezoneSearch, allTimezones]);

  const handleSelectionChange = (key) => {
    if (key !== value) {
      onChange(key);
    }
  };

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
      return `${eventTime} ${eventTzName} • ${userTime} ${userTzName} (your time)`;
    } catch (error) {
      return null;
    }
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
      >
        {filteredTimezones.map((tz) => (
          <AutocompleteItem key={tz.value} value={tz.value}>
            {tz.label}
          </AutocompleteItem>
        ))}
      </Autocomplete>
      
      {getTimezonePreview() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
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
