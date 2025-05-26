// src/components/EventCreator/DynamicPreview.jsx
'use client';

import { useState } from 'react';
import { useEventContext } from '../../contexts/EventContext';
import toast from 'react-hot-toast';

const DynamicPreview = () => {
  const { eventData, buttonData, generatedCode, calendarLinks } = useEventContext();
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check if event is complete
  const hasTitle = !!eventData.title?.trim();
  const hasStartDate = !!eventData.startDate;
  const hasStartTime = !!eventData.startTime;
  const hasEndDate = !!eventData.endDate;
  const hasEndTime = !!eventData.endTime;
  const hasPlatforms = Object.values(buttonData.selectedPlatforms || {}).some(Boolean);
  
  const isComplete = hasTitle && hasStartDate && hasStartTime && hasEndDate && hasEndTime && hasPlatforms;

  // Platform info with your existing images
  const platformInfo = {
    google: { name: 'Google Calendar', logo: '/icons/platforms/icon-google.svg' },
    apple: { name: 'Apple Calendar', logo: '/icons/platforms/icon-apple.svg' },
    outlook: { name: 'Outlook', logo: '/icons/platforms/icon-outlook.svg' },
    office365: { name: 'Office 365', logo: '/icons/platforms/icon-office365.svg' },
    yahoo: { name: 'Yahoo Calendar', logo: '/icons/platforms/icon-yahoo.svg' }
  };

  const selectedPlatforms = Object.keys(buttonData.selectedPlatforms || {})
    .filter(platform => buttonData.selectedPlatforms[platform]);

  // Copy function
  const copyToClipboard = async (text, label = 'Content') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  // Format date/time for display
  const formatDateTime = () => {
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b bg-white">
        <h2 className="text-base font-semibold text-gray-900">Live Preview</h2>
        <p className="text-xs text-gray-500 mt-1">
          See your calendar button in action
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {/* Event Summary */}
          <div className="bg-white rounded-lg border p-3 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Event Summary</h3>
            
            <div className="space-y-1">
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {eventData.title || 'Untitled Event'}
                </p>
              </div>
              
              <div className="flex items-center text-xs text-gray-600">
                <span className="mr-1">📅</span>
                <span>{formatDateTime()}</span>
              </div>
              
              {eventData.location && (
                <div className="flex items-center text-xs text-gray-600">
                  <span className="mr-1">📍</span>
                  <span className="truncate">{eventData.location}</span>
                </div>
              )}
              
              {eventData.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {eventData.description}
                </p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 px-3 py-2 text-xs font-medium ${
                  activeTab === 'preview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Button
              </button>
              <button
                onClick={() => setActiveTab('links')}
                className={`flex-1 px-3 py-2 text-xs font-medium ${
                  activeTab === 'links'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Links
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 px-3 py-2 text-xs font-medium ${
                  activeTab === 'code'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Code
              </button>
            </div>
            
            <div className="p-3">
              {/* Button Preview Tab */}
              {activeTab === 'preview' && (
                <div>
                  {!isComplete ? (
                    <div className="text-center py-6">
                      <div className="text-gray-400 mb-2">
                        <span className="text-2xl">📅</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Complete your event details to see the button preview
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Interactive Button</h4>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Live
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 text-center border">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            📅 Add to Calendar
                            <span className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </button>
                          
                          {dropdownOpen && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              {selectedPlatforms.map(platform => (
                                <button
                                  key={platform}
                                  onClick={() => {
                                    window.open(calendarLinks[platform], '_blank');
                                    toast.success(`Opening ${platformInfo[platform].name}!`);
                                    setDropdownOpen(false);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                                >
                                  <img 
                                    src={platformInfo[platform].logo} 
                                    alt={platformInfo[platform].name}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-xs">{platformInfo[platform].name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Click to test! Each platform opens the real calendar.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Direct Links Tab */}
              {activeTab === 'links' && (
                <div>
                  {!isComplete ? (
                    <div className="text-center py-6">
                      <div className="text-gray-400 mb-2">
                        <span className="text-2xl">🔗</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Complete your event to generate direct links
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Direct Links</h4>
                      
                      <div className="space-y-2">
                        {selectedPlatforms.map(platform => (
                          <div key={platform} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border">
                            <div className="flex items-center">
                              <img 
                                src={platformInfo[platform].logo} 
                                alt={platformInfo[platform].name}
                                className="w-4 h-4 mr-2"
                              />
                              <span className="text-xs font-medium text-gray-900">{platformInfo[platform].name}</span>
                            </div>
                            
                            <div className="flex gap-1">
                              <button
                                onClick={() => copyToClipboard(calendarLinks[platform], platformInfo[platform].name)}
                                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              >
                                {copied ? 'Copied!' : 'Copy'}
                              </button>
                              <button
                                onClick={() => window.open(calendarLinks[platform], '_blank')}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Open
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                          Perfect for emails and messages where HTML isn't supported.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Code Tab */}
              {activeTab === 'code' && (
                <div>
                  {!isComplete ? (
                    <div className="text-center py-6">
                      <div className="text-gray-400 mb-2">
                        <span className="text-2xl">💻</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Complete your event to generate the code
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Generated Code</h4>
                        <button
                          onClick={() => copyToClipboard(generatedCode, 'Code')}
                          className="inline-flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          📋 {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      
                      <div className="bg-gray-900 rounded-lg p-2 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-gray-100 whitespace-pre-wrap font-mono">
                          {generatedCode}
                        </pre>
                      </div>
                      
                      <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-1">✓</span>
                          <p className="text-xs text-green-800">
                            Ready to deploy! Paste this code into your website.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPreview;