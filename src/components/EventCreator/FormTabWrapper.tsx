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
        // Event was saved successfully and short links were generated
        setSavedShortLinks(result.shortLinks);
        setSaved(true);
        console.log('Event saved with ID:', result.eventId);
        console.log('Short links set:', result.shortLinks);

        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
      // Error handling is already done in the useSaveEvent hook
    } else {
      // User is not authenticated - demo mode (just generate short links)
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
          className={`px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 ${
            saved
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default'
              : loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading
            ? 'Creating Event...'
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