'use client';
import React from 'react';
import { Tabs, Tab } from '@heroui/react';
import BasicInformationSection from './sections/BasicInformationSection';
import EventDetailsSection from './sections/EventDetailsSection';
import PlatformSelectionSection from './sections/PlatformSelectionSection';

const FormTabWrapper: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs 
        aria-label="Event creation steps" 
        radius="md"
        className="w-full"
        classNames={{
          tabList: "w-full bg-white border border-gray-200 rounded-lg p-1",
          tab: "h-8 px-6 text-sm font-medium",
          tabContent: "text-gray-600 group-data-[selected=true]:text-emerald-600",
          panel: "bg-white rounded-lg border border-gray-400 p-6 min-h-[400px] mt-4"
        }}
      >
        <Tab key="basic-info" title="Basic Information">
          <BasicInformationSection />
        </Tab>
        
        <Tab key="date-time" title="Date & Time">
          <EventDetailsSection />
        </Tab>
        
        <Tab key="platforms-button" title="Platforms & Button">
          <PlatformSelectionSection />
        </Tab>
      </Tabs>
    </div>
  );
};

export default FormTabWrapper;