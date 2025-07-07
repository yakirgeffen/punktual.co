// src/components/Preview/ButtonPreview.jsx
import { useEventContext } from '@/contexts/EventContext'
import { CalendarIcon } from 'lucide-react'

export default function ButtonPreview({ eventData, buttonData }) {
  const { generateButton } = useEventContext()

  const getButtonClasses = () => {
    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-5 py-2.5 text-lg'
    }

    const styleClasses = {
      standard: 'shadow-sm',
      outlined: 'border-2 bg-transparent',
      minimal: 'bg-gray-100 hover:bg-gray-200',
      pill: 'rounded-full'
    }

    return `inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 ${sizeClasses[buttonData.buttonSize]} ${styleClasses[buttonData.buttonStyle]}`
  }

  const getButtonStyles = () => {
    const styles = {}
    
    if (buttonData.buttonStyle !== 'minimal' && buttonData.buttonStyle !== 'outlined') {
      styles.backgroundColor = buttonData.colorTheme
      styles.color = buttonData.textColor || '#FFFFFF'
    }
    
    if (buttonData.buttonStyle === 'outlined') {
      styles.borderColor = buttonData.colorTheme
      styles.color = buttonData.colorTheme
    }

    return styles
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="section-title">Button Preview</h3>
        <div className="border rounded-lg p-8 bg-gray-50 flex justify-center">
          <button
            className={getButtonClasses()}
            style={getButtonStyles()}
            onClick={() => generateButton()}
          >
            {buttonData.showIcons && (
              <CalendarIcon className="w-5 h-5 mr-2" />
            )}
            Add to Calendar
          </button>
        </div>
      </div>

      {eventData.title && (
        <div>
          <h3 className="section-title">Event Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900">{eventData.title}</h4>
            {eventData.startDate && (
              <p className="text-sm text-gray-600">
                {new Date(eventData.startDate).toLocaleDateString()} 
                {eventData.startTime && !eventData.isAllDay && ` at ${eventData.startTime}`}
              </p>
            )}
            {eventData.location && (
              <p className="text-sm text-gray-600">{eventData.location}</p>
            )}
            {eventData.description && (
              <p className="text-sm text-gray-700 mt-2">{eventData.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}