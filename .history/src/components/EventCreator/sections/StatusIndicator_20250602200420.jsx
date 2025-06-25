'use client';
import { Card, CardBody } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

/**
 * Status Indicator - Shows form completion status and validation
 * Displays success or warning state with required field checklist
 */
export default function StatusIndicator() {
  const { 
    isComplete,
    hasTitle,
    hasStartDate,
    hasStartTime,
    hasEndDate,
    hasEndTime,
    hasPlatforms,
    eventData
  } = useEventFormLogic();

  if (isComplete) {
    return (
      <Card className="border-2 border-success-300 bg-success-50 shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center gap-3 text-success-800">
            <div className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <span className="text-sm font-semibold">Ready to generate your calendar button!</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-warning-300 bg-warning-50 shadow-sm">
      <CardBody className="p-4">
        <div className="flex items-center gap-3 text-warning-800">
          <div className="w-6 h-6 rounded-full bg-warning-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <div>
            <span className="text-sm font-semibold">Please complete the required fields:</span>
            <ul className="text-xs mt-1 ml-2">
              {!hasTitle && <li>• Event title</li>}
              {!hasStartDate && <li>• Start date</li>}
              {!hasStartTime && !eventData.isAllDay && <li>• Start time</li>}
              {!hasEndDate && <li>• End date</li>}
              {!hasEndTime && !eventData.isAllDay && <li>• End time</li>}
              {!hasPlatforms && <li>• At least one calendar platform</li>}
            </ul>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
