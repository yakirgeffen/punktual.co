//src/components/EventCreator/sections/ButtonCustomization/SizeSection.tsx

'use client';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

export default function SizeSection() {
  const { buttonData, updateButton } = useEventFormLogic();

  const sizes = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ] as const;

  return (
    <div className="flex gap-1">
      {sizes.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => updateButton({ buttonSize: value })}
          className={`px-3 py-1 text-sm rounded-small border transition-colors ${
            buttonData.buttonSize === value
              ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}