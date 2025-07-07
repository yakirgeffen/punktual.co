'use client';
import { Accordion, AccordionItem } from '@heroui/react';
import BasicInformationSection from './sections/BasicInformationSection';
import EventDetailsSection from './sections/EventDetailsSection';
import PlatformSelectionSection from './sections/PlatformSelectionSection';
import ButtonCustomizationSection from './sections/ButtonCustomizationSection';
import StatusIndicator from './sections/StatusIndicator';
import { trackConversion } from '@/lib/analytics';

/**
 * EventForm - Main form orchestrator
 * Clean, focused component that uses section components for organization
 * Maintains accordion structure while delegating logic to specialized sections
 */
export default function EventForm() {
  return (
    <div className="space-y-6 pt-4">
      {/* All Sections in Accordion */}
      <Accordion 
        variant="bordered" 
        defaultExpandedKeys={["basic-info", "event-details"]} 
        className="shadow-sm"
        itemClasses={{
          indicator: "transition-transform group-data-[open=true]:rotate-180"
        }}
      >
        {/* Basic Information */}
        <AccordionItem key="basic-info" title="Basic Information" classNames={{ title: "text-lg font-semibold" }}>
          <BasicInformationSection />
        </AccordionItem>

        {/* Event Details */}
        <AccordionItem key="event-details" title="Event Details" classNames={{ title: "text-lg font-semibold" }}>
          <EventDetailsSection />
        </AccordionItem>

        {/* Platform Selection */}
        <AccordionItem key="platform-selection" title="Calendar Platforms" classNames={{ title: "text-lg font-semibold" }}>
          <PlatformSelectionSection />
        </AccordionItem>

        {/* Button Customization */}
        <AccordionItem key="button-customization" title="Button Customization" classNames={{ title: "text-lg font-semibold" }}>
          <ButtonCustomizationSection />
        </AccordionItem>
      </Accordion>

      {/* Status Indicator */}
      <StatusIndicator />
    </div>
  );
}
