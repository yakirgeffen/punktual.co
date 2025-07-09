// src/components/EventCreator/UseCaseToggle.jsx
'use client';

import React from 'react';

const UseCaseToggle = ({ selectedUseCase, onUseCaseChange, isMobile = false, isCompact = false }) => {
  
  const useCases = [
    {
      id: 'page',
      name: 'Event Page',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Hosted landing page',
      details: 'Share a link to a dedicated event page'
    },
    {
      id: 'links',
      name: 'Calendar Links',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      description: 'Multiple platform links',
      details: 'Perfect for email campaigns & newsletters'
    },
    {
      id: 'button',
      name: 'Calendar Button',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
      description: 'Embeddable widget',
      details: 'For websites & landing pages'
    },
    {
      id: 'direct',
      name: 'Direct Links',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      ),
      description: 'Platform-specific URLs',
      details: 'Direct links to each calendar service'
    }
  ];

  const handleUseCaseChange = (useCaseId) => {
    onUseCaseChange(useCaseId);
  };

  if (isCompact) {
    return (
      <div className="space-y-4">
        {useCases.map((useCase) => (
          <button
            key={useCase.id}
            onClick={() => handleUseCaseChange(useCase.id)}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-200 text-center
              ${selectedUseCase === useCase.id
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            {/* Icon with more space */}
            <div className={`
              mx-auto mb-3 ${selectedUseCase === useCase.id ? 'text-emerald-600' : 'text-gray-400'}
            `}>
              {useCase.icon}
            </div>
            
            {/* Text with better spacing */}
            <div>
              <h3 className="font-semibold text-sm mb-2">{useCase.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{useCase.description}</p>
            </div>

            {/* Selection Indicator */}
            {selectedUseCase === useCase.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full mx-auto mt-3"></div>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Choose Output Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {useCases.map((useCase) => (
            <button
              key={useCase.id}
              onClick={() => handleUseCaseChange(useCase.id)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${selectedUseCase === useCase.id
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center space-x-2 mb-1">
                <div className={selectedUseCase === useCase.id ? 'text-emerald-600' : 'text-gray-400'}>
                  {useCase.icon}
                </div>
                <span className="font-medium text-sm">{useCase.name}</span>
              </div>
              <p className="text-xs text-gray-500">{useCase.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Use Case Options */}
      <div className="space-y-3">
        {useCases.map((useCase) => (
          <button
            key={useCase.id}
            onClick={() => handleUseCaseChange(useCase.id)}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${selectedUseCase === useCase.id
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className={`
                mt-0.5 ${selectedUseCase === useCase.id ? 'text-emerald-600' : 'text-gray-400'}
              `}>
                {useCase.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{useCase.name}</h3>
                  {selectedUseCase === useCase.id && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{useCase.description}</p>
                <p className="text-xs text-gray-400 mt-1">{useCase.details}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Current Selection Summary */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">
            {useCases.find(uc => uc.id === selectedUseCase)?.name} Selected
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {useCases.find(uc => uc.id === selectedUseCase)?.details}
        </p>
      </div>

    </div>
  );
};

export default UseCaseToggle;