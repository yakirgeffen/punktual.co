'use client';
import Image from 'next/image';
import { Chip } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

// Define allowed platform IDs
type PlatformId = 'google' | 'apple' | 'outlook' | 'office365' | 'yahoo';

// Type for platform data
type PlatformData = {
  name: string;
  fullName: string;
  iconPath: string;
};

// Platform data object
const platformData: Record<PlatformId, PlatformData> = {
  google: {
    name: 'Google',
    fullName: 'Google Calendar',
    iconPath: '/icons/platforms/icon-google.svg',
  },
  apple: {
    name: 'Apple',
    fullName: 'Apple Calendar',
    iconPath: '/icons/platforms/icon-apple.svg',
  },
  outlook: {
    name: 'Outlook',
    fullName: 'Microsoft Outlook',
    iconPath: '/icons/platforms/icon-outlook.svg',
  },
  office365: {
    name: 'Office 365',
    fullName: 'Office 365',
    iconPath: '/icons/platforms/icon-office365.svg',
  },
  yahoo: {
    name: 'Yahoo',
    fullName: 'Yahoo Calendar',
    iconPath: '/icons/platforms/icon-yahoo.svg',
  },
};

export default function PlatformSelectionSection() {
  const { platforms, buttonData, updateButton } = useEventFormLogic();

  // Type for selected platforms
  const selectedPlatforms: Partial<Record<PlatformId, boolean>> = buttonData.selectedPlatforms || {};
  const selectedCount = Object.values(selectedPlatforms).filter(Boolean).length;

  // Explicitly type platformId
  const handlePlatformToggle = (platformId: PlatformId) => {
    const updated = {
      ...selectedPlatforms,
      [platformId]: !selectedPlatforms[platformId],
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
      <div className="flex flex-wrap gap-3">
        {platforms.map((platform: { id: string }) => {
          // Type guard: only render if id is a valid PlatformId
          if (!['google', 'apple', 'outlook', 'office365', 'yahoo'].includes(platform.id)) {
            return null;
          }
          const id = platform.id as PlatformId;
          const isSelected = selectedPlatforms[id];
          const data = platformData[id];

          return (
            <button
              key={id}
              onClick={() => handlePlatformToggle(id)}
              className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all duration-200 ${
                isSelected
                  ? 'border-emerald-500 bg-white text-gray-900'
                  : 'border-gray-200 bg-gray-150 text-gray-500 hover:border-emerald-500 hover:bg-white'
              }`}
            >
              <Image
                src={data.iconPath}
                alt={data.fullName}
                width={20}
                height={20}
                className="w-5 h-5"
                priority
              />
              <span>{data.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}