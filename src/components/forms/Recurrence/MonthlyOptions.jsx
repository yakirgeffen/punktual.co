'use client';
import { Select, SelectItem } from '@heroui/react';

export default function MonthlyOptions({ eventData, onUpdate }) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="monthlyOption"
            value="date"
            checked={eventData.monthlyOption === 'date' || !eventData.monthlyOption}
            onChange={() => onUpdate({ monthlyOption: 'date' })}
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
            onChange={() => onUpdate({ monthlyOption: 'weekday' })}
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
            onSelectionChange={(keys) => onUpdate({ monthlyWeekdayOrdinal: parseInt(Array.from(keys)[0]) })}
            radius="md"
            labelPlacement="outside"
            classNames={{ label: "text-sm font-medium text-gray-700 pb-1", trigger: "h-10" }}
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
            onSelectionChange={(keys) => onUpdate({ monthlyWeekday: parseInt(Array.from(keys)[0]) })}
            radius="md"
            labelPlacement="outside"
            classNames={{ label: "text-sm font-medium text-gray-700 pb-1", trigger: "h-10" }}
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
  );
}
