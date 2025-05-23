// src/components/UI/PlatformSelector.jsx
import { useEventContext } from '@/contexts/EventContext'

const platforms = [
  { id: 'google', name: 'Google Calendar', icon: 'G', color: '#4285F4' },
  { id: 'apple', name: 'Apple Calendar', icon: 'A', color: '#A2AAAD' },
  { id: 'outlook', name: 'Outlook', icon: 'O', color: '#0078D4' },
  { id: 'office365', name: 'Office 365', icon: '365', color: '#D83B01' },
  { id: 'yahoo', name: 'Yahoo Calendar', icon: 'Y', color: '#6001D2' }
]

export default function PlatformSelector() {
  const { buttonData, updateButton } = useEventContext()

  const togglePlatform = (platformId) => {
    const currentPlatforms = buttonData.selectedPlatforms || {}
    const updatedPlatforms = {
      ...currentPlatforms,
      [platformId]: !currentPlatforms[platformId]
    }
    
    updateButton({
      selectedPlatforms: updatedPlatforms
    })
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {platforms.map((platform) => {
        const isSelected = buttonData.selectedPlatforms?.[platform.id] || false
        
        return (
          <div
            key={platform.id}
            onClick={() => togglePlatform(platform.id)}
            className={`border-2 rounded-lg p-3 text-center cursor-pointer transition-colors ${
              isSelected
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-semibold ${
                isSelected ? 'opacity-100' : 'opacity-60'
              }`}
              style={{ backgroundColor: isSelected ? platform.color : '#E5E7EB' }}
            >
              <span className={`text-sm ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                {platform.icon}
              </span>
            </div>
            <span className={`text-xs font-medium ${
              isSelected ? 'text-primary-700' : 'text-gray-600'
            }`}>
              {platform.name.split(' ')[0]}
            </span>
          </div>
        )
      })}
    </div>
  )
}