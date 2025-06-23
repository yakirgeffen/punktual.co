'use client';
import { Checkbox } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

export default function AdditionalOptionsSection() {
  const { buttonData, updateButton } = useEventFormLogic();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 pb-1 mb-3">Additional Options</label>
      <div className="flex flex-wrap gap-6">
        <Checkbox
          isSelected={buttonData.showIcons !== false}
          onValueChange={(checked) => updateButton({ showIcons: checked })}
          size="md"
        >
          <span className="text-sm">Show calendar icons</span>
        </Checkbox>
        <Checkbox
          isSelected={buttonData.responsive !== false}
          onValueChange={(checked) => updateButton({ responsive: checked })}
          size="md"
        >
          <span className="text-sm">Responsive design</span>
        </Checkbox>
        <Checkbox
          isSelected={buttonData.openInNewTab !== false}
          onValueChange={(checked) => updateButton({ openInNewTab: checked })}
          size="md"
        >
          <span className="text-sm">Open in new tab</span>
        </Checkbox>
      </div>
    </div>
  );
}