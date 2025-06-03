'use client';
import { Select, SelectItem, Input } from '@heroui/react';
import WeeklyDaySelector from './WeeklyDaySelector';
import MonthlyOptions from './MonthlyOptions';
import YearlyOptions from './YearlyOptions';

export default function RecurrenceControls({ eventData, onUpdate }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Repeat"
          placeholder="Select pattern"
          selectedKeys={[eventData.recurrencePattern || 'weekly']}
          onSelectionChange={(keys) => onUpdate({ recurrencePattern: Array.from(keys)[0] })}
          radius="md"
          labelPlacement="outside"
          classNames={{ label: "text-sm font-medium text-gray-700 pb-1", trigger: "h-10" }}
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
          onChange={(e) => onUpdate({ recurrenceInterval: parseInt(e.target.value) || 1 })}
          radius="md"
          labelPlacement="outside"
          classNames={{ label: "text-sm font-medium text-gray-700 pb-1", inputWrapper: "h-10" }}
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
          onChange={(e) => onUpdate({ recurrenceCount: parseInt(e.target.value) || 1 })}
          radius="md"
          labelPlacement="outside"
          classNames={{ label: "text-sm font-medium text-gray-700 pb-1", inputWrapper: "h-10" }}
        />
      </div>
      
      {eventData.recurrencePattern === 'weekly' && <WeeklyDaySelector eventData={eventData} onUpdate={onUpdate} />}
      {eventData.recurrencePattern === 'monthly' && <MonthlyOptions eventData={eventData} onUpdate={onUpdate} />}
      {eventData.recurrencePattern === 'yearly' && <YearlyOptions eventData={eventData} onUpdate={onUpdate} />}
    </div>
  );
}
