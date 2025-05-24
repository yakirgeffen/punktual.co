// src/components/UI/PlatformSelector.jsx
'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/contexts/EventContext';

const PlatformSelector = () => {
  const { buttonData, updateButton } = useEventContext();

  const platforms = [
    // ... same platforms array as above ...
    {
      id: 'google',
      name: 'Google Calendar',
      shortName: 'Google',
      icon: (
        <img 
          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlecalendar.svg" 
          alt="Google Calendar"
          className="w-full h-full"
          style={{ filter: 'brightness(0) invert(1)' }} 
        />
      ),
      iconColor: '#4285F4',
      originalColor: '#4285F4',
      customColor: '#4D90FF',
      description: 'Most popular calendar platform'
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      shortName: 'Apple',
      icon: (
        <img 
          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apple.svg" 
          alt="Apple Calendar"
          className="w-full h-full"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      ),
      iconColor: '#000000',
      originalColor: '#A2AAAD',
      customColor: '#6B7280',
      description: 'iOS and macOS users'
    },
    {
      id: 'outlook',
      name: 'Outlook',
      shortName: 'Outlook',
      icon: (
        <img 
          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftoutlook.svg" 
          alt="Microsoft Outlook"
          className="w-full h-full"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      ),
      iconColor: '#0078D4',
      originalColor: '#0078D4',
      customColor: '#3B82F6',
      description: 'Microsoft Outlook desktop'
    },
    {
      id: 'office365',
      name: 'Office 365',
      shortName: 'Office365',
      icon: (
        <img 
          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoft.svg" 
          alt="Microsoft Office 365"
          className="w-full h-full"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      ),
      iconColor: '#D83B01',
      originalColor: '#D83B01',
      customColor: '#EF4444',
      description: 'Microsoft online calendar'
    },
    {
      id: 'yahoo',
      name: 'Yahoo Calendar',
      shortName: 'Yahoo',
      icon: (
        <img 
          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/yahoo.svg" 
          alt="Yahoo Calendar"
          className="w-full h-full"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      ),
      iconColor: '#6001D2',
      originalColor: '#6001D2',
      customColor: '#8B5CF6',
      description: 'Yahoo Mail users'
    }
  ];

  const [displayOptions, setDisplayOptions] = useState({
    showLogos: true,
    showNames: false,
    shape: 'rounded', // 'pill', 'rounded', 'squared'
    size: 44, // 36-56px
    style: 'original', // 'original', 'custom', 'textual'
  });

  const togglePlatform = (platformId) => {
    const updatedPlatforms = {
      ...buttonData.selectedPlatforms,
      [platformId]: !buttonData.selectedPlatforms[platformId]
    };
    updateButton({ selectedPlatforms: updatedPlatforms });
  };

  const updateDisplayOptions = (updates) => {
    setDisplayOptions(prev => ({ ...prev, ...updates }));
  };

  const getPlatformColor = (platform) => {
    return displayOptions.style === 'original'
      ? platform.originalColor
      : platform.customColor;
  };

  const getShapeClass = () => {
    switch (displayOptions.shape) {
      case 'pill': return 'rounded-full';
      case 'squared': return 'rounded-none';
      default: return 'rounded-lg';
    }
  };

  const selectedCount = Object.values(buttonData.selectedPlatforms).filter(Boolean).length;

  const renderPreviewButton = (platform) => {
    const isSelected = buttonData.selectedPlatforms[platform.id];
    if (!isSelected) return null;

    if (displayOptions.style === 'textual') {
      return (
        <a
          key={platform.id}
          href="#"
          className="text-blue-600 hover:text-blue-700 underline text-sm font-medium mr-2"
          style={{ fontSize: `${Math.max(displayOptions.size - 20, 12)}px` }}
        >
          Add to {platform.shortName}
        </a>
      );
    }

    const buttonStyle = {
      width: `${displayOptions.size}px`,
      height: `${displayOptions.size}px`,
      backgroundColor: displayOptions.style === 'original'
        ? platform.originalColor
        : getPlatformColor(platform),
      fontSize: `${Math.max(displayOptions.size / 3, 10)}px`
    };

    return (
      <button
        key={platform.id}
        className={`${getShapeClass()} text-white font-bold flex items-center justify-center hover:opacity-90 transition-opacity p-2 mr-2`}
        style={buttonStyle}
        title={`Add to ${platform.name}`}
      >
        {displayOptions.showLogos && (
          <div className="w-full h-full flex items-center justify-center text-white">
            {platform.icon}
          </div>
        )}
        {displayOptions.showNames && (
          <span className="ml-2 text-xs font-medium">{platform.shortName}</span>
        )}
      </button>
    );
  };

  const selectAll = () => {
    const allSelected = {};
    platforms.forEach(platform => {
      allSelected[platform.id] = true;
    });
    updateButton({ selectedPlatforms: allSelected });
  };

  const clearAll = () => {
    const noneSelected = {};
    platforms.forEach(platform => {
      noneSelected[platform.id] = false;
    });
    updateButton({ selectedPlatforms: noneSelected });
  };

  return (
    <div className="space-y-6 border-t pt-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Calendar Platforms</h3>
        <p className="text-sm text-gray-500 mt-1">
          Select platforms and customize how they appear ({selectedCount} selected)
        </p>
      </div>

      {/* Platform Selection */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-gray-700">Select Platforms</h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {platforms.map((platform) => {
            const isSelected = buttonData.selectedPlatforms[platform.id];
            return (
              <div
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`
                  relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center p-1.5 mr-3"
                    style={{ backgroundColor: platform.originalColor }}
                  >
                    <div className="w-full h-full">
                      {platform.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {platform.shortName}
                    </div>
                  </div>
                  <div className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                  `}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customization Options */}
      {selectedCount > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Customize Appearance</h4>
          
          {/* Display Options */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Display</label>
            <div className="flex space-x-2">
              <button
                onClick={() => updateDisplayOptions({ showLogos: true, showNames: false })}
                className={`px-3 py-1.5 text-xs rounded-md border ${
                  displayOptions.showLogos && !displayOptions.showNames
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Logos Only
              </button>
              <button
                onClick={() => updateDisplayOptions({ showLogos: false, showNames: true })}
                className={`px-3 py-1.5 text-xs rounded-md border ${
                  !displayOptions.showLogos && displayOptions.showNames
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Names Only
              </button>
              <button
                onClick={() => updateDisplayOptions({ showLogos: true, showNames: true })}
                className={`px-3 py-1.5 text-xs rounded-md border ${
                  displayOptions.showLogos && displayOptions.showNames
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Logos + Names
              </button>
            </div>
          </div>

          {/* Shape Options */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Shape</label>
            <div className="flex space-x-2">
              {['pill', 'rounded', 'squared'].map(shape => (
                <button
                  key={shape}
                  onClick={() => updateDisplayOptions({ shape })}
                  className={`px-3 py-1.5 text-xs rounded-md border capitalize ${
                    displayOptions.shape === shape
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Size Options */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Size: {displayOptions.size}px
            </label>
            <div className="flex space-x-1 overflow-x-auto pb-2">
              {[36, 40, 44, 48, 52, 56].map(size => (
                <button
                  key={size}
                  onClick={() => updateDisplayOptions({ size })}
                  className={`px-3 py-1.5 text-xs rounded-md border ${
                    displayOptions.size === size
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>

          {/* Style Options */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Style</label>
            <div className="flex space-x-2">
              {['original', 'custom', 'textual'].map(style => (
                <button
                  key={style}
                  onClick={() => updateDisplayOptions({ style })}
                  className={`px-3 py-1.5 text-xs rounded-md border capitalize ${
                    displayOptions.style === style
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {selectedCount > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mt-6 mb-2">Preview</h4>
          <div className="flex flex-wrap items-center gap-3 border rounded-lg bg-gray-50 p-4">
            {platforms.map(renderPreviewButton)}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;
