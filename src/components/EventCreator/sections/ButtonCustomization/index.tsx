// import LayoutStyleSection from './LayoutStyleSection';
import StyleSection from './StyleSection';
import SizeSection from './SizeSection';
// import ButtonColorSection from './ButtonColorSection';
import AdditionalOptionsSection from './AdditionalOptionsSection';


export default function ButtonCustomizationIndex() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Style</h4>
          <StyleSection />
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Size</h4>
          <SizeSection />
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Color</h4>
          {/* <ButtonColorSection /> */}
        </div>
      </div>
      
      <AdditionalOptionsSection />
    </div>
  );
}