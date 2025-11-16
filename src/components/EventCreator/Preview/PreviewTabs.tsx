/**
 * PreviewTabs.tsx
 * Tab switcher for preview layouts (Dropdown vs Individual)
 * Syncs with buttonLayout selection
 */

'use client';

import React from 'react';

interface PreviewTabsProps {
  activeLayout: 'dropdown' | 'individual';
  onLayoutChange: (layout: 'dropdown' | 'individual') => void;
}

const PreviewTabs: React.FC<PreviewTabsProps> = ({
  activeLayout,
  onLayoutChange
}) => {
  const tabs = [
    {
      id: 'dropdown' as const,
      label: 'Dropdown',
      icon: '🔽',
      description: 'Single button with menu'
    },
    {
      id: 'individual' as const,
      label: 'Individual',
      icon: '⚡',
      description: 'Separate buttons'
    }
  ];

  return (
    <div className="border-b border-gray-200 bg-white rounded-t-lg">
      <div className="flex gap-1 p-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onLayoutChange(tab.id)}
            className={`
              flex-1 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm
              ${activeLayout === tab.id
                ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-base">{tab.icon}</span>
              <div className="flex flex-col items-start">
                <span className="font-semibold">{tab.label}</span>
                <span className="text-xs opacity-75">{tab.description}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PreviewTabs;
