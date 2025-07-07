/**
 * DynamicPreview.tsx - Main preview container that receives useCase from parent
 * Updated to use emerald colors instead of blue
 */

'use client';

import { useState } from 'react';
import { useEventContext } from '@/contexts/EventContext';
import { generateCalendarCode } from '@/utils/calendarGenerator';
import toast from 'react-hot-toast';
import EmailLinksPreview from './Preview/EmailLinksPreview';
import type { PlatformInfo } from '@/types/preview';
import { trackConversion } from '@/lib/analytics.js';
import Image from 'next/image';
import type { CodeGenerationOptions } from '@/types/index';

interface DynamicPreviewProps {
  useCase: string;
}

const PLATFORM_INFO: PlatformInfo = {
  google: { name: 'Google Calendar', logo: '/icons/platforms/icon-google.svg' },
  apple: { name: 'Apple Calendar', logo: '/icons/platforms/icon-apple.svg' },
  outlook: { name: 'Outlook', logo: '/icons/platforms/icon-outlook.svg' },
  office365: { name: 'Office 365', logo: '/icons/platforms/icon-office365.svg' },
  yahoo: { name: 'Yahoo Calendar', logo: '/icons/platforms/icon-yahoo.svg' }
};

export default function DynamicPreview({ useCase }: DynamicPreviewProps) {
  const { eventData, buttonData, calendarLinks } = useEventContext();
  
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('button');
  
  // State variables for code generation
  const [isMinified, setIsMinified] = useState<boolean>(false);
  const [codeFormat, setCodeFormat] = useState<'html' | 'react' | 'css' | 'js'>('html');
  
  // Get selected platforms with proper typing
  const selectedPlatforms: string[] = Object.keys(buttonData.selectedPlatforms || {})
    .filter(platform => buttonData.selectedPlatforms?.[platform as keyof typeof buttonData.selectedPlatforms])
    .filter((platform): platform is string => typeof platform === 'string');

  // Check if event is complete
  const hasTitle = !!eventData.title?.trim();
  const hasStartDate = !!eventData.startDate;
  const hasStartTime = !!eventData.startTime;
  const hasEndDate = !!eventData.endDate;
  const hasEndTime = !!eventData.endTime;
  const hasPlatforms = Object.values(buttonData.selectedPlatforms || {}).some(Boolean);
  
  const isComplete = hasTitle && hasStartDate && hasStartTime && hasEndDate && hasEndTime && hasPlatforms;

  // Copy function
  const copyToClipboard = async (text: string, label: string = 'Content'): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      trackConversion('code_copied');
      toast.success(`${label} copied!`);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Format date/time for display
  const formatDateTime = (): string => {
    if (!eventData.startDate) return 'Select date and time';
    
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
  };

  // Generate code function
  const getGeneratedCode = (): string => {
    if (!isComplete) return '<!-- Complete the form to generate code -->';
    
    const options: CodeGenerationOptions = {
      minified: isMinified,
      format: codeFormat,
      includeCss: true,
      includeJs: true
    };
    
    return generateCalendarCode(eventData, buttonData, 'button', options);
  };

  return (
    <div className="h-full">
      <div className="bg-white border rounded-lg h-full flex flex-col">
        {/* Live Preview Header Section */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 rounded-t-lg">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
              {isComplete && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Ready
                </span>
              )}
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="space-y-2">
                <div className="font-medium text-gray-900 truncate">
                  {eventData.title || 'Untitled Event'}
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  <span className="mr-2">📅</span>
                  <span>{formatDateTime()}</span>
                </div>
                {eventData.location && (
                  <div className="text-sm text-gray-600 flex items-center">
                    <span className="mr-2">📍</span>
                    <span className="truncate">{eventData.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content - No tabs, switches based on useCase prop */}
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
              {/* Email Links Preview */}
              {useCase === 'email-links' && (
                <EmailLinksPreview
                  eventData={eventData}
                  buttonData={buttonData}
                  calendarLinks={calendarLinks}
                  isComplete={isComplete}
                  selectedPlatforms={selectedPlatforms}
                  platformInfo={PLATFORM_INFO}
                  onCopy={copyToClipboard}
                />
              )}

              {/* Button Widget Preview */}
              {useCase === 'button-widget' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add to Calendar - Button</h3>
                  <p className="text-sm text-gray-600 mb-4">Interactive dropdown button for websites</p>
                  
                  {/* Sub-tabs for button widget - Updated to emerald */}
                  <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                      {['button', 'links', 'code'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab
                              ? 'border-emerald-500 text-emerald-600'
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
                              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                              style={{ backgroundColor: buttonData.colorTheme || '#10b981' }}
                            >
                              {buttonData.showIcons !== false && <span>📅</span>}
                              <span>Add to Calendar</span>
                              <span className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                                ▼
                              </span>
                            </button>
                            
                            {dropdownOpen && (
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {selectedPlatforms.map((platform) => (
                                  <button
                                    key={platform}
                                    onClick={() => {
                                      const platformKey = platform as keyof typeof calendarLinks;
                                      window.open(calendarLinks[platformKey], '_blank');
                                      toast.success(`Opening ${PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].name}!`);
                                      setDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                  >
                                    <Image 
                                      src={PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].logo} 
                                      alt={PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].name}
                                      width={16}
                                      height={16}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-gray-700">{PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center">Click the button to see the dropdown</p>
                    </div>
                  )}

                  {/* Links Tab */}
                  {activeTab === 'links' && (
                    <div className="space-y-4">
                      {selectedPlatforms.map((platform) => (
                        <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <Image 
                              src={PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].logo} 
                              alt={PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].name}
                              width={16}
                              height={16}
                              className="w-4 h-4 mr-2"
                            />
                            <span className="font-medium">{PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].name}</span>
                          </div>
                          <button
                            onClick={() => {
                              const platformKey = platform as keyof typeof calendarLinks;
                              copyToClipboard(calendarLinks[platformKey] || '', `${PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].name} URL`);
                            }}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          >
                            Copy Link
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Code Tab */}
                  {activeTab === 'code' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Generated Code</h4>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={isMinified}
                              onChange={(e) => setIsMinified(e.target.checked)}
                              className="rounded"
                            />
                            Minified
                          </label>
                          <select
                            value={codeFormat}
                            onChange={(e) => {
                            const value = e.target.value as 'html' | 'react' | 'css' | 'js';
                            setCodeFormat(value);
                          }}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="html">HTML</option>
                            <option value="react">React</option>
                            <option value="css">CSS</option>
                            <option value="js">JavaScript</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900 rounded-lg p-4">
                        <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
                          {getGeneratedCode()}
                        </pre>
                      </div>
                      
                      <button
                        onClick={() => copyToClipboard(getGeneratedCode(), 'Code')}
                        className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Copy Code
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Direct Links Preview */}
              {useCase === 'direct-links' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Direct Links</h3>
                  <p className="text-sm text-gray-600 mb-4">Raw calendar URLs for advanced integrations</p>
                  
                  {selectedPlatforms.map((platform) => (
                    <div key={platform} className="space-y-2">
                      <div className="flex items-center">
                        <Image 
                          src={PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].logo} 
                          alt={PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].name}
                          width={16}
                          height={16}
                          className="w-4 h-4 mr-2"
                        />
                        <span className="font-medium text-gray-900">{PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].name}</span>
                      </div>
                      
                      <div className="bg-gray-900 rounded p-3">
                        <pre className="text-xs text-emerald-400 font-mono break-all whitespace-pre-wrap">
                          {calendarLinks[platform as keyof typeof calendarLinks]}
                        </pre>
                      </div>
                      
                      <button
                        onClick={() => {
                          const platformKey = platform as keyof typeof calendarLinks;
                          copyToClipboard(calendarLinks[platformKey] || '', `${PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].name} URL`);
                        }}
                        className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        Copy {PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO].name} URL
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Event Page Preview */}
              {useCase === 'event-page' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Landing Page</h3>
                  <p className="text-sm text-gray-600 mb-4">Full page layout for event promotion</p>
                  
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-6">
                    <div className="text-center space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900">{eventData.title}</h2>
                      <p className="text-lg text-gray-600">{formatDateTime()}</p>
                      {eventData.location && (
                        <p className="text-gray-600">📍 {eventData.location}</p>
                      )}
                      {eventData.description && (
                        <p className="text-gray-700 mt-4">{eventData.description}</p>
                      )}
                      
                      <div className="pt-6">
                        <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm">
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
}