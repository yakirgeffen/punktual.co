//src/components/EventCreator/AdvancedCustomization.jsx

'use client';
import { useState } from 'react';
import { useEventContext } from '@/contexts/EventContext';

const BUTTON_STYLES = [
  { key: 'standard', label: 'Standard', description: 'Classic button with shadow' },
  { key: 'minimal', label: 'Minimal', description: 'Clean, borderless design' },
  { key: 'outlined', label: 'Outlined', description: 'Border with transparent background' },
  { key: 'gradient', label: 'Gradient', description: 'Modern gradient background' },
  { key: 'rounded', label: 'Rounded', description: 'Fully rounded pill shape' },
  { key: 'sharp', label: 'Sharp', description: 'No border radius, crisp edges' }
];

const COLOR_PRESETS = [
  { name: 'Blue', value: '#4D90FF' },
  { name: 'Green', value: '#059669' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Gray', value: '#6b7280' }
];

const SIZE_OPTIONS = [
  { key: 'sm', label: 'Small', description: 'Compact size for sidebars' },
  { key: 'md', label: 'Medium', description: 'Standard size for most uses' },
  { key: 'lg', label: 'Large', description: 'Prominent size for hero sections' },
  { key: 'xl', label: 'Extra Large', description: 'Maximum impact size' }
];

const AdvancedCustomization = () => {
  const { buttonData, updateButton } = useEventContext();
  const [customColor, setCustomColor] = useState(buttonData.colorTheme || '#4D90FF');
  const [customTextColor, setCustomTextColor] = useState(buttonData.textColor || '#FFFFFF');

  const handleStyleChange = (style) => {
    updateButton({ buttonStyle: style });
  };

  const handleColorChange = (color) => {
    setCustomColor(color);
    updateButton({ colorTheme: color });
  };

  const handleTextColorChange = (color) => {
    setCustomTextColor(color);
    updateButton({ textColor: color });
  };

  const handleSizeChange = (size) => {
    updateButton({ buttonSize: size });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Advanced Button Customization</h3>
        <p className="text-sm text-gray-600">Fine-tune your calendar button appearance</p>
      </div>

      {/* Button Style Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Button Style</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BUTTON_STYLES.map((style) => (
            <button
              key={style.key}
              onClick={() => handleStyleChange(style.key)}
              className={`p-3 text-left border rounded-lg transition-all hover:shadow-sm ${
                buttonData.buttonStyle === style.key
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-emerald-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{style.label}</div>
              <div className="text-xs text-gray-500 mt-1">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Customization */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Color Scheme</label>
        
        {/* Preset Colors */}
        <div>
          <div className="text-xs text-gray-600 mb-2">Quick Colors</div>
          <div className="flex gap-2 flex-wrap">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleColorChange(preset.value)}
                className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                  customColor === preset.value ? 'border-gray-800 shadow-lg' : 'border-gray-200'
                }`}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#4D90FF"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customTextColor}
                onChange={(e) => handleTextColorChange(e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customTextColor}
                onChange={(e) => handleTextColorChange(e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Size Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Button Size</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size.key}
              onClick={() => handleSizeChange(size.key)}
              className={`p-3 text-left border rounded-lg transition-all hover:shadow-sm ${
                buttonData.buttonSize === size.key
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{size.label}</div>
              <div className="text-xs text-gray-500 mt-1">{size.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Platform Selection Enhancement */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Calendar Platforms</label>
        <div className="text-xs text-gray-600 mb-2">Choose which calendar services to support</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {buttonData.selectedPlatforms && Object.entries(buttonData.selectedPlatforms).map(([platform, selected]) => (
            <label key={platform} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => updateButton({
                  selectedPlatforms: {
                    ...buttonData.selectedPlatforms,
                    [platform]: e.target.checked
                  }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700 capitalize">{platform.replace('365', ' 365')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Advanced Options</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">Include hover animations</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">Mobile responsive design</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={false}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">Auto-close dropdown after selection</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCustomization;