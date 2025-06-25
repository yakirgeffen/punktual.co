'use client';
import { useState } from 'react';
import { Button, ButtonGroup } from '@heroui/react';
import EventForm from './EventForm';
import DynamicPreview from './DynamicPreview';

const USE_CASES = [
  {
    id: 'button-widget',
    name: 'Add to Calendar (Button)',
    description: 'Interactive button widget for websites',
    icon: '🔘'
  },
  {
    id: 'email-links',
    name: 'Add to Calendar (Links)', 
    description: 'Email-friendly calendar links',
    icon: '📧'
  },
  {
    id: 'direct-links',
    name: 'Direct Links',
    description: 'Raw platform URLs for custom integration',
    icon: '🔗'
  },
  {
    id: 'event-page',
    name: 'Event Page',
    description: 'Hosted event page with calendar integration',
    icon: '🌐'
  }
];

export default function EventCreator() {
  const [selectedUseCase, setSelectedUseCase] = useState<string>('button-widget');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use Case Selection Header */}
      <div className="bg-zinc-300 border-b px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900">What do you want to create?</h1>
            <p className="text-sm text-gray-600 mt-1">Choose your output format</p>
          </div>
          
          {/* Hero UI ButtonGroup for Use Case Selection */}
          <ButtonGroup variant="bordered" className="w-full">
            {USE_CASES.map((useCase) => (
              <Button
                key={useCase.id}
                // variant={selectedUseCase === useCase.id ? 'solid' : 'bordered'}
                // color={selectedUseCase === useCase.id ? 'success' : 'default'}
                style={selectedUseCase === useCase.id ? { 
                  backgroundColor: '#66E0B3', 
                  color: '#262626',
                  border: '#262626',
                  // boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                  transition: 'background-color 0.2s ease, color 0.3s ease'
                } : undefined}
                onPress={() => setSelectedUseCase(useCase.id)}
                className="flex-1 h-auto py-3"
              >
                <div className="flex flex-col items-center gap-1">
                  {/* <span className="text-lg">{useCase.icon}</span> */}
                  <span className="text-m font-medium">{useCase.name}</span>
                </div>
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-5 gap-6 min-h-[calc(100vh-200px)]">
          
          {/* Form Panel (60%) */}
          <div className="col-span-3 overflow-y-auto">
            <EventForm />
          </div>

          {/* Preview Panel (40%) */}
          <div className="col-span-2 overflow-y-auto">
            <DynamicPreview useCase={selectedUseCase} />
          </div>
        </div>
      </div>
    </div>
  );
}