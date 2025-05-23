// src/contexts/EventContext.jsx
'use client';

import { createContext, useContext, useState } from 'react';

const EventContext = createContext();

export function EventContextProvider({ children }) {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '10:00',
    endDate: '',
    endTime: '11:00',
    isAllDay: false
  });

  const [buttonData, setButtonData] = useState({
    buttonStyle: 'standard',
    buttonSize: 'medium',
    colorScheme: '#4D90FF',
    selectedPlatforms: {
      google: true,
      apple: true,
      outlook: true
    }
  });

  const updateEvent = (data) => {
    setEventData(prev => ({ ...prev, ...data }));
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