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

  // No default fallback - shows actual selection state
  const currentColor = buttonData.colorScheme;
  const isLight = currentColor === LIGHT_COLOR;
  const isDark = currentColor === DARK_COLOR;
  const isCustom = currentColor && !isLight && !isDark;

  // Preserve custom color when switching from Light/Dark back to Custom
  const handleCustomSelect = () => {
    if (isLight || isDark) {
      updateButton({ colorScheme: savedCustomColor });
    }
  };

  // Update custom color and save it
  const handleColorChange = (color: string) => {
    setSavedCustomColor(color);
    updateButton({ colorScheme: color });
  };

  return (
    <div className="space-y-3">
      {/* HeroUI Typography */}
      <p className="text-sm font-medium text-foreground">Button Color</p>
      
      {/* HeroUI ButtonGroup for color selection */}
      <ButtonGroup className="w-full" variant="bordered">
        {/* Light Button */}
        <Button
          variant={isLight ? 'solid' : 'bordered'}
          color={isLight ? 'primary' : 'default'}
          onPress={() => updateButton({ colorScheme: LIGHT_COLOR })}
          className="flex-1"
        >
          Light
        </Button>
        
        {/* Dark Button */}
        <Button
          variant={isDark ? 'solid' : 'bordered'}
          color={isDark ? 'primary' : 'default'}
          onPress={() => updateButton({ colorScheme: DARK_COLOR })}
          className="flex-1"
          style={isDark ? { 
            backgroundColor: DARK_COLOR, 
            color: '#F9FAFB',
            borderColor: DARK_COLOR 
          } : undefined}
        >
          Dark
        </Button>
        
        {/* Custom Button */}
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
      
      {/* HeroUI Card for color picker when custom is selected */}
      {isCustom && (
        <Card className="w-full">
          <CardBody className="py-2 px-3">
            <div className="flex items-center gap-3">
              <p className="text-sm text-foreground-600">Choose color:</p>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-8 h-8 rounded-medium border-2 border-divider cursor-pointer"
                title="Choose custom color"
              />
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}