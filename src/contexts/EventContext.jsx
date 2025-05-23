'use client';
import { createContext, useContext, useReducer } from 'react';

const EventContext = createContext();

const initialState = {
  eventData: {
    title: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isAllDay: false
  },
  buttonData: {
    buttonStyle: 'standard',
    buttonSize: 'medium',
    colorScheme: '#4D90FF',
    textColor: '#FFFFFF',
    selectedPlatforms: {
      google: true,
      apple: true,
      outlook: true
    }
  },
  generatedCode: '',
  isLoading: false
};

function eventReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_EVENT':
      return { ...state, eventData: { ...state.eventData, ...action.payload } };
    case 'UPDATE_BUTTON':
      return { ...state, buttonData: { ...state.buttonData, ...action.payload } };
    default:
      return state;
  }
}

export function EventContextProvider({ children }) {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  const updateEvent = (data) => {
    dispatch({ type: 'UPDATE_EVENT', payload: data });
  };

  const updateButton = (data) => {
    dispatch({ type: 'UPDATE_BUTTON', payload: data });
  };

  const value = {
    ...state,
    updateEvent,
    updateButton
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