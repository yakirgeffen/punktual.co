'use client';
import { Select, SelectItem } from '@heroui/react';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

export default function ButtonStyleSection() {
  const { buttonData, updateButton } = useEventFormLogic();

  return (
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
  );
}