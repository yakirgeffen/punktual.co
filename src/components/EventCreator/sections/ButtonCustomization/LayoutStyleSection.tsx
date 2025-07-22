// import LayoutStyleSection from './LayoutStyleSection';

// 'use client';
// import { Chip } from '@heroui/react';
// import { useEventFormLogic } from '@/hooks/useEventFormLogic';

// export default function LayoutStyleSection() {
//   const { buttonData, updateButton } = useEventFormLogic();

//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 pb-1 mb-3">Layout Style</label>
//       <div className="flex gap-6">
//         <label className="flex items-center gap-3 cursor-pointer">
//           <input
//             type="radio"
//             name="buttonLayout"
//             value="dropdown"
//             checked={buttonData.buttonLayout !== 'individual'}
//             onChange={() => updateButton({ buttonLayout: 'dropdown' })}
//             className="w-4 h-4 text-emerald-600"
//           />
//           <span className="text-sm">Single button with dropdown</span>
//         </label>
//         <label className="flex items-center gap-3 cursor-pointer">
//           <input
//             type="radio"
//             name="buttonLayout"
//             value="individual"
//             checked={buttonData.buttonLayout === 'individual'}
//             onChange={() => updateButton({ buttonLayout: 'individual' })}
//             className="w-4 h-4 text-emerald-600"
//           />
//           <span className="text-sm">Individual platform buttons</span>
//           <Chip size="sm" color="primary" variant="flat">Popular</Chip>
//         </label>
//       </div>
//     </div>
// );
// }