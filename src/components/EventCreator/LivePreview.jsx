'use client';
// src/components/EventCreator/LivePreview.jsx
import { useEventContext } from '@/contexts/EventContext'
import ButtonPreview from '../Preview/ButtonPreview'
import CodeOutput from '../Preview/CodeOutput'
import { useState } from 'react'

export default function LivePreview() {
 const [activeTab, setActiveTab] = useState('preview')
 const { eventData, buttonData, generatedCode } = useEventContext()

 return (
   <div className="sticky top-8">
     <div className="card">
       <div className="flex border-b border-gray-200 mb-6">
         <button
           onClick={() => setActiveTab('preview')}
           className={`py-2 px-4 text-sm font-medium ${
             activeTab === 'preview'
               ? 'text-primary-600 border-b-2 border-primary-600'
               : 'text-gray-500 hover:text-gray-700'
           }`}
         >
           Live Preview
         </button>
         <button
           onClick={() => setActiveTab('code')}
           className={`py-2 px-4 text-sm font-medium ${
             activeTab === 'code'
               ? 'text-primary-600 border-b-2 border-primary-600'
               : 'text-gray-500 hover:text-gray-700'
           }`}
         >
           Generated Code
         </button>
       </div>

       {activeTab === 'preview' ? (
         <ButtonPreview eventData={eventData} buttonData={buttonData} />
       ) : (
         <CodeOutput code={generatedCode} />
       )}
     </div>
   </div>
 )
}