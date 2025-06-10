'use client';
import { Chip } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

/**
 * Platform Selection Section - Subtle Chip Toggle Version
 * Clean chip-based platform selection with subtle selection feedback
 */
export default function PlatformSelectionSection() {
  const { 
    platforms, 
    buttonData, 
    updateButton 
  } = useEventFormLogic();

  const selectedPlatforms = buttonData.selectedPlatforms || {};
  const selectedCount = Object.values(selectedPlatforms).filter(Boolean).length;

  // Platform display data with actual icons
  const platformData = {
    google: { 
      name: 'Google', 
      fullName: 'Google Calendar',
      iconPath: '/icons/platforms/icon-google.svg'
    },
    apple: { 
      name: 'Apple', 
      fullName: 'Apple Calendar',
      iconPath: '/icons/platforms/icon-apple.svg'
    },
    outlook: { 
      name: 'Outlook', 
      fullName: 'Microsoft Outlook',
      iconPath: '/icons/platforms/icon-outlook.svg'
    },
    office365: { 
      name: 'Office 365', 
      fullName: 'Office 365',
      iconPath: '/icons/platforms/icon-office365.svg'
    },
    yahoo: { 
      name: 'Yahoo', 
      fullName: 'Yahoo Calendar',
      iconPath: '/icons/platforms/icon-yahoo.svg'
    }
  };

  const handlePlatformToggle = (platformId) => {
    const updated = {
      ...selectedPlatforms,
      [platformId]: !selectedPlatforms[platformId]
    };
    updateButton({ selectedPlatforms: updated });
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">Select which calendar platforms to support</span>
        {selectedCount > 0 && (
          <Chip size="sm" color="default" variant="flat" className="text-gray-600">
            {selectedCount} selected
          </Chip>
        )}
      </div>

      {/* Chip toggles */}
      <div className="flex flex-wrap gap-3">
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms[platform.id];
          const data = platformData[platform.id];
          
          if (!data) return null; // Safety check
          
          return (
            <button
              key={platform.id}
              onClick={() => handlePlatformToggle(platform.id)}
              className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-white text-gray-900' 
                  : 'border-gray-200 bg-gray-150 text-gray-500 hover:border-blue-500 hover:bg-white'
              }`}
            >
              {/* Platform icon */}
              <img 
                src={data.iconPath}
                alt={data.fullName}
                className="w-5 h-5"
              />

              {/* Platform name */}
              <span>{data.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}