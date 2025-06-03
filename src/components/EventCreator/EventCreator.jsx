'use client';
import { useState } from 'react';
import { useEventContext } from '@/contexts/EventContext';
import EventForm from './EventForm';
import DynamicPreview from './DynamicPreview';

const USE_CASES = [
  {
    id: 'event-page',
    name: 'Event Page',
    description: 'Hosted event page with calendar integration',
    icon: '🌐'
  },
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
  }
];

export default function EventCreator() {
  const [selectedUseCase, setSelectedUseCase] = useState('button-widget');

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Clean Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EasyCal</h1>
            <p className="mt-1 text-gray-600">Create calendar integrations in seconds</p>
          </div>
        </div>
      </div>



      {/* Optimized Two-Panel Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-5 gap-6 min-h-[calc(100vh-140px)]">
          
          {/* Form Panel (60%) - Compact */}
          <div className="col-span-3 overflow-y-auto">
            <EventForm />
          </div>

          {/* Preview Panel (40%) - Compact */}
          <div className="col-span-2 overflow-y-auto">
            <DynamicPreview useCase={selectedUseCase} />
          </div>
        </div>
      </div>
    </div>
  );
}
