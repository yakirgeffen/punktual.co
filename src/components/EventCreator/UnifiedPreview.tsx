'use client';
import React, { useState, useEffect } from 'react';
import { useEventContext } from '@/contexts/EventContext';
import EventSummary from './Preview/EventSummary';
import PreviewTabs from './Preview/PreviewTabs';
import DropdownPreview from './Preview/DropdownPreview';
import IndividualButtonsPreview from './Preview/IndividualButtonsPreview';

/**
 * UnifiedPreview Component
 *
 * Orchestrates preview display with tabs for different button layouts
 * - Event summary (always shown)
 * - Tab switcher (Dropdown vs Individual)
 * - Dynamic preview based on selected layout
 */
const UnifiedPreview: React.FC = () => {
  const { eventData, buttonData, calendarLinks, updateButton } = useEventContext();

  // Local state for active preview tab (syncs with buttonLayout)
  const [activePreviewLayout, setActivePreviewLayout] = useState<'dropdown' | 'individual'>(
    buttonData.buttonLayout === 'individual' ? 'individual' : 'dropdown'
  );

  // Auto-sync preview tab when buttonLayout changes (from customization panel)
  useEffect(() => {
    const layoutFromContext = buttonData.buttonLayout === 'individual' ? 'individual' : 'dropdown';
    setActivePreviewLayout(layoutFromContext);
  }, [buttonData.buttonLayout]);

  // Handle tab change - also updates the context
  const handleLayoutChange = (layout: 'dropdown' | 'individual') => {
    setActivePreviewLayout(layout);
    updateButton({ buttonLayout: layout });
  };

  // Validation checks
  const hasTitle = !!eventData?.title?.trim();
  const hasStartDateTime = !!eventData?.startDate && (!!eventData?.startTime || !!eventData?.isAllDay);
  const hasEndDateTime = !!eventData?.endDate && (!!eventData?.endTime || !!eventData?.isAllDay);

  const selectedPlatforms = Object.keys(buttonData?.selectedPlatforms || {})
    .filter(platform => buttonData?.selectedPlatforms?.[platform as keyof typeof buttonData.selectedPlatforms]);
  const hasPlatforms = selectedPlatforms.length > 0;

  const isComplete = hasTitle && hasStartDateTime && hasEndDateTime && hasPlatforms;

  return (
    <div className="h-full sticky top-4">
      <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col shadow-sm overflow-hidden">

        {/* Header with status indicator */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Preview</h3>
              <p className="text-xs text-gray-600">Live preview of your event</p>
            </div>
            {/* Status Badge */}
            {hasTitle ? (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isComplete
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                {isComplete ? '✓ Ready' : 'In Progress'}
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                Not Started
              </div>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto">
          {!hasTitle ? (
            <div className="text-center py-8 px-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <span className="text-3xl">✏️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What&apos;s your event called?</h3>
              <p className="text-gray-600 text-sm max-w-xs mx-auto">
                We&apos;ve set smart defaults for date, time &amp; platforms
              </p>
            </div>
          ) : !isComplete ? (
            <div className="text-center py-8 px-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-blue-200">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Almost There!</h3>
              <p className="text-gray-600 text-sm mb-4 max-w-xs mx-auto">
                Please verify the dates and times are correct
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-xs mx-auto text-left space-y-2">
                {!hasStartDateTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500">○</span>
                    <span>Set start date & time</span>
                  </div>
                )}
                {!hasEndDateTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500">○</span>
                    <span>Set end date & time</span>
                  </div>
                )}
                {!hasPlatforms && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500">○</span>
                    <span>Select at least one platform</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Event Summary */}
              <EventSummary eventData={eventData} />

              {/* Preview Tabs */}
              <PreviewTabs
                activeLayout={activePreviewLayout}
                onLayoutChange={handleLayoutChange}
              />

              {/* Dynamic Button Preview based on active tab */}
              <div className="bg-white rounded-b-lg">
                {activePreviewLayout === 'dropdown' ? (
                  <DropdownPreview
                    buttonData={buttonData}
                    calendarLinks={calendarLinks}
                    showPoweredBy={true}
                  />
                ) : (
                  <IndividualButtonsPreview
                    eventData={eventData}
                    buttonData={buttonData}
                    calendarLinks={calendarLinks}
                    showPoweredBy={true}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA - Always visible when complete */}
        {isComplete && (
          <div className="border-t border-gray-200 p-3 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30">
            <div className="flex items-center gap-2 text-emerald-900">
              <span className="text-base">✨</span>
              <p className="text-xs font-medium">
                Ready to save! Click <strong>Create Event</strong> below
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UnifiedPreview;
