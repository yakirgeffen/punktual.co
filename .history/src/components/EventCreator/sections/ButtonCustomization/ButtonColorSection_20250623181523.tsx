'use client';
import { Button, ButtonGroup, Card, CardBody } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';
import { useState } from 'react';

// Color constants
const LIGHT_COLOR = '#F4F4F5';
const DARK_COLOR = '#18181B';

// Utility function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
  try {
    const hex = color.replace('#', '');
    if (hex.length !== 6) return false;
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  } catch {
    return false;
  }
};

export default function ButtonColorSection() {
  const { buttonData, updateButton } = useEventFormLogic();
  const [savedCustomColor, setSavedCustomColor] = useState('#4D90FF');

  // Determine current color state
  const currentColor = buttonData.colorTheme;
  const isLight = currentColor === LIGHT_COLOR;
  const isDark = currentColor === DARK_COLOR;
  const isCustom = currentColor && !isLight && !isDark;

  // Handle custom color mode activation
  const handleCustomSelect = () => {
    if (isLight || isDark) {
      updateButton({ colorTheme: savedCustomColor });
    }
  };

  // Handle custom color change
  const handleColorChange = (color: string) => {
    setSavedCustomColor(color);
    updateButton({ colorTheme: color });
  };

  return (
    <div className="space-y-4">
      {/* Hero UI Label */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Button Color</p>
      </div>
      
      {/* Hero UI ButtonGroup for the 3 main options */}
      <ButtonGroup variant="bordered" className="w-full">
        <Button
          variant={isLight ? 'solid' : 'bordered'}
          color={isLight ? 'primary' : 'default'}
          onPress={() => updateButton({ colorTheme: LIGHT_COLOR })}
          className="flex-1"
        >
          Light
        </Button>
        
        <Button
          variant={isDark ? 'solid' : 'bordered'}
          color={isDark ? 'primary' : 'default'}
          onPress={() => updateButton({ colorTheme: DARK_COLOR })}
          className="flex-1"
          style={isDark ? { 
            backgroundColor: DARK_COLOR, 
            color: '#F9FAFB',
            borderColor: DARK_COLOR 
          } : undefined}
        >
          Dark
        </Button>
        
        <Button
          variant={isCustom ? 'solid' : 'bordered'}
          color={isCustom ? 'primary' : 'default'}
          onPress={handleCustomSelect}
          className="flex-1"
          style={isCustom ? { 
            backgroundColor: currentColor,
            color: isLightColor(currentColor) ? '#374151' : '#F9FAFB',
            borderColor: currentColor 
          } : undefined}
        >
          Custom
        </Button>
      </ButtonGroup>
      
      {/* Hero UI Card for color picker when custom is selected */}
      {isCustom && (
        <Card>
          <CardBody className="py-1 px-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-foreground-600 min-w-fit">Choose color:</p>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-divider cursor-pointer bg-transparent"
                title="Choose custom color"
              />
              <div className="text-xs text-foreground-500 font-mono">
                {currentColor}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}