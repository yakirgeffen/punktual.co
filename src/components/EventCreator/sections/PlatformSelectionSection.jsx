'use client';
import { Select, SelectItem, Chip } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

/**
 * Platform Selection Section - Calendar platform selection
 * Simplified version focused on core platform selection
 */
export default function PlatformSelectionSection() {
  const { 
    platforms, 
    buttonData, 
    getSelectedPlatformKeys, 
    handlePlatformSelectionChange 
  } = useEventFormLogic();

  const hasPlatforms = Object.values(buttonData.selectedPlatforms || {}).some(Boolean);

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">Select which calendar platforms to support</span>
        {hasPlatforms && (
          <Chip size="sm" color="success" variant="flat">
            {Object.values(buttonData.selectedPlatforms || {}).filter(Boolean).length} selected
          </Chip>
        )}
      </div>
      <Select
        placeholder="Select which calendar platforms to support"
        selectionMode="multiple"
        selectedKeys={getSelectedPlatformKeys()}
        onSelectionChange={handlePlatformSelectionChange}
        radius="md"
        isRequired
        classNames={{
          trigger: "h-12"
        }}
      >
        {platforms.map((platform) => (
          <SelectItem key={platform.id} value={platform.id}>
            {platform.name}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
