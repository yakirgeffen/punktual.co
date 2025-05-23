// src/components/FormSections/EventDetails.jsx
import { useEventContext } from '@/contexts/EventContext'
import { useForm } from 'react-hook-form'

export default function EventDetails() {
  const { eventData, updateEvent } = useEventContext()
  
  const { register, handleSubmit } = useForm({
    defaultValues: eventData,
    mode: 'onChange'
  })

  const onSubmit = (data) => {
    updateEvent(data)
  }

  return (
    <form onChange={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows="4"
          className="input-field"
          placeholder="Enter event description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          {...register('location')}
          type="text"
          className="input-field"
          placeholder="Physical address or virtual meeting link"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organizer
        </label>
        <input
          {...register('organizer')}
          type="text"
          className="input-field"
          placeholder="Your name or organization"
        />
      </div>
    </form>
  )
}