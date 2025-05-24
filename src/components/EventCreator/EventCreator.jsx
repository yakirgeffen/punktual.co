// Option 2: Two-Panel Layout with Toggle in Preview
'use client';

import { useState } from 'react';
import { useEventContext } from '@/contexts/EventContext';
import EventForm from './EventForm';
import DynamicPreview from './DynamicPreview';

export default function EventCreatorOption2() {
  const [selectedUseCase, setSelectedUseCase] = useState('links');

  const useCases = [
    { id: 'page', name: 'Event Page', icon: '📄', desc: 'Hosted page' },
    { id: 'links', name: 'Calendar Links', icon: '🔗', desc: 'For emails' },
    { id: 'button', name: 'Button Widget', icon: '🔘', desc: 'For websites' },
    { id: 'direct', name: 'Direct Links', icon: '⚡', desc: 'Platform URLs' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Clean Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">EasyCal</h1>
          <p className="text-sm text-gray-500">Create calendar integrations in seconds</p>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-5 gap-8 h-[calc(100vh-120px)]">
          
          {/* Form Panel (60%) */}
          <div className="col-span-3 bg-white rounded-lg border overflow-y-auto">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Event Details</h2>
                <p className="text-sm text-gray-500">Fill in your event information</p>
              </div>
              <EventForm />
            </div>
          </div>

          {/* Preview Panel with Integrated Toggle (40%) */}
          <div className="col-span-2 bg-white rounded-lg border overflow-y-auto">
            <div className="p-6">
              
              {/* Toggle Tabs */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Output Format</h2>
                <div className="grid grid-cols-2 gap-2">
                  {useCases.map((useCase) => (
                    <button
                      key={useCase.id}
                      onClick={() => setSelectedUseCase(useCase.id)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        selectedUseCase === useCase.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm">{useCase.icon}</span>
                        <span className={`text-xs font-medium ${
                          selectedUseCase === useCase.id ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {useCase.name}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        selectedUseCase === useCase.id ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {useCase.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Content */}
              <DynamicPreview selectedUseCase={selectedUseCase} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}