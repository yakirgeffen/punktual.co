'use client';
import { Button } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';
import { useState } from 'react';

// Color constants
const LIGHT_COLOR = '#F4F4F5';
const DARK_COLOR = '#18181B';

// Utility function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
  try {
    const hex = color.replace('#', '');
    if (hex.length !== 6) return false; // Invalid hex length
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) return false; // Invalid hex values
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  } catch {
    return false; // Fallback for any parsing errors
  }
};

export default function ButtonColorSection() {
  const { buttonData, updateButton } = useEventFormLogic();
  const [savedCustomColor, setSavedCustomColor] = useState('#4D90FF');

  // FIX: No default fallback - shows actual selection state
  const currentColor = buttonData.colorTheme;
  const isLight = currentColor === LIGHT_COLOR;
  const isDark = currentColor === DARK_COLOR;
  const isCustom = currentColor && !isLight && !isDark;

  // Preserve custom color when switching from Light/Dark back to Custom
  const handleCustomSelect = () => {
    if (isLight || isDark) {
      updateButton({ colorTheme: savedCustomColor });
    }
  };

  // Update custom color and save it
  const handleColorChange = (color: string) => {
    setSavedCustomColor(color);
    updateButton({ colorTheme: color });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 pb-1 mb-3">Button Color</label>
      <div className="flex gap-3">
        {/* Light Button - Better selection visibility with HeroUI primary */}
        <Button
          variant={isLight ? 'solid' : 'bordered'}
          color={isLight ? 'primary' : 'default'}
          onPress={() => updateButton({ colorTheme: LIGHT_COLOR })}
          className="flex-1"
        >
          Light
        </Button>
        
        {/* Dark Button */}
        <Button
          variant={isDark ? 'solid' : 'bordered'}
          color={isDark ? 'primary' : 'default'}
          onPress={() => updateButton({ colorTheme: DARK_COLOR })}
          className="flex-1"
          style={isDark ? { 
            backgroundColor: DARK_COLOR, 
            color: '#F9FAFB', // Light text on dark background
            borderColor: DARK_COLOR 
          } : undefined}
        >
          Dark
        </Button>
        
        {/* Custom Button with Integrated Color Picker */}
        <div className="flex-1 relative">
          <Button
            variant={isCustom ? 'solid' : 'bordered'}
            color={isCustom ? 'primary' : 'default'}
            onPress={handleCustomSelect}
            className="w-full pr-12"
            style={isCustom ? { 
              backgroundColor: currentColor,
              color: isLightColor(currentColor) ? '#374151' : '#F9FAFB', // Smart text color
              borderColor: currentColor 
            } : undefined}
          >
            Custom
          </Button>
          
          {/* Integrated Color Picker */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <input
              type="color"
              value={isCustom ? currentColor : savedCustomColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
              style={{ 
                backgroundColor: isCustom ? currentColor : savedCustomColor,
                border: '1px solid rgba(0,0,0,0.1)'
              }}
              title="Choose custom color"
            />
          </div>
        </div>
      </div>
    </div>
  );
}