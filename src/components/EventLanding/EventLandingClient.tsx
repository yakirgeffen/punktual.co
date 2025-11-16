/**
 * EventLandingClient.tsx
 * Client component for event landing page
 * Shows event details and individual calendar buttons
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PoweredByBadge from '@/components/shared/PoweredByBadge';
import type { EventData, CalendarLinks } from '@/types';

interface EventLandingClientProps {
  eventData: EventData;
  calendarLinks: CalendarLinks;
  shareId: string;
  showPoweredBy?: boolean;
  showUpsell?: boolean; // Show "Create your own" CTA for free tier events
}

const EventLandingClient: React.FC<EventLandingClientProps> = ({
  eventData,
  calendarLinks,
  shareId,
  showPoweredBy = true,
  showUpsell = true
}) => {
  // Platform info mapping
  const platformInfo: Record<string, { name: string; logo: string; color: string }> = {
    google: { name: 'Google Calendar', logo: '/icons/platforms/icon-google.svg', color: '#4285F4' },
    apple: { name: 'Apple Calendar', logo: '/icons/platforms/icon-apple.svg', color: '#000000' },
    outlook: { name: 'Outlook', logo: '/icons/platforms/icon-outlook.svg', color: '#0078D4' },
    office365: { name: 'Office 365', logo: '/icons/platforms/icon-office365.svg', color: '#D83B01' },
    outlookcom: { name: 'Outlook.com', logo: '/icons/platforms/icon-outlook.svg', color: '#0078D4' },
    yahoo: { name: 'Yahoo Calendar', logo: '/icons/platforms/icon-yahoo.svg', color: '#6001D2' }
  };

  // Get available platforms (those with valid links)
  const availablePlatforms = Object.keys(calendarLinks)
    .filter(platform => calendarLinks[platform as keyof CalendarLinks]);

  // Format date/time for display
  const formatDateTime = () => {
    if (!eventData.startDate) return null;

    try {
      const startDate = new Date(eventData.startDate);
      const dateStr = startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      if (eventData.isAllDay) {
        return `${dateStr} (All day)`;
      }

      if (!eventData.startTime) return dateStr;

      const [hours, minutes] = eventData.startTime.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      const timeStr = `${hour12}:${minutes} ${ampm}`;

      return `${dateStr} at ${timeStr}`;
    } catch {
      return null;
    }
  };

  const formattedDateTime = formatDateTime();

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="text-2xl font-bold text-emerald-600">
              📅 Punktual
            </div>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

          {/* Event Details */}
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {eventData.title}
            </h1>

            {formattedDateTime && (
              <div className="flex items-start gap-3 text-gray-700 mb-3">
                <span className="text-xl mt-0.5">🕒</span>
                <p className="font-medium text-lg">{formattedDateTime}</p>
              </div>
            )}

            {eventData.location && (
              <div className="flex items-start gap-3 text-gray-700 mb-3">
                <span className="text-xl mt-0.5">📍</span>
                <p className="text-base">{eventData.location}</p>
              </div>
            )}

            {eventData.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {eventData.description}
                </p>
              </div>
            )}
          </div>

          {/* Calendar Buttons */}
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
            <h2 className="text-center text-lg font-semibold text-gray-900 mb-6">
              Add to Calendar
            </h2>

            <div className="flex flex-wrap justify-center gap-3">
              {availablePlatforms.map(platform => {
                const info = platformInfo[platform] || {
                  name: platform.charAt(0).toUpperCase() + platform.slice(1),
                  logo: '/icons/platforms/icon-calendar.svg',
                  color: '#10b981'
                };
                const link = calendarLinks[platform as keyof CalendarLinks];

                return (
                  <a
                    key={platform}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-5 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-emerald-400 hover:shadow-md transition-all duration-200 group"
                  >
                    <Image
                      src={info.logo}
                      alt={info.name}
                      width={20}
                      height={20}
                      className="flex-shrink-0 group-hover:scale-110 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = '/icons/platforms/icon-calendar.svg';
                      }}
                    />
                    <span className="font-medium text-gray-900 text-sm">
                      {info.name}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Share Link */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-900 mb-1">Share this event:</p>
                  <p className="text-sm font-mono text-blue-700 truncate">
                    {typeof window !== 'undefined' ? window.location.href : `punktual.co/e/${shareId}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const url = typeof window !== 'undefined' ? window.location.href : `https://punktual.co/e/${shareId}`;
                    navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                  }}
                  className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Upsell CTA for free tier events */}
          {showUpsell && (
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
              <div className="text-center">
                <p className="text-sm font-medium mb-2">
                  💡 Want to create your own calendar buttons?
                </p>
                <Link
                  href="/create"
                  className="inline-block px-6 py-2.5 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                >
                  Create Your Event
                </Link>
              </div>
            </div>
          )}

          {/* Powered by Badge */}
          {showPoweredBy && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <PoweredByBadge variant="inline" utmSource="landing_page" className="justify-center" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            Need help?{' '}
            <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default EventLandingClient;
