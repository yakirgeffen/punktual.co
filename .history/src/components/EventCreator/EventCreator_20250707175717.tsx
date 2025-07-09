//src/components/EventCreator/EventCreator.tsx

'use client';
import React, { useState } from 'react';
import { Select, SelectItem } from '@heroui/react';
import { useEventContext } from '@/contexts/EventContext';
import EventForm from './EventForm';
import DynamicPreview from './DynamicPreview';

const USE_CASES = [
  {
    id: 'individual-buttons',
    name: 'Add to Calendar (Individual Buttons)',
    description: 'Separate button for each calendar platform',
    icon: '🔘'
  },
  {
    id: 'dropdown-button',
    name: 'Add to Calendar (Dropdown)',
    description: 'Single button with platform dropdown',
    icon: '📅'
  },
  {
    id: 'direct-links',
    name: 'Direct Links',
    description: 'Easy to copy calendar links',
    icon: '🔗'
  },
  {
    id: 'event-page',
    name: 'Event Page',
    description: 'Full event landing page',
    icon: '🌐'
  }
];

export default function EventCreator() {
  const [selectedUseCase, setSelectedUseCase] = useState<string>('dropdown-button');
  const { setOutput } = useEventContext();

  const handleUseCaseChange = (useCaseId: string) => {
    setSelectedUseCase(useCaseId);
    setOutput?.(useCaseId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Two-Panel Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-5 gap-6 min-h-[calc(100vh-140px)]">
          
          {/* Form Panel (60%) */}
          <div className="col-span-3 overflow-y-auto">
            <EventForm />
          </div>

          {/* Preview Panel (40%) */}
          <div className="col-span-2 overflow-y-auto">
            <div className="space-y-4 pt-4">
              {/* Output Format Dropdown */}
              <div className="bg-white border rounded-lg p-4">
                <Select
                  label="Output Format"
                  placeholder="Choose your integration type"
                  selectedKeys={[selectedUseCase]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    handleUseCaseChange(selected);
                  }}
                  radius="md"
                  labelPlacement="outside"
                  classNames={{
                    label: "text-sm font-medium text-gray-700 pb-1",
                    trigger: "h-12"
                  }}
                >
                  {USE_CASES.map((useCase) => (
                    <SelectItem 
                      key={useCase.id} 
                      value={useCase.id}
                      textValue={useCase.name}
                    >
                      <div className="flex items-center gap-2">
                        <span>{useCase.icon}</span>
                        <div>
                          <div className="font-medium">{useCase.name}</div>
                          <div className="text-xs text-gray-500">{useCase.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Preview Component */}
              <DynamicPreview useCase={selectedUseCase} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}