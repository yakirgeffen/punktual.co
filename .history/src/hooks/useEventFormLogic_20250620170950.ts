import { useMemo, useRef, useEffect } from 'react';
import { useEventContext } from '@/contexts/EventContext';
import { 
  roundToNext15Minutes, 
  formatTimeForInput, 
  addHoursToTime, 
  getMinEndDate 
} from '@/utils/timeUtils';
import type { 
  EventData, 
  ButtonData, 
  CalendarPlatform, 
  TimeOption, 
  ReminderOption 
} from '@/types';

interface EventFormLogicReturn {
  // Data
  eventData: EventData;
  buttonData: ButtonData;
  
  // Validation states
  hasTitle: boolean;
  hasStartDate: boolean;
  hasStartTime: boolean;
  hasEndDate: boolean;
  hasEndTime: boolean;
  hasPlatforms: boolean;
  isComplete: boolean;
  
  // Time options
  hourOptions: TimeOption[];
  minuteOptions: TimeOption[];
  filteredEndHours: TimeOption[];
  filteredEndMinutes: TimeOption[];
  fullTimeOptions: TimeOption[];
  filteredEndTimeOptions: TimeOption[];
  
  // Handlers
  handleFieldChange: (field: keyof EventData, value: string | boolean | number | string[] | undefined) => void;
  handleStartTimeChange: (field: 'hour' | 'minute', value: string) => void;
  handleEndTimeChange: (field: 'hour' | 'minute', value: string) => void;
  handlePlatformSelectionChange: (keys: Set<string>) => void;
  
  // Platform data
  platforms: CalendarPlatform[];
  getSelectedPlatformKeys: () => Set<string>;
  
  // Other options
  reminderOptions: ReminderOption[];
  
  // Utilities
  getMinEndDate: () => string;
  
  // Update functions
  updateEvent: (data: Partial<EventData>) => void;
  updateButton: (data: Partial<ButtonData>) => void;
}

/**
 * Custom hook for event form logic and state management
 */
