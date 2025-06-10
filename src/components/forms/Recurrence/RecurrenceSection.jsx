'use client';
import { Switch } from '@heroui/react';
import RecurrenceControls from './RecurrenceControls';
import RecurrencePreview from './RecurrencePreview';

export default function RecurrenceSection({ eventData, onUpdate }) {
  return (
    <div className="space-y-4">
      <Switch
        isSelected={eventData.isRecurring || false}
        onValueChange={(checked) => onUpdate({ isRecurring: checked })}
        size="md"
        classNames={{ label: "text-sm font-medium text-gray-700" }}
      >
        Recurring event
      </Switch>
      
      {eventData.isRecurring && (
        <div className="space-y-4 ml-6 pl-6 border-l-2 border-emerald-200 bg-red-500/30 rounded-r-lg py-4">
          <RecurrenceControls eventData={eventData} onUpdate={onUpdate} />
          <RecurrencePreview eventData={eventData} />
        </div>
      )}
    </div>
  );
}
