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
          tab: "h-12 px-6 text-md font-medium",
          tabContent: "bg-zinc-100",
          "border",
          "shadow",
          "transition-colors",
          "focus-within:bg-zinc-100",
          "data-[hover=true]:border-zinc-600",
          "data-[hover=true]:bg-zinc-100",
          "group-data-[focus=true]:border-zinc-600",
          // dark theme
          "dark:bg-zinc-900",
          "dark:border-zinc-800",
          "dark:data-[hover=true]:bg-zinc-900",
          "dark:focus-within:bg-zinc-900",
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