/**
 * Testing utilities for Punktual
 * Provides mock data, helpers, and render functions
 */

import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import type { EventData, ButtonData, CalendarLinks } from '@/types'

// Mock Event Data
export const mockEventData: EventData = {
  title: 'Test Event',
  description: 'This is a test event description',
  location: 'Test Location',
  organizer: 'Test Organizer',
  startDate: '2025-12-25',
  startTime: '10:00',
  endDate: '2025-12-25',
  endTime: '11:00',
  timezone: 'UTC',
  isAllDay: false,
  isRecurring: false,
  recurrencePattern: 'weekly',
  recurrenceEndDate: '',
  recurrenceCount: 1,
}

// Mock Button Data
export const mockButtonData: ButtonData = {
  buttonStyle: 'standard',
  buttonSize: 'medium',
  buttonLayout: 'dropdown',
  buttonShape: 'rounded',
  colorTheme: '#10b981',
  textColor: '#FFFFFF',
  customBrandColor: '#4D90FF',
  ctaText: 'Add to Calendar',
  customText: 'Add to Calendar',
  displayOption: 'both',
  showIcons: true,
  responsive: true,
  openInNewTab: true,
  selectedPlatforms: {
    google: true,
    apple: true,
    outlook: true,
    office365: false,
    outlookcom: false,
    yahoo: false,
  },
}

// Mock Calendar Links
export const mockCalendarLinks: CalendarLinks = {
  google: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Test+Event',
  apple: 'data:text/calendar;charset=utf8,BEGIN:VCALENDAR...',
  outlook: 'https://outlook.live.com/calendar/0/deeplink/compose?subject=Test+Event',
  office365: 'https://outlook.office.com/calendar/0/deeplink/compose?subject=Test+Event',
  outlookcom: 'https://outlook.live.com/calendar/0/deeplink/compose?subject=Test+Event',
  yahoo: 'https://calendar.yahoo.com/?v=60&title=Test+Event',
}

// Mock Supabase Client
export const createMockSupabaseClient = () => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
})

// Custom render function that wraps components with providers if needed
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here if needed
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, options)
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }
