/**
 * EventSummary Component Tests
 * Verifies event details display correctly
 */

import { render, screen } from '@/__tests__/utils/testUtils'
import EventSummary from '../EventSummary'
import type { EventData } from '@/types'

describe('EventSummary', () => {
  const baseEventData: EventData = {
    title: 'Product Launch Event',
    description: 'Join us for an exciting product launch!',
    location: 'San Francisco, CA',
    startDate: '2025-12-25',
    startTime: '14:30',
    endDate: '2025-12-25',
    endTime: '16:00',
    timezone: 'America/Los_Angeles',
    isAllDay: false,
  }

  it('renders event title correctly', () => {
    render(<EventSummary eventData={baseEventData} />)
    expect(screen.getByText('Product Launch Event')).toBeInTheDocument()
  })

  it('renders event description', () => {
    render(<EventSummary eventData={baseEventData} />)
    expect(screen.getByText(/Join us for an exciting product launch!/)).toBeInTheDocument()
  })

  it('renders event location', () => {
    render(<EventSummary eventData={baseEventData} />)
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
  })

  it('displays formatted date and time', () => {
    render(<EventSummary eventData={baseEventData} />)
    // Should format as "Wed, Dec 25, 2025, 2:30 PM - 4:00 PM"
    const dateTimeElement = screen.getByText(/Dec 25, 2025/)
    expect(dateTimeElement).toBeInTheDocument()
    expect(dateTimeElement.textContent).toMatch(/2:30 PM/)
  })

  it('displays all-day events correctly', () => {
    const allDayEvent = {
      ...baseEventData,
      isAllDay: true,
    }
    render(<EventSummary eventData={allDayEvent} />)
    expect(screen.getByText(/All day/)).toBeInTheDocument()
  })

  it('displays multi-day all-day events', () => {
    const multiDayEvent = {
      ...baseEventData,
      isAllDay: true,
      startDate: '2025-12-25',
      endDate: '2025-12-27',
    }
    render(<EventSummary eventData={multiDayEvent} />)
    const dateText = screen.getByText(/Dec 25, 2025 - Dec 27, 2025/)
    expect(dateText).toBeInTheDocument()
    expect(dateText.textContent).toMatch(/All day/)
  })

  it('handles events without description gracefully', () => {
    const eventWithoutDescription = {
      ...baseEventData,
      description: undefined,
    }
    render(<EventSummary eventData={eventWithoutDescription} />)
    expect(screen.queryByText(/Join us for an exciting product launch!/)).not.toBeInTheDocument()
    expect(screen.getByText('Product Launch Event')).toBeInTheDocument()
  })

  it('handles events without location gracefully', () => {
    const eventWithoutLocation = {
      ...baseEventData,
      location: undefined,
    }
    render(<EventSummary eventData={eventWithoutLocation} />)
    expect(screen.queryByText('San Francisco, CA')).not.toBeInTheDocument()
  })

  it('displays correct icons for date and location', () => {
    const { container } = render(<EventSummary eventData={baseEventData} />)
    // Check for emoji icons (they render as text content)
    expect(container.textContent).toContain('🕒')
    expect(container.textContent).toContain('📍')
  })
})
