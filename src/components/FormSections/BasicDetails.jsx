// src/components/FormSections/BasicDetails.jsx
import { useEventContext } from '@/contexts/EventContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DateTimePicker from '../UI/DateTimePicker'
import ValidationError from '../UI/ValidationError'

const basicDetailsSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().optional(),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().optional(),
  isAllDay: z.boolean().default(false)
})

export default function BasicDetails() {
  const { eventData, updateEvent } = useEventContext()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: eventData,
    mode: 'onChange'
  })

  const isAllDay = watch('isAllDay')

  const onSubmit = (data) => {
    updateEvent(data)
  }

  return (
    <form onChange={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Title *
        </label>
        <input
          {...register('title')}
          type="text"
          className="input-field"
          placeholder="Enter event title"
        />
        <ValidationError error={errors.title} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            {...register('startDate')}
            type="date"
            className="input-field"
          />
          <ValidationError error={errors.startDate} />
        </div>

        {!isAllDay && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              {...register('startTime')}
              type="time"
              className="input-field"
            />
            <ValidationError error={errors.startTime} />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date *
          </label>
          <input
            {...register('endDate')}
            type="date"
            className="input-field"
          />
          <ValidationError error={errors.endDate} />
        </div>

        {!isAllDay && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              {...register('endTime')}
              type="time"
              className="input-field"
            />
            <ValidationError error={errors.endTime} />
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          {...register('isAllDay')}
          type="checkbox"
          id="isAllDay"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isAllDay" className="ml-2 block text-sm text-gray-700">
          All-day event
        </label>
      </div>
    </form>
  )
}