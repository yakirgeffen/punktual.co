// src/components/EventCreator/EventForm.jsx
import { useEventContext } from '@/contexts/EventContext'
import BasicDetails from '../FormSections/BasicDetails'
import EventDetails from '../FormSections/EventDetails'
import AdvancedOptions from '../FormSections/AdvancedOptions'
import ButtonCustomization from '../FormSections/ButtonCustomization'
import RecentEvents from '../RecentEvents/RecentEvents'
import CollapsibleSection from '../UI/CollapsibleSection'

export default function EventForm() {
  const { eventData, updateEvent } = useEventContext()

  return (
    <div className="space-y-6">
      {/* Always visible - Basic Details */}
      <div className="card">
        <BasicDetails />
      </div>

      {/* Recent Events - Always visible for logged in users */}
      <RecentEvents />

      {/* Collapsible Sections */}
      <CollapsibleSection 
        title="Event Details" 
        defaultOpen={false}
        icon="📝"
      >
        <EventDetails />
      </CollapsibleSection>

      <CollapsibleSection 
        title="Advanced Options" 
        defaultOpen={false}
        icon="⚙️"
      >
        <AdvancedOptions />
      </CollapsibleSection>

      <CollapsibleSection 
        title="Button Customization" 
        defaultOpen={true}
        icon="🎨"
      >
        <ButtonCustomization />
      </CollapsibleSection>
    </div>
  )
}