export const useEventFormLogic = (): EventFormLogicReturn => {
  const { eventData, updateEvent, buttonData, updateButton } = useEventContext();
  const initializedRef = useRef<boolean>(false);

  // Initialize default values on first render
  useEffect(() => {
    if (!initializedRef.current) {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const updates: Partial<EventData> = {};
      
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
  }, [
    eventData.startDate,
    eventData.endDate,
    eventData.isAllDay,
    eventData.startTime,
    eventData.endTime,
    eventData.timezone,
    updateEvent
  ]);

  // Validation states
  const hasTitle = !!eventData.title?.trim();
  const hasStartDate = !!eventData.startDate;
  const hasStartTime = !!eventData.startTime || !!eventData.isAllDay;
  const hasEndDate = !!eventData.endDate;
  const hasEndTime = !!eventData.endTime || !!eventData.isAllDay;
  const hasPlatforms = Object.values(buttonData.selectedPlatforms || {}).some(Boolean);
  const isComplete = hasTitle && hasStartDate && hasStartTime && hasEndDate && hasEndTime && hasPlatforms;

  // Time options for separate dropdowns
  const hourOptions = useMemo((): TimeOption[] => 
    Array.from({ length: 24 }, (_, i) => ({
      value: i.toString().padStart(2, '0'),
      label: i.toString().padStart(2, '0')
    })),
    []
  );

  const minuteOptions = useMemo((): TimeOption[] => [
    { value: '00', label: '00' },
    { value: '15', label: '15' },
    { value: '30', label: '30' },
    { value: '45', label: '45' }
  ], []);

  // Filtered end time options
  const filteredEndHours = useMemo((): TimeOption[] => {
    if (!eventData.startTime || eventData.startDate !== eventData.endDate) {
      return hourOptions;
    }
    
    const startHour = parseInt(eventData.startTime.split(':')[0]);
    const startMinute = parseInt(eventData.startTime.split(':')[1]);
    const currentEndMinute = eventData.endTime ? parseInt(eventData.endTime.split(':')[1]) : 0;
    
    return hourOptions.filter(option => {
      const hour = parseInt(option.value);
      if (hour > startHour) return true;
      if (hour === startHour && currentEndMinute > startMinute) return true;
      return false;
    });
  }, [eventData.startTime, eventData.startDate, eventData.endDate, eventData.endTime, hourOptions]);

  const filteredEndMinutes = useMemo((): TimeOption[] => {
    if (!eventData.startTime || eventData.startDate !== eventData.endDate || !eventData.endTime) {
      return minuteOptions;
    }
    
    const startHour = parseInt(eventData.startTime.split(':')[0]);
    const startMinute = parseInt(eventData.startTime.split(':')[1]);
    const endHour = parseInt(eventData.endTime.split(':')[0]);
    
    if (endHour > startHour) return minuteOptions;
    
    if (endHour === startHour) {
      return minuteOptions.filter(option => parseInt(option.value) > startMinute);
    }
    
    return minuteOptions;
  }, [eventData.startTime, eventData.startDate, eventData.endDate, eventData.endTime, minuteOptions]);

  // Legacy time options for backward compatibility
  const fullTimeOptions = useMemo((): TimeOption[] => {
    const options: TimeOption[] = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        const amTime24 = hour === 12 ? `00:${minuteStr}` : `${hourStr}:${minuteStr}`;
        const amLabel = `${hourStr}:${minuteStr} AM`;
        options.push({ value: amTime24, label: amLabel });
        const pmTime24 = hour === 12 ? `12:${minuteStr}` : `${(hour + 12).toString().padStart(2, '0')}:${minuteStr}`;
        const pmLabel = `${hourStr}:${minuteStr} PM`;
        options.push({ value: pmTime24, label: pmLabel });
      }
    }
    return options.sort((a, b) => {
      const [aHour, aMin] = a.value.split(':').map(Number);
      const [bHour, bMin] = b.value.split(':').map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    });
  }, []);

  const filteredEndTimeOptions = useMemo((): TimeOption[] => {
    if (!eventData.startTime || eventData.startDate !== eventData.endDate) {
      return fullTimeOptions;
    }
    const [startHour, startMin] = eventData.startTime.split(':').map(Number);
    const startTotal = startHour * 60 + startMin;
    return fullTimeOptions.filter(option => {
      const [optionHour, optionMin] = option.value.split(':').map(Number);
      return optionHour * 60 + optionMin > startTotal;
    });
  }, [eventData.startTime, eventData.startDate, eventData.endDate, fullTimeOptions]);

  // Field change handler with smart defaults and type guards
  const handleFieldChange = (field: keyof EventData, value: string | boolean | number | string[] | undefined): void => {
    updateEvent({ [field]: value });
    
    // Auto-update end date when start date changes
    if (field === 'startDate' && typeof value === 'string') {
      if (!eventData.endDate || new Date(value) > new Date(eventData.endDate)) {
        updateEvent({ endDate: value });
      }
    }
    
    // Auto-update end time when start time changes
    if (field === 'startTime' && typeof value === 'string' && !eventData.isAllDay) {
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

  // Helper functions for time handling
  const handleStartTimeChange = (field: 'hour' | 'minute', value: string): void => {
    const currentTime = eventData.startTime || '09:00';
    const [currentHour, currentMinute] = currentTime.split(':');
    
    const newHour = field === 'hour' ? value : currentHour;
    const newMinute = field === 'minute' ? value : currentMinute;
    
    handleFieldChange('startTime', `${newHour}:${newMinute}`);
  };

  const handleEndTimeChange = (field: 'hour' | 'minute', value: string): void => {
    const currentTime = eventData.endTime || '10:00';
    const [currentHour, currentMinute] = currentTime.split(':');
    
    const newHour = field === 'hour' ? value : currentHour;
    const newMinute = field === 'minute' ? value : currentMinute;
    
    handleFieldChange('endTime', `${newHour}:${newMinute}`);
  };

  // Platform selection logic
  const platforms: CalendarPlatform[] = [
    { id: 'google', name: 'Google Calendar' },
    { id: 'apple', name: 'Apple Calendar' },
    { id: 'outlook', name: 'Microsoft Outlook' },
    { id: 'office365', name: 'Office 365' },
    { id: 'yahoo', name: 'Yahoo Calendar' }
  ];

  const handlePlatformSelectionChange = (keys: Set<string>): void => {
    const selectedArray = Array.from(keys);
    const selectedPlatforms: Record<string, boolean> = {};
    platforms.forEach(platform => {
      selectedPlatforms[platform.id] = selectedArray.includes(platform.id);
    });
    updateButton({ selectedPlatforms });
  };

  const getSelectedPlatformKeys = (): Set<string> => {
    return new Set(platforms.filter(platform => 
      (buttonData.selectedPlatforms as Record<string, boolean>)?.[platform.id]
    ).map(p => p.id));
  };

  // Reminder options
  const reminderOptions: ReminderOption[] = [
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
    
    // New separate time options
    hourOptions,
    minuteOptions,
    filteredEndHours,
    filteredEndMinutes,
    
    // Legacy time options (for backward compatibility)
    fullTimeOptions,
    filteredEndTimeOptions,
    
    // Handlers
    handleFieldChange,
    handleStartTimeChange,
    handleEndTimeChange,
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
