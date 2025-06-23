'use client';
// import { 
//   LayoutStyleSection, 
//   ButtonStyleSection, 
//   ButtonColorSection, 
//   AdditionalOptionsSection 
// } from './ButtonCustomization';

// Temporary: Import just ButtonColorSection to test
import ButtonColorSection from './ButtonCustomization/ButtonColorSection';
import { useEventFormLogic } from '@/hooks/useEventFormLogic';

export default function ButtonCustomizationSection() {
  const { buttonData, updateButton } = useEventFormLogic();
  
  return (
    <div className="space-y-6 pb-4">
      {/* Temporary: Keep old layout section to test ButtonColorSection */}
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
        </div>
      </div>

      {/* TEST: New ButtonColorSection */}
      <ButtonColorSection />
      
      {/* OLD: Keep this for now */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 pb-1 mb-3">Additional Options</label>
        <div className="flex flex-wrap gap-6">
          <input type="checkbox" /> <span className="text-sm">Show calendar icons</span>
        </div>
      </div>
    </div>
  );
}