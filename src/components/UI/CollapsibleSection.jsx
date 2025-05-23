// src/components/UI/CollapsibleSection.jsx
import { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

export default function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false, 
  icon = null 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md p-2 -m-2"
      >
        <div className="flex items-center space-x-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="section-title mb-0">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  )
}