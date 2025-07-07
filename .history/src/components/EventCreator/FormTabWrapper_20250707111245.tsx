'use client';
import React, { useState } from 'react';
import TabNavigation from './TabNavigation';
import BasicInformationSection from './sections/BasicInformationSection';
import EventDetailsSection from './sections/EventDetailsSection';
import PlatformSelectionSection from './sections/PlatformSelectionSection';
import ButtonCustomizationSection from './sections/ButtonCustomizationSection';

const TABS = [
  { id: 'basic-info', label: 'Basic Information' },
  { id: 'event-details', label: 'Event Details' },
  { id: 'platforms', label: 'Calendar Platforms' },
  { id: 'customization', label: 'Button Customization' }
];

const FormTabWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('basic-info');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic-info':
        return <BasicInformationSection />;
      case 'event-details':
        return <EventDetailsSection />;
      case 'platforms':
        return <PlatformSelectionSection />;
      case 'customization':
        return <ButtonCustomizationSection />;
      default:
        return <BasicInformationSection />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <TabNavigation
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default FormTabWrapper;