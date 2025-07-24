'use client';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';
import { Input } from '@heroui/react';

export default function CustomTextSection() {
  const { buttonData, updateButton } = useEventFormLogic();

  return (
    <Input
      placeholder="Add to Calendar"
      value={buttonData.customText || ''}
      onChange={(e) => updateButton({ customText: e.target.value })}
      size="sm"
      variant="flat"
      classNames={{
            label: "text-size-12 font-medium text-gray-500",
            input: 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
      }}
    />
  );
}