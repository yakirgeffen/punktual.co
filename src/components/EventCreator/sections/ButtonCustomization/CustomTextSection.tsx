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
      variant="bordered"
      classNames={{
        input: "text-sm",
        inputWrapper: "h-10"
      }}
    />
  );
}