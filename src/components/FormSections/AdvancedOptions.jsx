// src/components/FormSections/AdvancedOptions.jsx
import { useEventContext } from '@/contexts/EventContext'
import { useForm } from 'react-hook-form'

export default function AdvancedOptions() {
  const { eventData, updateEvent } = useEventContext()
  
  const { register, handleSubmit, watch } = useForm({
    defaultValues: eventData,
    mode: 'onChange'
  })

  const isRecurring = watch('isRecurring')

  const onSubmit = (data) => {
    updateEvent(data)
  }

  return (
    <form onChange={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timezone
        </label>
        <select {...register('timezone')} className="input-field">
          <option value="UTC">UTC (Coordinated Universal Time)</option>
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="Europe/London">Greenwich Mean Time (GMT)</option>
          <option value="Europe/Paris">Central European Time (CET)</option>
          <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          {...register('isRecurring')}
          type="checkbox"
          id="isRecurring"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
          Recurring event
        </label>
      </div>

      {isRecurring && (
        <div className="ml-6 space-y-4 border-l-2 border-primary-200 pl-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repeat
            </label>
            <select {...register('recurrencePattern')} className="input-field">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End after
              </label>
              <input
                {...register('recurrenceCount')}
                type="number"
                min="1"
                max="99"
                className="input-field"
                placeholder="Number of occurrences"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Or end on date
              </label>
              <input
                {...register('recurrenceEndDate')}
                type="date"
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  )
}