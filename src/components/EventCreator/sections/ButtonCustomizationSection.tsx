'use client';
import { Select, SelectItem, Checkbox, Chip } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

/**
 * Button Customization Section - Button styling and options
 * Updated version of FormSections/ButtonCustomization.jsx for accordion structure
 */
export default function ButtonCustomizationSection() {
  const { buttonData, updateButton } = useEventFormLogic();

  return (
    <div className="space-y-6 pb-4">
      {/* Layout Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 pb-1 mb-3">Layout Style</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="buttonLayout"
              value="dropdown"
              checked={buttonData.buttonLayout !== 'individual'}
              onChange={() => updateButton({ buttonLayout: 'dropdown' })}
              className="w-4 h-4 text-emerald-600"
            />
            <span className="text-sm">Single button with dropdown</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="buttonLayout"
              value="individual"
              checked={buttonData.buttonLayout === 'individual'}
              onChange={() => updateButton({ buttonLayout: 'individual' })}
              className="w-4 h-4 text-emerald-600"
            />
            <span className="text-sm">Individual platform buttons</span>
            <Chip size="sm" color="primary" variant="flat">Popular</Chip>
          </label>
        </div>
      </div>

      {/* Button Style and Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
  label="Button Style"
  placeholder="Select button style"
  selectedKeys={[buttonData.buttonStyle || 'standard']}
  onSelectionChange={(keys) =>
    updateButton({ buttonStyle: Array.from(keys)[0] as 'standard' | 'outlined' | 'minimal' | 'pill' | 'gradient' | 'rounded' | 'sharp' })
  }
  radius="md"
  labelPlacement="outside"
  classNames={{
    label: "text-sm font-medium text-gray-700 pb-1",
    trigger: "h-12"
  }}
>
  <SelectItem key="standard">Standard</SelectItem>
  <SelectItem key="outlined">Outlined</SelectItem>
  <SelectItem key="minimal">Minimal</SelectItem>
  <SelectItem key="pill">Pill-shaped</SelectItem>
</Select>

<Select
  label="Button Size"
  placeholder="Select button size"
  selectedKeys={[buttonData.buttonSize || 'medium']}
  onSelectionChange={(keys) =>
    updateButton({ buttonSize: Array.from(keys)[0] as 'small' | 'sm' | 'md' | 'lg' | 'medium' | 'large' | 'xl' })
  }
  radius="md"
  labelPlacement="outside"
  classNames={{
    label: "text-sm font-medium text-gray-700 pb-1",
    trigger: "h-12"
  }}
>
  <SelectItem key="small">Small</SelectItem>
  <SelectItem key="medium">Medium</SelectItem>
  <SelectItem key="large">Large</SelectItem>
</Select>
      </div>

      {/* Button Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 pb-1 mb-3">Button Color</label>
        <div className="flex items-center gap-4">
          {[
            { value: '#4D90FF', name: 'Blue' },
            { value: '#34C759', name: 'Green' },
            { value: '#AF52DE', name: 'Purple' },
            { value: '#FF9500', name: 'Orange' },
            { value: '#FF3B30', name: 'Red' },
            { value: '#000000', name: 'Black' }
          ].map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => updateButton({ colorScheme: color.value })}
              className={`w-10 h-10 rounded-full border-3 transition-all hover:scale-110 ${
                buttonData.colorScheme === color.value ? 'border-gray-800 ring-2 ring-emerald-200' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          <input
            type="color"
            value={buttonData.colorScheme || '#4D90FF'}
            onChange={(e) => updateButton({ colorScheme: e.target.value })}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
            title="Custom color"
          />
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 pb-1 mb-3">Additional Options</label>
        <div className="flex flex-wrap gap-6">
          <Checkbox
            isSelected={buttonData.showIcons !== false}
            onValueChange={(checked) => updateButton({ showIcons: checked })}
            size="md"
          >
            <span className="text-sm">Show calendar icons</span>
          </Checkbox>
          <Checkbox
            isSelected={buttonData.responsive !== false}
            onValueChange={(checked) => updateButton({ responsive: checked })}
            size="md"
          >
            <span className="text-sm">Responsive design</span>
          </Checkbox>
          <Checkbox
            isSelected={buttonData.openInNewTab !== false}
            onValueChange={(checked) => updateButton({ openInNewTab: checked })}
            size="md"
          >
            <span className="text-sm">Open in new tab</span>
          </Checkbox>
        </div>
      </div>
    </div>
  );
}