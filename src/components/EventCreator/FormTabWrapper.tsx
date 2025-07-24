//src/components/EventCreator/FormTabWrapper.tsx

'use client';
import React from 'react';
import { Tabs, Tab } from '@heroui/react';
import BasicInformationSection from './sections/BasicInformationSection';
import EventDetailsSection from './sections/EventDetailsSection';
import PlatformSelectionSection from './sections/PlatformSelectionSection';
import ButtonCustomizationIndex from './sections/ButtonCustomization';

const FormTabWrapper: React.FC = () => {
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
    </div>
  );
};

export default FormTabWrapper;