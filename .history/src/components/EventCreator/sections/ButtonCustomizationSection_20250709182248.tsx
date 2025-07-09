'use client';
import { useState } from 'react';
import { Card, Button, Input } from '@heroui/react';
import { Copy, Code2, Eye } from 'lucide-react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';
import toast from 'react-hot-toast';

// Button Layout Types
const LAYOUT_TYPES = [
  {
    id: 'single',
    name: 'Add to Calendar - Single Button',
    description: 'One button that opens a dropdown with all calendar options',
    icon: '🔘'
  },
  {
    id: 'multiple',
    name: 'Add to Calendar - Button Links', 
    description: 'Individual buttons for each selected calendar platform',
    icon: '📱'
  }
];

// Button Shapes
const BUTTON_SHAPES = [
  { id: 'squared' as const, name: 'Squared', preview: 'Squared', class: 'rounded-none' },
  { id: 'rounded' as const, name: 'Rounded', preview: 'Rounded', class: 'rounded-lg' },
  { id: 'pill' as const, name: 'Pill', preview: 'Pill', class: 'rounded-full' }
];

// Color Themes
const COLOR_THEMES = [
  {
    id: 'light',
    name: 'Light Mode',
    bg: '#FFFFFF',
    text: '#000000',
    border: '#E5E5E5'
  },
  {
    id: 'dark', 
    name: 'Dark Mode',
    bg: '#000000',
    text: '#FFFFFF',
    border: '#333333'
  },
  {
    id: 'brand',
    name: 'Custom Brand',
    bg: '#4D90FF',
    text: '#FFFFFF', 
    border: '#4D90FF'
  }
];

// Platform Display Options (for multiple buttons)
const DISPLAY_OPTIONS = [
  { id: 'names' as const, name: 'Platform Names Only', example: 'Google Calendar' },
  { id: 'icons' as const, name: 'Platform Icons Only', example: '📅' },
  { id: 'both' as const, name: 'Icons + Names', example: '📅 Google Calendar' }
];

// Platform Info
const PLATFORM_INFO = {
  google: { name: 'Google Calendar', icon: '📅', defaultColor: '#4285F4' },
  apple: { name: 'Apple Calendar', icon: '🍎', defaultColor: '#000000' },
  outlook: { name: 'Microsoft Outlook', icon: '📧', defaultColor: '#0078D4' },
  office365: { name: 'Office 365', icon: '🏢', defaultColor: '#0078D4' },
  yahoo: { name: 'Yahoo Calendar', icon: '🟣', defaultColor: '#7B1FA2' }
};

