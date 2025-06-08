'use client';
import { useMemo } from 'react';
import { Select, SelectItem } from '@heroui/react';

export default function TimeInputs({ 
  startTime, 
  endTime, 
  onStartTimeChange, 
  onEndTimeChange,
  startDate,
  endDate,
  isAllDay 
}) {
  const hourOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      value: i.toString().padStart(2, '0'),
      label: i.toString().padStart(2, '0')
    }));
  }, []);

  const minuteOptions = useMemo(() => [
    { value: '00', label: '00' },
    { value: '15', label: '15' },
    { value: '30', label: '30' },
    { value: '45', label: '45' }
  ], []);

  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: '09', minute: '00' };
    const [hour, minute] = timeStr.split(':');
    return { hour, minute };
  };

  const formatTime = (hour, minute) => `${hour}:${minute}`;

  const startParts = parseTime(startTime);
  const endParts = parseTime(endTime);

  const handleStartTimeChange = (field, value) => {
    const newParts = { ...startParts, [field]: value };
    onStartTimeChange(formatTime(newParts.hour, newParts.minute));
  };

  const handleEndTimeChange = (field, value) => {
    const newParts = { ...endParts, [field]: value };
    onEndTimeChange(formatTime(newParts.hour, newParts.minute));
  };

  const getFilteredEndHours = () => {
    if (!startTime || startDate !== endDate) return hourOptions;
    const startHour = parseInt(startParts.hour);
    const startMinute = parseInt(startParts.minute);
    
    return hourOptions.filter(option => {
      const optionHour = parseInt(option.value);
      if (optionHour > startHour) return true;
      if (optionHour === startHour && parseInt(endParts.minute) > startMinute) return true;
      return false;
    });
  };

  const getFilteredEndMinutes = () => {
    if (!startTime || startDate !== endDate) return minuteOptions;
    const startHour = parseInt(startParts.hour);
    const endHour = parseInt(endParts.hour);
    
    if (endHour > startHour) return minuteOptions;
    if (endHour === startHour) {
      const startMinute = parseInt(startParts.minute);
      return minuteOptions.filter(option => parseInt(option.value) > startMinute);
    }
    return minuteOptions;
  };

  if (isAllDay) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-end">
          <div className="w-full h-12 bg-gray-50 rounded-md flex items-center justify-center text-gray-500 text-sm">
            All day event
          </div>
        </div>
        <div className="flex items-end">
          <div className="w-full h-12 bg-gray-50 rounded-md flex items-center justify-center text-gray-500 text-sm">
            All day event
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Start Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 pb-1 mb-2">Start Time</label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            placeholder="Hour"
            selectedKeys={startParts.hour ? [startParts.hour] : []}
            onSelectionChange={(keys) => handleStartTimeChange('hour', Array.from(keys)[0])}
            radius="md"
            classNames={{ trigger: "h-10" }}
          >
            {hourOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
          
          <Select
            placeholder="Min"
            selectedKeys={startParts.minute ? [startParts.minute] : []}
            onSelectionChange={(keys) => handleStartTimeChange('minute', Array.from(keys)[0])}
            radius="md"
            classNames={{ trigger: "h-10" }}
          >
            {minuteOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* End Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 pb-1 mb-2">End Time</label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            placeholder="Hour"
            selectedKeys={endParts.hour ? [endParts.hour] : []}
            onSelectionChange={(keys) => handleEndTimeChange('hour', Array.from(keys)[0])}
            radius="md"
            classNames={{ trigger: "h-10" }}
          >
            {getFilteredEndHours().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
          
          <Select
            placeholder="Min"
            selectedKeys={endParts.minute ? [endParts.minute] : []}
            onSelectionChange={(keys) => handleEndTimeChange('minute', Array.from(keys)[0])}
            radius="md"
            classNames={{ trigger: "h-10" }}
          >
            {getFilteredEndMinutes().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}