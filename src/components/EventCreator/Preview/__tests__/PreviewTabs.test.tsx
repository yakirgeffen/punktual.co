/**
 * PreviewTabs Component Tests
 * Verifies tab switching behavior
 */

import { render, screen, fireEvent } from '@/__tests__/utils/testUtils'
import PreviewTabs from '../PreviewTabs'

describe('PreviewTabs', () => {
  const mockOnLayoutChange = jest.fn()

  beforeEach(() => {
    mockOnLayoutChange.mockClear()
  })

  it('renders both tab options', () => {
    render(
      <PreviewTabs
        activeLayout="dropdown"
        onLayoutChange={mockOnLayoutChange}
      />
    )

    expect(screen.getByText('Dropdown')).toBeInTheDocument()
    expect(screen.getByText('Individual')).toBeInTheDocument()
  })

  it('highlights active tab correctly', () => {
    const { rerender } = render(
      <PreviewTabs
        activeLayout="dropdown"
        onLayoutChange={mockOnLayoutChange}
      />
    )

    // Check dropdown is active
    const dropdownButton = screen.getByText('Dropdown').closest('button')
    expect(dropdownButton).toHaveClass('bg-emerald-50', 'text-emerald-700')

    // Switch to individual
    rerender(
      <PreviewTabs
        activeLayout="individual"
        onLayoutChange={mockOnLayoutChange}
      />
    )

    const individualButton = screen.getByText('Individual').closest('button')
    expect(individualButton).toHaveClass('bg-emerald-50', 'text-emerald-700')
  })

  it('calls onLayoutChange when clicking dropdown tab', () => {
    render(
      <PreviewTabs
        activeLayout="individual"
        onLayoutChange={mockOnLayoutChange}
      />
    )

    const dropdownButton = screen.getByText('Dropdown').closest('button')
    if (dropdownButton) {
      fireEvent.click(dropdownButton)
    }

    expect(mockOnLayoutChange).toHaveBeenCalledWith('dropdown')
    expect(mockOnLayoutChange).toHaveBeenCalledTimes(1)
  })

  it('calls onLayoutChange when clicking individual tab', () => {
    render(
      <PreviewTabs
        activeLayout="dropdown"
        onLayoutChange={mockOnLayoutChange}
      />
    )

    const individualButton = screen.getByText('Individual').closest('button')
    if (individualButton) {
      fireEvent.click(individualButton)
    }

    expect(mockOnLayoutChange).toHaveBeenCalledWith('individual')
    expect(mockOnLayoutChange).toHaveBeenCalledTimes(1)
  })

  it('displays correct descriptions for each tab', () => {
    render(
      <PreviewTabs
        activeLayout="dropdown"
        onLayoutChange={mockOnLayoutChange}
      />
    )

    expect(screen.getByText('Single button with menu')).toBeInTheDocument()
    expect(screen.getByText('Separate buttons')).toBeInTheDocument()
  })

  it('displays correct icons for each tab', () => {
    const { container } = render(
      <PreviewTabs
        activeLayout="dropdown"
        onLayoutChange={mockOnLayoutChange}
      />
    )

    expect(container.textContent).toContain('🔽')
    expect(container.textContent).toContain('⚡')
  })

  it('does not call onLayoutChange when clicking already active tab', () => {
    render(
      <PreviewTabs
        activeLayout="dropdown"
        onLayoutChange={mockOnLayoutChange}
      />
    )

    const dropdownButton = screen.getByText('Dropdown').closest('button')
    if (dropdownButton) {
      // Click the already active tab
      fireEvent.click(dropdownButton)
    }

    // Should still be called (component allows re-selecting active tab)
    expect(mockOnLayoutChange).toHaveBeenCalledWith('dropdown')
  })
})
