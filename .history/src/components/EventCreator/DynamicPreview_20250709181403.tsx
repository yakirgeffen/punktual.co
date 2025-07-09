'use client';
import React, { useState } from 'react';
import { useEventContext } from '@/contexts/EventContext';
import { generateCalendarCode } from '@/utils/calendarGenerator';
import toast from 'react-hot-toast';

interface DynamicPreviewProps {
  useCase?: string;
}

const DynamicPreview: React.FC<DynamicPreviewProps> = ({ useCase = 'button-widget' }) => {
  const { eventData, buttonData, calendarLinks } = useEventContext();
  
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('button');
  const [isMinified, setIsMinified] = useState(false);
  const [codeFormat, setCodeFormat] = useState<'html' | 'react' | 'css' | 'js'>('html');

  // Platform info with fallbacks
  const platformInfo: Record<string, { name: string; logo: string }> = {
    google: { name: 'Google Calendar', logo: '/icons/platforms/icon-google.svg' },
    apple: { name: 'Apple Calendar', logo: '/icons/platforms/icon-apple.svg' },
    outlook: { name: 'Outlook', logo: '/icons/platforms/icon-outlook.svg' },
    office365: { name: 'Office 365', logo: '/icons/platforms/icon-office365.svg' },
    outlookcom: { name: 'Outlook.com', logo: '/icons/platforms/icon-outlook.svg' },
    yahoo: { name: 'Yahoo Calendar', logo: '/icons/platforms/icon-yahoo.svg' }
  };

  const selectedPlatforms = Object.keys(buttonData?.selectedPlatforms || {})
    .filter(platform => buttonData?.selectedPlatforms?.[platform as keyof typeof buttonData.selectedPlatforms]);

  // Check if event is complete
  const hasTitle = !!eventData?.title?.trim();
  const hasStartDate = !!eventData?.startDate;
  const hasStartTime = !!eventData?.startTime;
  const hasEndDate = !!eventData?.endDate;
  const hasEndTime = !!eventData?.endTime;
  const hasPlatforms = Object.values(buttonData?.selectedPlatforms || {}).some(Boolean);
  
  const isComplete = hasTitle && hasStartDate && hasStartTime && hasEndDate && hasEndTime && hasPlatforms;

  // Copy function with error handling
  const copyToClipboard = async (text: string, label = 'Content') => {
    if (!text) {
      toast.error('Nothing to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Format date/time for display
  const formatDateTime = () => {
    if (!eventData?.startDate) return 'Select date and time';
    
    try {
      const startDate = new Date(eventData.startDate);
      const dateStr = startDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!eventData.startTime) return dateStr;
      
      const [hours, minutes] = eventData.startTime.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      const timeStr = `${hour12}:${minutes} ${ampm}`;
      
      return `${dateStr} at ${timeStr}`;
    } catch {
      return 'Invalid date';
    }
  };

  // Generate code with error handling
  const getGeneratedCode = () => {
    if (!isComplete) return '<!-- Complete the form to generate code -->';
    
    try {
      const options = {
        minified: isMinified,
        format: codeFormat,
        includeCss: true,
        includeJs: true
      };
      
      return generateCalendarCode(eventData, buttonData, useCase, options);
    } catch {
      return '<!-- Error generating code -->';
    }
  };

  // Safe platform access helper
  const getPlatformInfo = (platform: string) => {
    return platformInfo[platform] || { 
      name: platform.charAt(0).toUpperCase() + platform.slice(1), 
      logo: '/icons/platforms/icon-calendar.svg' 
    };
  };

  // Safe calendar link access
  const getCalendarLink = (platform: string): string => {
    return calendarLinks?.[platform as keyof typeof calendarLinks] || '';
  };

  // Get use case title and description
  const getUseCaseInfo = () => {
    switch (useCase) {
      case 'individual-buttons':
        return {
          title: 'Individual Platform Buttons',
          description: 'Separate button for each calendar platform'
        };
      case 'dropdown-button':
        return {
          title: 'Dropdown Calendar Button',
          description: 'Single button with platform selection dropdown'
        };
      case 'button-widget':
        return {
          title: 'Add to Calendar Button',
          description: 'Interactive dropdown button for websites'
        };
      case 'email-links':
        return {
          title: 'Email Calendar Links',
          description: 'Perfect for email campaigns and newsletters'
        };
      case 'direct-links':
        return {
          title: 'Direct Calendar Links',
          description: 'Raw platform URLs for advanced integrations'
        };
      case 'event-page':
        return {
          title: 'Event Landing Page',
          description: 'Full page layout for event promotion'
        };
      default:
        return {
          title: 'Calendar Integration',
          description: 'Choose an output format to preview'
        };
    }
  };

  const useCaseInfo = getUseCaseInfo();

  return (
    <div className="h-full">
      <div className="bg-white border rounded-lg h-full flex flex-col">
        
        {/* Header with Use Case Info */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 rounded-t-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{useCaseInfo.title}</h3>
            {/* {isComplete && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Ready
              </span>
            )} */}
          </div>
          <p className="text-sm text-gray-600">{useCaseInfo.description}</p>
        </div>

        {/* Preview Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {!isComplete ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Event</h3>
              <p className="text-gray-600">Fill in the required fields to see your preview</p>
            </div>
          ) : (
            <div>
              {/* Individual Buttons */}
              {useCase === 'individual-buttons' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200">
                    <div className="space-y-3">
                      {selectedPlatforms.map(platform => {
                        const info = getPlatformInfo(platform);
                        const link = getCalendarLink(platform);
                        
                        return (
                          <button
                            key={platform}
                            onClick={() => {
                              if (link) {
                                window.open(link, '_blank');
                                toast.success(`Opening ${info.name}!`);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            style={{ backgroundColor: buttonData?.colorTheme || '#4D90FF' }}
                            disabled={!link}
                          >
                            {buttonData?.showIcons !== false && (
                              <img 
                                src={info.logo} 
                                alt={info.name}
                                className="w-4 h-4 brightness-0 invert"
                                onError={(e) => {
                                  e.currentTarget.src = '/icons/platforms/icon-calendar.svg';
                                }}
                              />
                            )}
                            <span>Add to {info.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Code Section for Individual Buttons */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-medium text-gray-900">Generated Code</h4>
                      <button
                        onClick={() => copyToClipboard(getGeneratedCode(), 'Code')}
                        className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                      >
                        📋 {copied ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <pre className="text-sm text-gray-100 whitespace-pre-wrap font-mono">
                        {getGeneratedCode()}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Dropdown Button */}
              {(useCase === 'dropdown-button' || useCase === 'button-widget') && (
                <div className="space-y-4">
                  {/* Sub-tabs */}
                  <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                      {['button', 'links', 'code'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Button Preview */}
                  {activeTab === 'button' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-200">
                        <div className="text-center">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setDropdownOpen(!dropdownOpen)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                              style={{ backgroundColor: buttonData?.colorTheme || '#4D90FF' }}
                            >
                              {buttonData?.showIcons !== false && <span>📅</span>}
                              <span>Add to Calendar</span>
                              <span className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                                ▼
                              </span>
                            </button>
                            
                            {dropdownOpen && (
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {selectedPlatforms.map(platform => {
                                  const info = getPlatformInfo(platform);
                                  const link = getCalendarLink(platform);
                                  
                                  return (
                                    <button
                                      key={platform}
                                      onClick={() => {
                                        if (link) {
                                          window.open(link, '_blank');
                                          toast.success(`Opening ${info.name}!`);
                                        }
                                        setDropdownOpen(false);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                    >
                                      <img 
                                        src={info.logo} 
                                        alt={info.name}
                                        className="w-4 h-4"
                                        onError={(e) => {
                                          e.currentTarget.src = '/icons/platforms/icon-calendar.svg';
                                        }}
                                      />
                                      <span className="text-gray-700">{info.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center">Click the button to see the dropdown</p>
                    </div>
                  )}

                  {/* Links Sub-tab */}
                  {activeTab === 'links' && (
                    <div className="space-y-3">
                      {selectedPlatforms.map(platform => {
                        const info = getPlatformInfo(platform);
                        const link = getCalendarLink(platform);
                        
                        return (
                          <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center">
                              <img 
                                src={info.logo} 
                                alt={info.name}
                                className="w-5 h-5 mr-3"
                                onError={(e) => {
                                  e.currentTarget.src = '/icons/platforms/icon-calendar.svg';
                                }}
                              />
                              <span className="font-medium text-gray-900">{info.name}</span>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => copyToClipboard(link, info.name)}
                                className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              >
                                {copied ? 'Copied!' : 'Copy'}
                              </button>
                              <button
                                onClick={() => link && window.open(link, '_blank')}
                                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                                disabled={!link}
                              >
                                Open
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Code Sub-tab */}
                  {activeTab === 'code' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-md font-medium text-gray-900">Generated Code</h4>
                        <div className="flex items-center gap-3">
                          <select
                            value={codeFormat}
                            onChange={(e) => setCodeFormat(e.target.value as 'html' | 'react' | 'css' | 'js')}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="html">HTML</option>
                            <option value="react">React</option>
                            <option value="css">CSS Only</option>
                            <option value="js">JS Only</option>
                          </select>
                          
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={isMinified}
                              onChange={(e) => setIsMinified(e.target.checked)}
                              className="w-3 h-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span>Minified</span>
                          </label>
                          
                          <button
                            onClick={() => copyToClipboard(getGeneratedCode(), 'Code')}
                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                          >
                            📋 {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <pre className="text-sm text-gray-100 whitespace-pre-wrap font-mono">
                          {getGeneratedCode()}
                        </pre>
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>
                          Format: {codeFormat.toUpperCase()} 
                          {isMinified && ' (Minified)'}
                        </span>
                        <span>
                          {getGeneratedCode().length} characters
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Email Links */}
              {useCase === 'email-links' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {selectedPlatforms.map(platform => {
                      const info = getPlatformInfo(platform);
                      const link = getCalendarLink(platform);
                      
                      return (
                        <div key={platform} className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <img 
                                src={info.logo} 
                                alt={info.name}
                                className="w-5 h-5 mr-3"
                                onError={(e) => {
                                  e.currentTarget.src = '/icons/platforms/icon-calendar.svg';
                                }}
                              />
                              <span className="font-medium text-gray-900">{info.name}</span>
                            </div>
                            
                            <button
                              onClick={() => copyToClipboard(link, info.name)}
                              className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                          </div>
                          
                          <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded border break-all">
                            {link || 'No link generated'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Direct Links */}
              {useCase === 'direct-links' && (
                <div className="space-y-4">
                  {selectedPlatforms.map(platform => {
                    const info = getPlatformInfo(platform);
                    const link = getCalendarLink(platform);
                    
                    return (
                      <div key={platform} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <img 
                              src={info.logo} 
                              alt={info.name}
                              className="w-5 h-5 mr-3"
                              onError={(e) => {
                                e.currentTarget.src = '/icons/platforms/icon-calendar.svg';
                              }}
                            />
                            <span className="font-medium text-gray-900">{info.name}</span>
                          </div>
                          
                          <button
                            onClick={() => copyToClipboard(link, info.name)}
                            className="px-3 py-1 text-xs font-medium text-emerald-500 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            {copied ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                        
                        <div className="text-xs text-emerald-400 font-mono bg-neutral-950 p-2 rounded border break-all">
                          {link || 'No link generated'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Event Page */}
              {useCase === 'event-page' && (
                <div className="space-y-4">
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-6">
                    <div className="text-center space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900">{eventData?.title}</h2>
                      <p className="text-lg text-gray-600">{formatDateTime()}</p>
                      {eventData?.location && (
                        <p className="text-gray-600">📍 {eventData.location}</p>
                      )}
                      {eventData?.description && (
                        <p className="text-gray-700 mt-4">{eventData.description}</p>
                      )}
                      
                      <div className="pt-6">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                          📅 Add to My Calendar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicPreview;