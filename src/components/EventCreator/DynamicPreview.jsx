// src/components/EventCreator/DynamicPreview.jsx
'use client';

import React from 'react';
import { useEventContext } from '@/contexts/EventContext';
import LivePreview from './LivePreview'; // Your existing component

const DynamicPreview = ({ selectedUseCase }) => {
  const { eventData } = useEventContext();

  // Placeholder components for each use case
  const EventPagePreview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Event Page Preview</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="font-medium text-gray-900">Hosted Event Page</h4>
          <p className="text-sm text-gray-500">A dedicated page for your event with shareable URL</p>
          <div className="mt-4 text-xs text-gray-400">
            URL: easycal.com/event/{eventData.title ? 'your-event-123' : 'event-id'}
          </div>
        </div>
      </div>
    </div>
  );

  const LinksPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Calendar Links</h3>
        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
      </div>
      
      {/* Use your existing LivePreview component */}
      <LivePreview />
    </div>
  );

  const ButtonPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Calendar Button</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <h4 className="font-medium text-gray-900">Embeddable Button</h4>
          <p className="text-sm text-gray-500">Single button with dropdown for all platforms</p>
          <div className="mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
              Add to Calendar ▼
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DirectLinksPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Direct Links</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 text-sm">Platform-Specific URLs</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Google Calendar</span>
              <code className="text-xs text-gray-500">easycal.com/event/123+google</code>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Apple Calendar</span>
              <code className="text-xs text-gray-500">easycal.com/event/123+apple</code>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Outlook</span>
              <code className="text-xs text-gray-500">easycal.com/event/123+outlook</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render the appropriate preview based on selected use case
  const renderPreview = () => {
    switch (selectedUseCase) {
      case 'page':
        return <EventPagePreview />;
      case 'links':
        return <LinksPreview />;
      case 'button':
        return <ButtonPreview />;
      case 'direct':
        return <DirectLinksPreview />;
      default:
        return <LinksPreview />; // Default to links
    }
  };

  return (
    <div className="h-full">
      {renderPreview()}
    </div>
  );
};

export default DynamicPreview;