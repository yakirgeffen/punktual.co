// src/contexts/EventContext.tsx - TYPED VERSION
'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { generateCalendarCode, generateCalendarLinks } from '@/utils/calendarGenerator';
import type { 
  EventData, 
  ButtonData, 
  CalendarLinks, 
  EventContextType 
} from '@/types';

const EventContext = createContext<EventContextType | undefined>(undefined);

// Helper function to get current date
const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper function to get rounded next 30 minutes
const getRoundedNextTime = (): string => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = minutes <= 30 ? 30 : 60;
  
  if (roundedMinutes === 60) {
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
  } else {
    now.setMinutes(30);
  }
  
  return now.toTimeString().slice(0, 5);
};

// Helper function to get end time (1 hour after start)
const getEndTime = (startTime: string): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = hours + 1;
  return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

interface EventContextProviderProps {
  children: ReactNode;
}

export function EventContextProvider({ children }: EventContextProviderProps) {
  // Initialize state with proper default values - only run once
  const [eventData, setEventData] = useState<EventData>(() => {
    const currentDate = getCurrentDate();
    const currentTime = getRoundedNextTime();
    
    return {
      title: 'Sample Product Launch',
      description: 'Join us for an exciting product launch event!',
      location: 'Online Event',
      organizer: '',
      startDate: currentDate,
      startTime: currentTime,
      endDate: currentDate,
      endTime: getEndTime(currentTime),
      timezone: 'UTC',
      isAllDay: false,
      isRecurring: false,
      recurrencePattern: 'weekly',
      recurrenceEndDate: '',
      recurrenceCount: 1
    };
  });

  const [buttonData, setButtonData] = useState<ButtonData>({
    buttonStyle: 'standard',
    buttonSize: 'medium',
    colorScheme: '#4D90FF',
    textColor: '#FFFFFF',
    selectedPlatforms: {
      google: true,
      apple: true,
      outlook: true,
      office365: false,
      outlookcom: false,
      yahoo: false
    }
  });

  const [outputType, setOutputType] = useState<string>('links');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [calendarLinks, setCalendarLinks] = useState<CalendarLinks>({});

  // Stable callback functions using useCallback
  const updateEvent = useCallback((data: Partial<EventData>) => {
    console.log('Updating event data:', data);
    
    setEventData(prevEventData => {
      const newEventData = { ...prevEventData, ...data };
      
      // Smart date logic - ensure end date is not before start date
      if (data.startDate && newEventData.endDate) {
        if (new Date(data.startDate) > new Date(newEventData.endDate)) {
          newEventData.endDate = data.startDate;
        }
      }
      
      // Smart time logic - ensure end time is after start time on same day
      if (
        data.startTime && 
        newEventData.startDate === newEventData.endDate && 
        newEventData.endTime
      ) {
        const [startHours, startMinutes] = data.startTime.split(':').map(Number);
        const [endHours, endMinutes] = newEventData.endTime.split(':').map(Number);

        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        if (startTotalMinutes >= endTotalMinutes) {
          newEventData.endTime = getEndTime(data.startTime);
        }
      }
      
      return newEventData;
    });
  }, []); // Empty dependency array - function never changes

  const updateButton = useCallback((data: Partial<ButtonData>) => {
    console.log('Updating button data:', data);
    setButtonData(prev => ({ ...prev, ...data }));
  }, []); // Empty dependency array - function never changes

  const setOutput = useCallback((type: string) => {
    console.log('Setting output type:', type);
    setOutputType(type);
  }, []); // Empty dependency array - function never changes

  // Generate code and links whenever data changes
  useEffect(() => {
    console.log('Generating calendar data...', { eventData, buttonData, outputType });
    
    try {
      const code = generateCalendarCode(eventData, buttonData, outputType);
      const links = generateCalendarLinks(eventData);
      
      console.log('Generated links:', links);
      console.log('Generated code length:', code.length);
      
      setGeneratedCode(code);
      setCalendarLinks(links);
    } catch (error) {
      console.error('Error generating calendar data:', error);
      setGeneratedCode('<!-- Error generating calendar code -->');
      setCalendarLinks({});
    }
  }, [eventData, buttonData, outputType]); // These dependencies are fine since they're state values

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<EventContextType>(() => ({
    eventData,
    buttonData,
    outputType,
    generatedCode,
    calendarLinks,
    updateEvent,
    updateButton,
    setOutput,
    isLoading: false
  }), [
    eventData,
    buttonData,
    outputType,
    generatedCode,
    calendarLinks,
    updateEvent,
    updateButton,
    setOutput
  ]);

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext(): EventContextType {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within EventContextProvider');
  }
  return context;
}