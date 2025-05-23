// src/components/EventCreator/EventCreator.jsx
'use client';

import { useState, useEffect } from 'react'
import { useEventContext } from '@/contexts/EventContext'
import EventForm from './EventForm'
import LivePreview from './LivePreview'

export default function EventCreator() {
  const [isMobile, setIsMobile] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { eventData, isLoading } = useEventContext()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Calendar Button</h1>
        <p className="mt-2 text-gray-600">
          Generate "Add to Calendar" buttons for your events in seconds
        </p>
      </div>

      {isMobile ? (
        <div className="space-y-4">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setShowPreview(false)}
              className={`flex-1 px-4 py-2 rounded-md ${
                !showPreview ? 'bg-white shadow-sm' : ''
              }`}
            >
              Form
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className={`flex-1 px-4 py-2 rounded-md ${
                showPreview ? 'bg-white shadow-sm' : ''
              }`}
            >
              Preview
            </button>
          </div>
          {showPreview ? <LivePreview /> : <EventForm />}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EventForm />
          <LivePreview />
        </div>
      )}
    </div>
  )
}