//src/components/EventCreator/sections/ButtonCustomization/StyleSection.tsx

'use client';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

export default function StyleSection() {
  const { buttonData, updateButton } = useEventFormLogic();

  const styles = [
    { label: 'Standard', value: 'standard' },
    { label: 'Minimal', value: 'minimal' },
    { label: 'Pill', value: 'pill' }
  ] as const;

  return (
    <div className="flex gap-1 flex-wrap">
      {styles.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => updateButton({ buttonStyle: value })}
          className={`px-3 py-1 text-sm rounded-small border transition-colors ${
            buttonData.buttonStyle === value
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