'use client';
// src/components/EventCreator/MobileToggle.jsx
import { FileTextIcon, EyeIcon } from 'lucide-react'

export default function MobileToggle({ showPreview, onToggle }) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => !showPreview && onToggle()}
        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
          !showPreview
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <FileTextIcon className="w-4 h-4 inline-block mr-2" />
        Form
      </button>
      <button
        onClick={() => showPreview && onToggle()}
        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
          showPreview
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <EyeIcon className="w-4 h-4 inline-block mr-2" />
        Preview
      </button>
    </div>
  )
}