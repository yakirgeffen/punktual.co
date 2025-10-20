//src/components/EventCreator/EventCreator.tsx

'use client';
import React from 'react';
import EventForm from './EventForm';
import UnifiedPreview from './UnifiedPreview';

export default function EventCreator() {
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
          <div className="col-span-2 overflow-y-auto pt-4">
            <UnifiedPreview />
          </div>
        </div>
      </div>
    </div>
  );
}