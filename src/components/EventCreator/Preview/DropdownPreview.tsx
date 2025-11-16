/**
 * DropdownPreview.tsx
 * Preview of dropdown-style calendar button
 * Shows single button that opens a menu with platform options
 */

'use client';

import React from 'react';
import type { ButtonData, CalendarLinks } from '@/types';

interface DropdownPreviewProps {
  buttonData: ButtonData;
  calendarLinks: CalendarLinks;
  showPoweredBy?: boolean;
}

const DropdownPreview: React.FC<DropdownPreviewProps> = ({
  buttonData,
  calendarLinks,
  showPoweredBy = true
}) => {
  // Get selected platforms
  const selectedPlatforms = Object.keys(buttonData?.selectedPlatforms || {})
    .filter(platform => buttonData?.selectedPlatforms?.[platform as keyof typeof buttonData.selectedPlatforms])
    .filter(platform => calendarLinks[platform as keyof CalendarLinks]);

  if (selectedPlatforms.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Select at least one platform to see the preview
      </div>
    );
  }

  // Button styling helpers
  const getButtonSizeClasses = (size: string) => {
    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-5 py-2.5 text-lg'
    };
    return sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium;
  };

  const getButtonStyleClasses = (style: string) => {
    const styleClasses = {
      standard: 'shadow-sm border border-transparent',
      minimal: 'shadow-none',
      pill: 'rounded-full'
    };
    return styleClasses[style as keyof typeof styleClasses] || styleClasses.standard;
  };

  const getContrastColor = (hexColor: string): string => {
    const color = hexColor.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const sRGB = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    const luminance = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    return luminance > 0.179 ? '#374151' : '#FFFFFF';
  };

  const getButtonStyles = (style: string, colorScheme: string): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    const backgroundColor = colorScheme || '#10b981';

    if (style === 'minimal') {
      styles.backgroundColor = 'transparent';
      styles.color = backgroundColor;
      styles.border = `1px solid ${backgroundColor}`;
    } else {
      styles.backgroundColor = backgroundColor;
      styles.color = getContrastColor(backgroundColor);
    }

    return styles;
  };

  const buttonSize = buttonData?.buttonSize || 'medium';
  const buttonStyle = buttonData?.buttonStyle || 'standard';
  const colorScheme = buttonData?.colorTheme || '#10b981';

  const buttonClasses = `
    inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 cursor-default
    ${getButtonSizeClasses(buttonSize)}
    ${getButtonStyleClasses(buttonStyle)}
    ${buttonStyle !== 'pill' ? 'rounded-lg' : ''}
  `.trim();

  const buttonStyles = getButtonStyles(buttonStyle, colorScheme);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h4 className="font-semibold text-gray-900 mb-1">
          Add to Calendar
        </h4>
        <p className="text-xs text-gray-600">
          Dropdown button with {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Dropdown Button Preview */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 flex items-center justify-center min-h-[100px]">
        <div
          className={buttonClasses}
          style={buttonStyles}
        >
          {buttonData?.showIcons !== false && <span className="text-base">📅</span>}
          <span>{buttonData?.customText || 'Add to Calendar'}</span>
          <span className="text-xs opacity-70">▼</span>
        </div>
      </div>

      {/* Powered by Badge */}
      {showPoweredBy && (
        <div className="text-center pt-2 border-t border-gray-200">
          <a
            href="https://punktual.co?utm_source=preview&utm_medium=dropdown"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>Powered by</span>
            <span className="font-semibold">Punktual</span>
          </a>
        </div>
      )}

      {/* Info hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 text-sm">💡</span>
          <div className="text-xs text-blue-900">
            <strong>Dropdown:</strong> Single button that opens a menu with all selected calendar platforms
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownPreview;
