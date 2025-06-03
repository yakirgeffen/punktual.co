'use client';
import { Select, SelectItem } from '@heroui/react';

export default function YearlyOptions({ eventData, onUpdate }) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Select
      label="Month"
      placeholder="Select month (optional)"
      selectedKeys={eventData.yearlyMonth !== undefined ? [eventData.yearlyMonth.toString()] : []}
      onSelectionChange={(keys) => {
        const key = Array.from(keys)[0];
        onUpdate({ yearlyMonth: key ? parseInt(key) : undefined });
      }}
      radius="md"
      labelPlacement="outside"
      classNames={{ label: "text-sm font-medium text-gray-700 pb-1", trigger: "h-10" }}
    >
      {months.map((month, index) => (
        <SelectItem key={index.toString()}>{month}</SelectItem>
      ))}
    </Select>
  );
}
