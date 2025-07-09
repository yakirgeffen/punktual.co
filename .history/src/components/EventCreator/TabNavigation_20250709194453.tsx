'use client';
import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
      <div className="flex">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-gray-900 bg-gray-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-25'
            } ${
              index === 0 ? 'rounded-l-lg' : ''
            } ${
              index === tabs.length - 1 ? 'rounded-r-lg' : 'border-r border-gray-300'
            }`}
          >
            {tab.label}
            
            {/* Active tab bottom border indicator */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;