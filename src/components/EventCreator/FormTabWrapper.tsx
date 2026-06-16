//src/components/EventCreator/FormTabWrapper.tsx

'use client';
import React, { useState } from 'react';
import { Tabs, Tab } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEventContext } from '@/contexts/EventContext';
import { useSaveEvent } from '@/hooks/useSaveEvent';
import { useAuth } from '@/hooks/useAuth';
import BasicInformationSection from './sections/BasicInformationSection';
import EventDetailsSection from './sections/EventDetailsSection';
import PlatformSelectionSection from './sections/PlatformSelectionSection';
import ButtonCustomizationIndex from './sections/ButtonCustomization';

const FormTabWrapper: React.FC = () => {
  const { eventData, setSavedShortLinks } = useEventContext();
  const { saveEvent, loading } = useSaveEvent();
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleCreateEvent = async () => {
    if (user) {
      // User is authenticated - save to database and generate short links
      const result = await saveEvent(eventData);

      if (result) {
        setSavedShortLinks(result.shortLinks);
        setSaved(true);

        // Redirect to dashboard after toast has had time to register
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      }
      // Error handling is already done in the useSaveEvent hook
    } else {
      // User is not authenticated - demo mode (just generate calendar links)
      if (!eventData.title?.trim()) {
        import('react-hot-toast').then(({ default: toast }) => {
          toast.error('Please add an event title');
        });
        return;
      }

      if (!eventData.startDate || !eventData.startTime) {
        import('react-hot-toast').then(({ default: toast }) => {
          toast.error('Please set event date and time');
        });
        return;
      }

      try {
        // Unauthenticated mode: short-link creation requires auth (the API
        // returns 401), so we don't call it and we don't claim short links —
        // the previous version showed a false "Short links created!" success
        // while silently falling back to long URLs (review finding W6).
        const { generateCalendarLinks } = await import('@/utils/calendarGenerator');

        const originalLinks = generateCalendarLinks(eventData);
        setSavedShortLinks(originalLinks);
        setSaved(true);

        import('react-hot-toast').then(({ default: toast }) => {
          toast.success(`Calendar links ready for "${eventData.title}"! Sign in to save this event and get trackable short links.`);
        });

      } catch (error) {
        console.error('Error generating calendar links:', error);
        import('react-hot-toast').then(({ default: toast }) => {
          toast.error('Failed to generate calendar links');
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Tabs
        aria-label="Event creation steps"
        radius="md"
        className="w-full"
        classNames={{
          tabList: "w-full bg-white border border-gray-200 rounded-lg p-1",
          tab: "h-12 px-6 text-md font-medium",
          tabContent: "text-gray-400 hover:text-emerald-700 transition- group-data-[selected=true]:text-emerald-500",
          panel: "bg-white rounded-lg border border-gray-200 p-6 min-h-[400px] mt-4"
        }}
      >
        <Tab key="basic-info" title="Basic Information">
          <BasicInformationSection />
        </Tab>

        <Tab key="date-time" title="Date & Time">
          <EventDetailsSection />
        </Tab>

        <Tab key="platforms-button" title="Platforms & Button">
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Select Calendar Platforms
              </h3>
              <PlatformSelectionSection />
            </div>

            <hr className="border-gray-200" />

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Customize Button Appearance
              </h3>
              <ButtonCustomizationIndex />
            </div>
          </div>
        </Tab>
      </Tabs>

      {/* Create Event Button */}
      <div className="flex justify-center pt-6 border-t border-gray-200">
        <button
          onClick={handleCreateEvent}
          disabled={loading || saved}
          className={`px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
            saved
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default'
              : loading
              ? 'bg-emerald-500 text-white cursor-not-allowed opacity-80'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {loading
            ? 'Creating your event...'
            : saved
            ? (user ? '✅ Event Saved with Short Links!' : '✅ Calendar Links Ready!')
            : 'Create Event & Generate Links'
          }
        </button>
      </div>
    </div>
  );
};

export default FormTabWrapper;
