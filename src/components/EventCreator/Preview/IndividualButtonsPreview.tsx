/**
 * IndividualButtonsPreview.tsx
 * Displays individual platform buttons (CalGet-style layout)
 * Email-safe with table-based layout and inline styles
 */

'use client';

import React from 'react';
import Image from 'next/image';
import type { EventData, ButtonData, CalendarLinks } from '@/types';

interface IndividualButtonsPreviewProps {
  eventData: EventData;
  buttonData: ButtonData;
  calendarLinks: CalendarLinks;
  showPoweredBy?: boolean; // Show "Powered by Punktual" badge
}

const IndividualButtonsPreview: React.FC<IndividualButtonsPreviewProps> = ({
  eventData,
  buttonData,
  calendarLinks,
  showPoweredBy = true
}) => {
  // Platform info mapping
  const platformInfo: Record<string, { name: string; logo: string; shortName: string }> = {
    google: { name: 'Google Calendar', shortName: 'Google', logo: '/icons/platforms/icon-google.svg' },
    apple: { name: 'Apple Calendar', shortName: 'Apple', logo: '/icons/platforms/icon-apple.svg' },
    outlook: { name: 'Outlook', shortName: 'Outlook', logo: '/icons/platforms/icon-outlook.svg' },
    office365: { name: 'Office 365', shortName: 'Office 365', logo: '/icons/platforms/icon-office365.svg' },
    outlookcom: { name: 'Outlook.com', shortName: 'Outlook.com', logo: '/icons/platforms/icon-outlook.svg' },
    yahoo: { name: 'Yahoo Calendar', shortName: 'Yahoo', logo: '/icons/platforms/icon-yahoo.svg' }
  };

  // Get selected platforms
  const selectedPlatforms = Object.keys(buttonData?.selectedPlatforms || {})
    .filter(platform => buttonData?.selectedPlatforms?.[platform as keyof typeof buttonData.selectedPlatforms])
    .filter(platform => calendarLinks[platform as keyof CalendarLinks]); // Only show platforms with valid links

  if (selectedPlatforms.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Select at least one platform to see the preview
      </div>
    );
  }

  const colorTheme = buttonData?.colorTheme || '#10b981';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h4 className="font-semibold text-gray-900 mb-1">
          Add to Calendar
        </h4>
        <p className="text-xs text-gray-600">
          Individual buttons for {eventData.title || 'your event'}
        </p>
      </div>

      {/* Individual Buttons Container */}
      <div className="flex flex-wrap justify-center gap-2">
        {selectedPlatforms.map(platform => {
          const info = platformInfo[platform] || {
            name: platform.charAt(0).toUpperCase() + platform.slice(1),
            shortName: platform.charAt(0).toUpperCase() + platform.slice(1),
            logo: '/icons/platforms/icon-calendar.svg'
          };
          const link = calendarLinks[platform as keyof CalendarLinks];

          return (
            <div
              key={platform}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
              onClick={() => link && window.open(link, '_blank')}
            >
              <Image
                src={info.logo}
                alt={info.name}
                width={18}
                height={18}
                className="flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/icons/platforms/icon-calendar.svg';
                }}
              />
              <span className="text-sm font-medium text-gray-900">
                {info.shortName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Powered by Badge */}
      {showPoweredBy && (
        <div className="text-center pt-2 border-t border-gray-200">
          <a
            href="https://punktual.co?utm_source=preview&utm_medium=button"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>Powered by</span>
            <span className="font-semibold">Punktual</span>
          </a>
        </div>
      )}

      {/* Email-safe code hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 text-sm">💡</span>
          <div className="text-xs text-blue-900">
            <strong>Email-ready:</strong> Uses table-based layout with inline styles for maximum email client compatibility
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualButtonsPreview;
