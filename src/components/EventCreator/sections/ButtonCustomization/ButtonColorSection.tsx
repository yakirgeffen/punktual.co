// 'use client';
// import { useEventFormLogic } from '@/hooks/useEventFormLogic';
// import { useState } from 'react';
// import { Modal, ModalContent, ModalHeader, ModalBody, Divider } from '@heroui/react';

// const LIGHT_COLOR = '#F4F4F5';
// const DARK_COLOR = '#18181B';

// const tailwindColors = {
//   slate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#020617'],
//   gray: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#374151', '#111827', '#030712', '#111827', '#030712'],
//   zinc: ['#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a', '#18181b', '#09090b'],
//   neutral: ['#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717', '#0a0a0a'],
//   stone: ['#fafaf9', '#f5f5f4', '#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c', '#57534e', '#44403c', '#292524', '#1c1917', '#0c0a09'],
//   red: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a'],
//   orange: ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#431407'],
//   amber: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#451a03'],
//   yellow: ['#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12', '#422006'],
//   lime: ['#f7fee7', '#ecfccb', '#d9f99d', '#bef264', '#a3e635', '#84cc16', '#65a30d', '#4d7c0f', '#365314', '#1a2e05', '#0c1302'],
//   green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#052e16'],
//   emerald: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22'],
//   teal: ['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a', '#042f2e'],
//   cyan: ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63', '#083344'],
//   sky: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#082f49'],
//   blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'],
//   indigo: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b'],
//   violet: ['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#2d1b69'],
//   purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87', '#3b0764'],
//   fuchsia: ['#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf', '#86198f', '#701a75', '#4a044e'],
//   pink: ['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843', '#500724'],
//   rose: ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337', '#4c0519']
// };

// const colorNames = Object.keys(tailwindColors);

// export default function ButtonColorSection() {
//   const { buttonData, updateButton } = useEventFormLogic();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [hexInput, setHexInput] = useState('');
  
//   const currentColor = buttonData.colorTheme;
//   const isCustom = currentColor && currentColor !== LIGHT_COLOR && currentColor !== DARK_COLOR;

//   const selectColor = (color: string) => {
//     updateButton({ colorTheme: color });
//     setIsModalOpen(false);
//   };

//   const handleHexSubmit = () => {
//     if (hexInput.match(/^#[0-9A-F]{6}$/i)) {
//       updateButton({ colorTheme: hexInput });
//       setIsModalOpen(false);
//     }
//   };

//   return (
//     <>
//       <div className="flex items-center gap-3">
//         {/* <span className="text-sm font-medium text-gray-700">Color:</span> */}
        
//         <button
//           onClick={() => updateButton({ colorTheme: LIGHT_COLOR })}
//           className={`flex items-center gap-2 px-3 py-1 rounded-small border text-sm ${
//             currentColor === LIGHT_COLOR 
//               ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
//               : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
//           }`}
//         >
//           <div className="w-3 h-3 rounded-small border" style={{ backgroundColor: LIGHT_COLOR }} />
//           Light
//         </button>
        
//         <button
//           onClick={() => updateButton({ colorTheme: DARK_COLOR })}
//           className={`flex items-center gap-2 px-3 py-1 rounded-small border text-sm ${
//             currentColor === DARK_COLOR 
//               ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
//               : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
//           }`}
//         >
//           <div className="w-3 h-3 rounded-small border" style={{ backgroundColor: DARK_COLOR }} />
//           Dark
//         </button>
        
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className={`flex items-center gap-2 px-3 py-1 rounded-small border text-sm ${
//             isCustom 
//               ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
//               : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
//           }`}
//         >
//           <div 
//             className="w-3 h-3 rounded-smalls border" 
//             style={{ backgroundColor: isCustom ? currentColor : '#40D2A3' }} 
//           />
//           Custom
//         </button>
//       </div>

//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="2xl">
//         <ModalContent>
//           <ModalHeader>Choose Custom Color</ModalHeader>
//           <ModalBody className="pb-6">
//             <div className="space-y-4">
//               {/* Color Table */}
//               <table className="w-full border-collapse">
//                 <tbody>
//                   {Array.from({ length: 11 }, (_, rowIndex) => (
//                     <tr key={rowIndex}>
//                       {colorNames.map((colorName) => (
//                         <td key={colorName} className="p-0">
//                           <button
//                             onClick={() => selectColor(tailwindColors[colorName][rowIndex])}
//                             className="w-6 h-6 border hover:scale-110 transition-transform"
//                             style={{ backgroundColor: tailwindColors[colorName][rowIndex] }}
//                             title={`${colorName}-${[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950][rowIndex]}`}
//                           />
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
              
//               <Divider className="my-4" />

//               {/* Hex Input */}
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-gray-600">Hex:</span>
//                 <input
//                   type="text"
//                   value={hexInput}
//                   onChange={(e) => setHexInput(e.target.value.toUpperCase())}
//                   placeholder="#4D90FF"
//                   className="px-2 py-1 text-sm border rounded font-mono w-20"
//                   maxLength={7}
//                 />
                      
//                 <button
//                   onClick={handleHexSubmit}
//                   className="px-3 py-1 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600"
//                 >
//                   Apply
//                 </button>
//               </div>
//             </div>
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// }