export default function FocusedButtonCustomization() {
  const { buttonData, updateButton } = useEventFormLogic();
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Get current selections with defaults
  const layoutType = buttonData.buttonLayout || 'single';
  const buttonShape = buttonData.buttonShape || 'rounded';
  const colorTheme = buttonData.colorTheme || 'brand';
  const ctaText = buttonData.ctaText || 'Add to Calendar';
  const displayOption = buttonData.displayOption || 'both';
  const customBrandColor = buttonData.customBrandColor || '#4D90FF';

  // Get selected platforms
  const selectedPlatforms = Object.keys(buttonData.selectedPlatforms || {})
    .filter(platform => buttonData.selectedPlatforms?.[platform]);

  // Handle copy to clipboard
  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedType(type);
      toast.success(`${type} copied!`);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Generate button HTML code
  const generateButtonCode = () => {
    const theme = COLOR_THEMES.find(t => t.id === colorTheme);
    const shape = BUTTON_SHAPES.find(s => s.id === buttonShape);
    const actualBg = colorTheme === 'brand' ? customBrandColor : theme?.bg;
    const actualText = colorTheme === 'brand' ? '#FFFFFF' : theme?.text;

    if (layoutType === 'single') {
      return `<!-- Punktual Single Calendar Button -->
<div class="punktual-calendar-button">
  <button 
    class="inline-flex items-center justify-center px-6 py-3 font-medium transition-all duration-200 hover:opacity-90 ${shape?.class}"
    style="background-color: ${actualBg}; color: ${actualText}; border: 1px solid ${theme?.border || actualBg};"
    onclick="openCalendarDropdown()"
  >
    📅 ${ctaText}
  </button>
  <!-- Dropdown menu would be implemented with JavaScript -->
</div>

<style>
.punktual-calendar-button button {
  cursor: pointer;
  border: none;
  outline: none;
}
.punktual-calendar-button button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>`;
    } else {
      const buttons = selectedPlatforms.map(platform => {
        const info = PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO];
        let buttonBg = actualBg;
        let buttonText = actualText;
        
        // Use original platform colors if selected
        if (colorTheme === 'original') {
          buttonBg = info?.defaultColor || '#4D90FF';
          buttonText = '#FFFFFF';
        }

        let content = '';
        if (displayOption === 'names') content = info?.name || platform;
        else if (displayOption === 'icons') content = info?.icon || '📅';
        else content = `${info?.icon || '📅'} ${info?.name || platform}`;

        return `  <a 
    href="#" 
    class="inline-flex items-center justify-center px-4 py-2 font-medium transition-all duration-200 hover:opacity-90 ${shape?.class}"
    style="background-color: ${buttonBg}; color: ${buttonText}; text-decoration: none; margin: 0 4px 8px 0;"
  >
    ${content}
  </a>`;
      }).join('\n');

      return `<!-- Punktual Multiple Calendar Buttons -->
<div class="punktual-calendar-buttons">
${buttons}
</div>

<style>
.punktual-calendar-buttons a {
  cursor: pointer;
  border: none;
  outline: none;
}
.punktual-calendar-buttons a:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>`;
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Button Customization</h3>
        <p className="text-sm text-gray-600 mt-1">Choose your calendar button style and customize it</p>
      </div>

      {/* Layout Type Selection */}
      <Card className="p-4">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Button Type</h4>
          <div className="grid grid-cols-1 gap-4">
            {LAYOUT_TYPES.map((type) => (
              <div
                key={type.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  layoutType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateButton({ buttonLayout: type.id as 'dropdown' | 'individual' })}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{type.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                    {layoutType === type.id && (
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Single Button Customization */}
      {layoutType === 'single' && (
        <Card className="p-4">
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Single Button Options</h4>
            
            {/* CTA Text */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Button Text</label>
              <Input
                value={ctaText}
                onChange={(e) => updateButton({ ctaText: e.target.value })}
                placeholder="Add to Calendar"
                className="max-w-sm"
              />
            </div>

            {/* Button Shape */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Button Shape</label>
              <div className="flex gap-3">
                {BUTTON_SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => updateButton({ buttonShape: shape.id })}
                    className={`px-4 py-2 border-2 transition-all ${shape.class} ${
                      buttonShape === shape.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {shape.preview}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Color Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {COLOR_THEMES.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      colorTheme === theme.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateButton({ colorTheme: theme.id })}
                  >
                    <div className="text-center space-y-2">
                      <div
                        className="w-full h-8 rounded border"
                        style={{ 
                          backgroundColor: theme.id === 'brand' ? customBrandColor : theme.bg,
                          color: theme.id === 'brand' ? '#FFFFFF' : theme.text,
                          border: `1px solid ${theme.border}`
                        }}
                      />
                      <p className="text-sm font-medium">{theme.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Brand Color */}
              {colorTheme === 'brand' && (
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Brand Color:</label>
                  <input
                    type="color"
                    value={customBrandColor}
                    onChange={(e) => updateButton({ customBrandColor: e.target.value })}
                    className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 font-mono">{customBrandColor}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Multiple Buttons Customization */}
      {(layoutType === 'dropdown' || layoutType === 'individual') && (
        <Card className="p-4">
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Multiple Buttons Options</h4>
            
            {/* Display Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Display Style</label>
              <div className="grid grid-cols-3 gap-3">
                {DISPLAY_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                      displayOption === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateButton({ displayOption: option.id })}
                  >
                    <p className="font-medium text-sm">{option.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{option.example}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Button Shape */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Button Shape</label>
              <div className="flex gap-3">
                {BUTTON_SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => updateButton({ buttonShape: shape.id })}
                    className={`px-4 py-2 border-2 transition-all ${shape.class} ${
                      buttonShape === shape.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {shape.preview}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme (includes Original option) */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Color Theme</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...COLOR_THEMES, { id: 'original', name: 'Original Platform Colors', bg: 'mixed', text: '#FFFFFF', border: 'mixed' }].map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      colorTheme === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateButton({ colorTheme: theme.id })}
                  >
                    <div className="text-center space-y-2">
                      {theme.id === 'original' ? (
                        <div className="flex gap-1">
                          <div className="w-4 h-8 rounded" style={{ backgroundColor: '#4285F4' }} />
                          <div className="w-4 h-8 rounded" style={{ backgroundColor: '#000000' }} />
                          <div className="w-4 h-8 rounded" style={{ backgroundColor: '#0078D4' }} />
                          <div className="w-4 h-8 rounded" style={{ backgroundColor: '#7B1FA2' }} />
                        </div>
                      ) : (
                        <div
                          className="w-full h-8 rounded border"
                          style={{ 
                            backgroundColor: theme.id === 'brand' ? customBrandColor : theme.bg,
                            color: theme.id === 'brand' ? '#FFFFFF' : theme.text,
                            border: `1px solid ${theme.border}`
                          }}
                        />
                      )}
                      <p className="text-xs font-medium">{theme.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Brand Color for Multiple */}
              {colorTheme === 'brand' && (
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Brand Color:</label>
                  <input
                    type="color"
                    value={customBrandColor}
                    onChange={(e) => updateButton({ customBrandColor: e.target.value })}
                    className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 font-mono">{customBrandColor}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Live Preview */}
      <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Live Preview</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSourceCode(!showSourceCode)}
                startContent={showSourceCode ? <Eye className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
              >
                {showSourceCode ? 'Preview' : 'Source Code'}
              </Button>
              <Button
                size="sm"
                color="primary"
                onClick={() => copyToClipboard(generateButtonCode(), 'Button Code')}
                startContent={<Copy className="w-4 h-4" />}
              >
                {copiedType === 'Button Code' ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
          </div>

          {!showSourceCode ? (
            <div className="flex items-center justify-center py-8">
              {layoutType === 'single' ? (
                <button
                  className={`inline-flex items-center justify-center px-6 py-3 font-medium transition-all duration-200 hover:opacity-90 ${
                    BUTTON_SHAPES.find(s => s.id === buttonShape)?.class
                  }`}
                  style={{
                    backgroundColor: colorTheme === 'brand' ? customBrandColor : COLOR_THEMES.find(t => t.id === colorTheme)?.bg,
                    color: colorTheme === 'brand' ? '#FFFFFF' : COLOR_THEMES.find(t => t.id === colorTheme)?.text,
                    border: `1px solid ${COLOR_THEMES.find(t => t.id === colorTheme)?.border || customBrandColor}`
                  }}
                >
                  📅 {ctaText}
                </button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedPlatforms.length > 0 ? selectedPlatforms.map(platform => {
                    const info = PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO];
                    let buttonBg = colorTheme === 'brand' ? customBrandColor : COLOR_THEMES.find(t => t.id === colorTheme)?.bg;
                    let buttonText = colorTheme === 'brand' ? '#FFFFFF' : COLOR_THEMES.find(t => t.id === colorTheme)?.text;
                    
                    if (colorTheme === 'original') {
                      buttonBg = info?.defaultColor || '#4D90FF';
                      buttonText = '#FFFFFF';
                    }

                    let content = '';
                    if (displayOption === 'names') content = info?.name || platform;
                    else if (displayOption === 'icons') content = info?.icon || '📅';
                    else content = `${info?.icon || '📅'} ${info?.name || platform}`;

                    return (
                      <button
                        key={platform}
                        className={`inline-flex items-center justify-center px-4 py-2 font-medium transition-all duration-200 hover:opacity-90 ${
                          BUTTON_SHAPES.find(s => s.id === buttonShape)?.class
                        }`}
                        style={{
                          backgroundColor: buttonBg,
                          color: buttonText
                        }}
                      >
                        {content}
                      </button>
                    );
                  }) : (
                    <p className="text-gray-500">Select calendar platforms to see preview</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                {generateButtonCode()}
              </pre>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}