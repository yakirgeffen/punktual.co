// src/components/UI/ValidationError.jsx
import { AlertCircleIcon } from 'lucide-react'

export default function ValidationError({ error }) {
  if (!error) return null

  return (
    <div className="flex items-center space-x-1 mt-1">
      <AlertCircleIcon className="w-4 h-4 text-red-500" />
      <span className="text-sm text-red-600">{error.message}</span>
    </div>
  )
}