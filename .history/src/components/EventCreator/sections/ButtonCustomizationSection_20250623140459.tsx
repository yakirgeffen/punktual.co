'use client';
import { 
  LayoutStyleSection, 
  ButtonStyleSection, 
  ButtonColorSection, 
  AdditionalOptionsSection 
} from './ButtonCustomization';

/**
 * Button Customization Section - Main orchestrator
 * Clean, focused component that delegates to specialized sub-sections
 * Replaces the original monolithic implementation with modular sub-components
 */
export default function ButtonCustomizationSection() {
  return (
    <div className="space-y-6 pb-4">
      <LayoutStyleSection />
      <ButtonStyleSection />
      <ButtonColorSection />
      <AdditionalOptionsSection />
    </div>
  );
}