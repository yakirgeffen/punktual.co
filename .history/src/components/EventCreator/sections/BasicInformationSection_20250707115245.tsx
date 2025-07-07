'use client';
import { Input, Textarea } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

/**
 * Basic Information Section - Core event details
 * Event title, description, and location
 */
export default function BasicInformationSection() {
  const { eventData, handleFieldChange } = useEventFormLogic();

  return (
    <div className="space-y-6">
      {/* Event Title */}
      <Input
        label="Event Title"
        placeholder="Conference..."
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

      {/* Event Description */}
      <Textarea
        label="Event Description"
        placeholder="Join us for an exciting product launch event! We'll be showcasing our latest features and innovations..."
        value={eventData.description || ''}
        onChange={(e) => handleFieldChange('description', e.target.value)}
        radius="md"
        labelPlacement="outside"
        minRows={3}
        maxRows={6}
        classNames={{
          label: "text-sm font-medium text-gray-700 pb-1",
          input: "text-base placeholder:text-gray-400"
        }}
      />

      {/* Location */}
      <Input
        label="Location"
        placeholder="123 Main St, City, State or https://zoom.us/j/123456789"
        value={eventData.location || ''}
        onChange={(e) => handleFieldChange('location', e.target.value)}
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