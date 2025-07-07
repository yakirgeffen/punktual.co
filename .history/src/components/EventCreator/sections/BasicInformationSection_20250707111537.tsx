'use client';
import { Input } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

/**
 * Basic Information Section - Event title input
 * Simple, focused component for the first accordion section
 */
export default function BasicInformationSection() {
  const { eventData, handleFieldChange } = useEventFormLogic();

  return (
    <div className="space-y-6">
      <Input
        label="Event Title"
        placeholder="Product Launch, Team Meeting, Conference..."
        value={eventData.title || ''}
        onChange={(e) => handleFieldChange('title', e.target.value)}
        isRequired
        radius="md"
        labelPlacement="outside"
        classNames={{
          label: "text-sm font-medium text-gray-700 pb-1",
          input: "text-base placeholder:text-gray-400",
          inputWrapper: "h-12"
        }}
      />
    </div>
  );
}