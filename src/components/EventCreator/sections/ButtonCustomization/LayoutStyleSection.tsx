'use client';

import { Chip } from '@heroui/react';
import { useEventContext } from '@/contexts/EventContext';

export default function LayoutStyleSection() {
  const { buttonData, updateButton } = useEventContext();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 pb-1 mb-3">Layout Style</label>
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 cursor-pointer p-3 border-2 rounded-lg transition-all hover:border-emerald-300 bg-white">
          <input
            type="radio"
            name="buttonLayout"
            value="dropdown"
            checked={buttonData.buttonLayout !== 'individual'}
            onChange={() => updateButton({ buttonLayout: 'dropdown' })}
            className="w-4 h-4 text-emerald-600"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">Dropdown Button</span>
            <p className="text-xs text-gray-600 mt-0.5">Single button with dropdown menu</p>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-3 border-2 rounded-lg transition-all hover:border-emerald-300 bg-white">
          <input
            type="radio"
            name="buttonLayout"
            value="individual"
            checked={buttonData.buttonLayout === 'individual'}
            onChange={() => updateButton({ buttonLayout: 'individual' })}
            className="w-4 h-4 text-emerald-600"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Individual Buttons</span>
              <Chip size="sm" color="success" variant="flat">Email-ready</Chip>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">Separate button for each platform</p>
          </div>
        </label>
      </div>
    </div>
  );
}
