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
  const fullTimeOptions = useMemo(() => {
    const options = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        const amTime24 = hour === 12 ? `00:${minuteStr}` : `${hourStr}:${minuteStr}`;
        const amLabel = `${hourStr}:${minuteStr} AM`;
        options.push({ value: amTime24, label: amLabel });
        const pmTime24 = hour === 12 ? `12:${minuteStr}` : `${(hour + 12).toString().padStart(2, '0')}:${minuteStr}`;
        const pmLabel = `${hourStr}:${minuteStr} PM`;
        options.push({ value: pmTime24, label: pmLabel });
      }
    }
    return options.sort((a, b) => {
      const [aHour, aMin] = a.value.split(':').map(Number);
      const [bHour, bMin] = b.value.split(':').map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    });
  }, []);

  const getFilteredEndTimeOptions = () => {
    if (!startTime || startDate !== endDate) {
      return fullTimeOptions;
    }
    const [startHour, startMin] = startTime.split(':').map(Number);
    const startTotal = startHour * 60 + startMin;
    return fullTimeOptions.filter(option => {
      const [optionHour, optionMin] = option.value.split(':').map(Number);
      return optionHour * 60 + optionMin > startTotal;
    });
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
      <Select
        label="Start Time"
        placeholder="Select start time"
        selectedKeys={startTime ? [startTime] : []}
        onSelectionChange={(keys) => onStartTimeChange(Array.from(keys)[0])}
        isRequired
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

      <Select
        label="End Time"
        placeholder="Select end time"
        selectedKeys={endTime ? [endTime] : []}
        onSelectionChange={(keys) => onEndTimeChange(Array.from(keys)[0])}
        isRequired
        radius="md"
        labelPlacement="outside"
        classNames={{
          label: "text-sm font-medium text-gray-700 pb-1",
          trigger: "h-12"
        }}
      >
        {getFilteredEndTimeOptions().map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
