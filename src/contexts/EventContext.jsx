// src/contexts/EventContext.jsx
'use client';

import { createContext, useContext, useState } from 'react';

const EventContext = createContext();

// Helper function to get current date
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Helper function to get rounded next 30 minutes
const getRoundedNextTime = () => {
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
const getEndTime = (startTime) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = hours + 1;
  return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export function EventContextProvider({ children }) {
  const currentDate = getCurrentDate();
  const currentTime = getRoundedNextTime();
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
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
  });

  const [buttonData, setButtonData] = useState({
    buttonStyle: 'standard',
    buttonSize: 'medium',
    colorScheme: '#4D90FF',
    textColor: '#FFFFFF',
    selectedPlatforms: {
      google: true,
      apple: true,
      outlook: true,
      office365: false,
      yahoo: false
    }
  });

  const updateEvent = (data) => {
    console.log('Updating event data:', data);
    
    // Smart date logic
    let updatedData = { ...data };
    
    // If start date changes, update end date to match (if end date is before start date)
    if (data.startDate && eventData.endDate < data.startDate) {
      updatedData.endDate = data.startDate;
    }
    
    // If start time changes and it's the same day, ensure end time is after start time
    if (data.startTime && eventData.startDate === eventData.endDate) {
      const startTime = data.startTime;
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = eventData.endTime.split(':').map(Number);
      
      if (startHours >= endHours && startMinutes >= endMinutes) {
        updatedData.endTime = getEndTime(startTime);
      }
    }
    
    setEventData(prev => ({ ...prev, ...updatedData }));
  };

  const updateButton = (data) => {
    setButtonData(prev => ({ ...prev, ...data }));
  };

  const value = {
    eventData,
    buttonData,
    updateEvent,
    updateButton,
    isLoading: false,
    generatedCode: ''
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within EventContextProvider');
  }
  return context;
}