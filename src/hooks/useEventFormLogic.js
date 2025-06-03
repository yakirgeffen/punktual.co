import { useMemo, useRef, useEffect } from 'react';
import { useEventContext } from '@/contexts/EventContext';
import { 
  roundToNext15Minutes, 
  formatTimeForInput, 
  addHoursToTime, 
  generateTimeOptions,
  getFilteredEndTimeOptions,
  getMinEndDate 
} from '@/utils/timeUtils';

/**
 * Custom hook for event form logic and state management
 */
export const useEventFormLogic = () => {
  const { eventData, updateEvent, buttonData, updateButton } = useEventContext();
  const initializedRef = useRef(false);

  // Initialize default values on first render
  useEffect(() => {
    if (!initializedRef.current) {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const updates = {};
      
      if (!eventData.startDate) updates.startDate = today;
      if (!eventData.endDate) updates.endDate = today;
      
      if (!eventData.isAllDay && !eventData.startTime) {
        const defaultStartTime = roundToNext15Minutes(now);
        const startTime24 = formatTimeForInput(defaultStartTime);
        updates.startTime = startTime24;
        if (!eventData.endTime) {
          updates.endTime = addHoursToTime(startTime24, 1);
        }
      }
      
      if (!eventData.timezone) {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        updates.timezone = userTimezone || 'UTC';
      }
      
      if (Object.keys(updates).length > 0) {
        updateEvent(updates);
      }
      initializedRef.current = true;
    }
  }, [eventData, updateEvent]);

  // Validation states
  const hasTitle = !!eventData.title?.trim();
  const hasStartDate = !!eventData.startDate;
  const hasStartTime = !!eventData.startTime || eventData.isAllDay;
  const hasEndDate = !!eventData.endDate;
  const hasEndTime = !!eventData.endTime || eventData.isAllDay;
  const hasPlatforms = Object.values(buttonData.selectedPlatforms || {}).some(Boolean);
  const isComplete = hasTitle && hasStartDate && hasStartTime && hasEndDate && hasEndTime && hasPlatforms;

  // Time options
  const fullTimeOptions = useMemo(() => generateTimeOptions(), []);
  const filteredEndTimeOptions = useMemo(() => 
    getFilteredEndTimeOptions(eventData.startTime, eventData.startDate, eventData.endDate, fullTimeOptions),
    [eventData.startTime, eventData.startDate, eventData.endDate, fullTimeOptions]
  );

  // Field change handler with smart defaults
  const handleFieldChange = (field, value) => {
    updateEvent({ [field]: value });
    
    // Auto-update end date when start date changes
    if (field === 'startDate' && value) {
      if (!eventData.endDate || new Date(value) > new Date(eventData.endDate)) {
        updateEvent({ endDate: value });
      }
    }
    
    // Auto-update end time when start time changes
    if (field === 'startTime' && value && !eventData.isAllDay) {
      if (!eventData.endTime || (eventData.startDate === eventData.endDate && value >= eventData.endTime)) {
        const endTime = addHoursToTime(value, 1);
        updateEvent({ endTime });
      }
    }
    
    // Handle all-day toggle
    if (field === 'isAllDay') {
      if (value) {
        updateEvent({ startTime: '', endTime: '' });
      } else {
        const now = new Date();
        const defaultTime = roundToNext15Minutes(now);
        const startTime = formatTimeForInput(defaultTime);
        const endTime = addHoursToTime(startTime, 1);
        updateEvent({ startTime, endTime });
      }
    }
  };

  // Platform selection logic
  const platforms = [
    { id: 'google', name: 'Google Calendar' },
    { id: 'apple', name: 'Apple Calendar' },
    { id: 'outlook', name: 'Microsoft Outlook' },
    { id: 'office365', name: 'Office 365' },
    { id: 'yahoo', name: 'Yahoo Calendar' }
  ];

  const handlePlatformSelectionChange = (keys) => {
    const selectedArray = Array.from(keys);
    const selectedPlatforms = {};
    platforms.forEach(platform => {
      selectedPlatforms[platform.id] = selectedArray.includes(platform.id);
    });
    updateButton({ selectedPlatforms });
  };

  const getSelectedPlatformKeys = () => {
    return new Set(platforms.filter(platform => buttonData.selectedPlatforms?.[platform.id]).map(p => p.id));
  };

  // Reminder options
  const reminderOptions = [
    { value: '0', label: 'At event time' },
    { value: '5', label: '5 minutes before' },
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '120', label: '2 hours before' },
    { value: '1440', label: '1 day before' },
    { value: '2880', label: '2 days before' },
    { value: '10080', label: '1 week before' }
  ];

  return {
    // Event data
    eventData,
    buttonData,
    
    // Validation states
    hasTitle,
    hasStartDate,
    hasStartTime,
    hasEndDate,
    hasEndTime,
    hasPlatforms,
    isComplete,
    
    // Time options
    fullTimeOptions,
    filteredEndTimeOptions,
    
    // Handlers
    handleFieldChange,
    handlePlatformSelectionChange,
    
    // Platform data
    platforms,
    getSelectedPlatformKeys,
    
    // Other options
    reminderOptions,
    
    // Utilities
    getMinEndDate: () => getMinEndDate(eventData.startDate),
    
    // Update functions
    updateEvent,
    updateButton
  };
};
