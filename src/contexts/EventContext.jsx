// src/contexts/EventContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { generateCalendarCode } from '@/lib/calendarGenerator'
import { saveEventToStorage, loadEventFromStorage } from '@/lib/storage'

const EventContext = createContext()

const initialState = {
  eventData: {
    title: '',
    description: '',
    location: '',
    organizer: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'UTC',
    isAllDay: false,
    isRecurring: false,
    recurrencePattern: 'weekly',
    recurrenceEndDate: '',
    recurrenceCount: 1
  },
  buttonData: {
    buttonStyle: 'standard',
    buttonSize: 'medium',
    colorScheme: '#4D90FF',
    textColor: '#FFFFFF',
    borderRadius: 'rounded',
    showIcons: true,
    responsive: true,
    selectedPlatforms: {
      google: true,
      apple: true,
      outlook: true,
      office365: true,
      yahoo: true
    }
  },
  generatedCode: '',
  isLoading: false,
  lastSaved: null
}

function eventReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_EVENT':
      return {
        ...state,
        eventData: { ...state.eventData, ...action.payload }
      }
    case 'UPDATE_BUTTON':
      return {
        ...state,
        buttonData: { ...state.buttonData, ...action.payload }
      }
    case 'SET_GENERATED_CODE':
      return {
        ...state,
        generatedCode: action.payload
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    case 'LOAD_EVENT':
      return {
        ...state,
        eventData: { ...state.eventData, ...action.payload.eventData },
        buttonData: { ...state.buttonData, ...action.payload.buttonData }
      }
    case 'RESET_FORM':
      return {
        ...initialState
      }
    default:
      return state
  }
}

export function EventContextProvider({ children }) {
  const [state, dispatch] = useReducer(eventReducer, initialState)
  const { user } = useAuth()

  // Auto-save to localStorage every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.eventData.title || state.eventData.description) {
        saveEventToStorage({ 
          eventData: state.eventData, 
          buttonData: state.buttonData 
        })
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [state.eventData, state.buttonData])

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadEventFromStorage()
    if (savedData) {
      dispatch({ type: 'LOAD_EVENT', payload: savedData })
    }
  }, [])

  // Generate code when event or button data changes
  useEffect(() => {
    if (state.eventData.title && state.eventData.startDate) {
      const code = generateCalendarCode(state.eventData, state.buttonData)
      dispatch({ type: 'SET_GENERATED_CODE', payload: code })
    }
  }, [state.eventData, state.buttonData])

  const updateEvent = (data) => {
    dispatch({ type: 'UPDATE_EVENT', payload: data })
  }

  const updateButton = (data) => {
    dispatch({ type: 'UPDATE_BUTTON', payload: data })
  }

  const loadEvent = (eventData) => {
    dispatch({ type: 'LOAD_EVENT', payload: { eventData } })
  }

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' })
  }

  const generateButton = async () => {
    if (!user) {
      // Handle anonymous user generation
      return state.generatedCode
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      // Save to database and generate button
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventData: state.eventData,
          buttonData: state.buttonData
        })
      })

      if (!response.ok) throw new Error('Failed to save event')

      const result = await response.json()
      return result.code
    } catch (error) {
      console.error('Error generating button:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const value = {
    ...state,
    updateEvent,
    updateButton,
    loadEvent,
    resetForm,
    generateButton
  }

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  )
}

export function useEventContext() {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEventContext must be used within EventContextProvider')
  }
  return context
}