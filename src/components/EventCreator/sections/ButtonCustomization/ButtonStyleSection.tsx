'use client';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

export default function ButtonStyleSection() {
  const { buttonData, updateButton } = useEventFormLogic();

  const styles = [
    { label: 'Standard', value: 'standard' },
    { label: 'Minimal', value: 'minimal' },
    { label: 'Pill', value: 'pill' }
  ] as const;

  const sizes = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Style</label>
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
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Size</label>
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
      </div>
    </div>
  );
}