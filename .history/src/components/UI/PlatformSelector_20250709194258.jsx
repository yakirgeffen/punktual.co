// src/components/UI/PlatformSelector.jsx
'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/contexts/EventContext';

const PlatformSelector = () => {
  const { buttonData, updateButton } = useEventContext();
  
  // Platform information with local brand logos
  const platforms = [
    { 
      id: 'google', 
      name: 'Google Calendar', 
      shortName: 'Google',
      color: '#4285F4',
      logo: '/icons/platforms/icon-google.svg'
    },
    { 
      id: 'apple', 
      name: 'Apple Calendar', 
      shortName: 'Apple',
      color: '#000000',
      logo: '/icons/platforms/icon-apple.svg'
    },
    { 
      id: 'outlook', 
      name: 'Microsoft Outlook', 
      shortName: 'Outlook',
      color: '#0078D4',
      logo: '/icons/platforms/icon-outlook.svg'
    },
    { 
      id: 'office365', 
      name: 'Office 365', 
      shortName: 'Office 365',
      color: '#D83B01',
      logo: '/icons/platforms/icon-office365.svg'
    },
    { 
      id: 'outlookcom', 
      name: 'Outlook.com', 
      shortName: 'Outlook.com',
      color: '#0078D4',
      logo: '/icons/platforms/icon-outlookcom.svg'
    },
    { 
      id: 'yahoo', 
      name: 'Yahoo Calendar', 
      shortName: 'Yahoo',
      color: '#6001D2',
      logo: '/icons/platforms/icon-yahoo.svg'
    }
  ];

  // Customization state
  const [showCustomization, setShowCustomization] = useState(false);
  const [customization, setCustomization] = useState({
    display: 'logos',
    shape: 'rounded',
    size: '44px',
    style: 'original'
  });

  // Ensure selectedPlatforms always has boolean values
  const selectedPlatforms = buttonData?.selectedPlatforms || {};
  const getSelectedCount = () => {
    return platforms.filter(p => selectedPlatforms[p.id] === true).length;
  };

  // Handle platform toggle
  const togglePlatform = (platformId) => {
    const currentValue = selectedPlatforms[platformId] || false;
    const updatedPlatforms = {
      ...selectedPlatforms,
      [platformId]: !currentValue
    };
    updateButton({ selectedPlatforms: updatedPlatforms });
  };

  // Quick select actions
  const selectAll = () => {
    const allSelected = {};
    platforms.forEach(p => allSelected[p.id] = true);
    updateButton({ selectedPlatforms: allSelected });
  };

  const clearAll = () => {
    const noneSelected = {};
    platforms.forEach(p => noneSelected[p.id] = false);
    updateButton({ selectedPlatforms: noneSelected });
  };

  // Get selected platforms
  const getSelectedPlatforms = () => {
    return platforms.filter(p => selectedPlatforms[p.id] === true);
  };

  // Update customization
  const updateCustomization = (key, value) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  // Render preview based on current settings
  const renderPreview = () => {
    const selected = getSelectedPlatforms();
    if (selected.length === 0) return <div className="text-gray-400 text-sm">Select platforms to see preview</div>;

    if (customization.style === 'textual') {
      return (
        <div className="space-y-2">
          {selected.map(platform => (
            <a key={platform.id} href="#" className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm">
              <img src={platform.logo} alt={platform.name} className="w-4 h-4 mr-2" />
              Add to {platform.shortName}
            </a>
          ))}
        </div>
      );
    }

    // Button style preview
    const sizeValue = parseInt(customization.size);
    const shapeClass = {
      'pill': 'rounded-full',
      'rounded': 'rounded-lg', 
      'squared': 'rounded-none'
    }[customization.shape];

    return (
      <div className="flex gap-3 flex-wrap">
        {selected.map(platform => (
          <div
            key={platform.id}
            className={`${shapeClass} flex items-center justify-center bg-white border-2 hover:shadow-md transition-all cursor-pointer`}
            style={{
              width: `${sizeValue}px`,
              height: `${sizeValue}px`,
              borderColor: platform.color
            }}
          >
            {customization.display === 'logos' ? (
              <img 
                src={platform.logo} 
                alt={platform.name}
                className="p-2"
                style={{ 
                  width: `${sizeValue * 0.6}px`, 
                  height: `${sizeValue * 0.6}px`,
                  filter: 'none'
                }}
              />
            ) : (
              <span 
                className="font-medium text-center px-1"
                style={{ 
                  fontSize: `${Math.max(sizeValue / 6, 8)}px`,
                  color: platform.color
                }}
              >
                {platform.shortName}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Calendar Platforms</h3>
          <p className="text-sm text-gray-500 mt-1">
            Select platforms ({getSelectedCount()} selected)
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <button onClick={selectAll} className="text-emerald-600 hover:text-emerald-700 font-medium">
            Select All
          </button>
          <span className="text-gray-300">•</span>
          <button onClick={clearAll} className="text-gray-600 hover:text-gray-700 font-medium">
            Clear All
          </button>
        </div>
      </div>

      {/* Platform Selection - Minimal Icons (our final design) */}
      <div className="flex gap-2 flex-wrap">
        {platforms.map(platform => {
          const isSelected = selectedPlatforms[platform.id] === true;
          
          return (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`
                relative w-10 h-10 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center
                ${isSelected 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <img 
                src={platform.logo} 
                alt={platform.name}
                className="w-5 h-5"
              />
              
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs leading-none">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Customization Toggle */}
      {getSelectedCount() > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setShowCustomization(!showCustomization)}
            className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">Customize Appearance</span>
            <span className={`text-gray-500 transition-transform text-lg ${showCustomization ? 'rotate-180' : ''}`}>
              ↓
            </span>
          </button>

          {/* Customization Options - Collapsible */}
          {showCustomization && (
            <div className="bg-gray-50/50 rounded-xl p-6 space-y-6">
              {/* Options Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display</label>
                  <select
                    value={customization.display}
                    onChange={(e) => updateCustomization('display', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    <option value="logos">Logos</option>
                    <option value="names">Names</option>
                  </select>
                </div>

                {/* Shape */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shape</label>
                  <select
                    value={customization.shape}
                    onChange={(e) => updateCustomization('shape', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    <option value="rounded">Rounded</option>
                    <option value="pill">Pill</option>
                    <option value="squared">Square</option>
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <select
                    value={customization.size}
                    onChange={(e) => updateCustomization('size', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    <option value="36px">Small (36px)</option>
                    <option value="40px">Medium (40px)</option>
                    <option value="44px">Large (44px)</option>
                    <option value="48px">X-Large (48px)</option>
                    <option value="52px">2X-Large (52px)</option>
                    <option value="56px">3X-Large (56px)</option>
                  </select>
                </div>

                {/* Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                  <select
                    value={customization.style}
                    onChange={(e) => updateCustomization('style', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    <option value="original">Buttons</option>
                    <option value="textual">Text Links</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Preview</label>
                <div className="bg-white p-6 rounded-lg border border-gray-200 min-h-[80px] flex items-center">
                  {renderPreview()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {getSelectedCount() === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📅</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Select Calendar Platforms</h4>
          <p className="text-sm text-gray-500">
            Choose which calendar platforms your button should support.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;