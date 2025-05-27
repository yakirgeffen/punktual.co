'use client';

import { useState } from 'react';
import { useEventContext } from '../../contexts/EventContext';
import toast from 'react-hot-toast';

const DynamicPreview = ({ useCase = 'button-widget' }) => {
  const { eventData, buttonData, generatedCode, calendarLinks } = useEventContext();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('button');

  // Check if event is complete
  const hasTitle = !!eventData.title?.trim();
  const hasStartDate = !!eventData.startDate;
  const hasStartTime = !!eventData.startTime;
  const hasEndDate = !!eventData.endDate;
  const hasEndTime = !!eventData.endTime;
  const hasPlatforms = Object.values(buttonData.selectedPlatforms || {}).some(Boolean);
  
  const isComplete = hasTitle && hasStartDate && hasStartTime && hasEndDate && hasEndTime && hasPlatforms;

  // Platform info
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
    <div className="h-full flex flex-col space-y-4">
      {/* Compact Header & Summary */}
      <div className="bg-white border rounded-lg p-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
            {isComplete && (
              <span className="text-xs text-green-600 font-medium">Ready</span>
            )}
          </div>
          
          <div className="text-sm">
            <div className="font-medium text-gray-900 truncate">
              {eventData.title || 'Untitled Event'}
            </div>
            <div className="text-xs text-gray-600 flex items-center mt-1">
              <span className="mr-1">📅</span>
              <span>{formatDateTime()}</span>
            </div>
            {eventData.location && (
              <div className="text-xs text-gray-600 flex items-center">
                <span className="mr-1">📍</span>
                <span className="truncate">{eventData.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Use Case Specific Preview */}
      <div className="bg-white border rounded-lg p-4 flex-1">
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
            {/* Event Page Use Case */}
            {useCase === 'event-page' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">🌐 Event Page Preview</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Hosted Page
                  </span>
                </div>
                
                <div className="bg-white border rounded-lg p-6 shadow-sm">
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
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        📅 Add to My Calendar
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Hosted Event Page</span> - A beautiful, standalone event page that you can share via link. Perfect for marketing campaigns and social media.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Button Widget Use Case */}
            {useCase === 'button-widget' && (
              <div>
                {/* Custom Tabs */}
                <div className="border-b border-gray-200 mb-4">
                  <nav className="-mb-px flex space-x-8">
                    {['button', 'links', 'code'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
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

                {/* Tab Content */}
                {activeTab === 'button' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">🔘 Interactive Button</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Live
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 border">
                      {buttonData.buttonLayout === 'individual' ? (
                        // Individual Platform Buttons
                        <div className="space-y-3">
                          <p className="text-center text-sm text-gray-600 mb-4">Individual Platform Buttons</p>
                          <div className="flex flex-col gap-2">
                            {selectedPlatforms.map(platform => (
                              <button
                                key={platform}
                                onClick={() => {
                                  window.open(calendarLinks[platform], '_blank');
                                  toast.success(`Opening ${platformInfo[platform].name}!`);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm w-full"
                                style={{ backgroundColor: buttonData.colorScheme || '#4D90FF' }}
                              >
                                {buttonData.showIcons !== false && (
                                  <img 
                                    src={platformInfo[platform].logo} 
                                    alt={platformInfo[platform].name}
                                    className="w-4 h-4"
                                  />
                                )}
                                <span>Add to {platformInfo[platform].name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        // Single Dropdown Button
                        <div className="text-center">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setDropdownOpen(!dropdownOpen)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                              style={{ backgroundColor: buttonData.colorScheme || '#4D90FF' }}
                            >
                              {buttonData.showIcons !== false && <span>📅</span>}
                              <span>Add to Calendar</span>
                              <span className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                                ▼
                              </span>
                            </button>
                            
                            {dropdownOpen && (
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {selectedPlatforms.map(platform => (
                                  <button
                                    key={platform}
                                    onClick={() => {
                                      window.open(calendarLinks[platform], '_blank');
                                      toast.success(`Opening ${platformInfo[platform].name}!`);
                                      setDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                                  >
                                    <img 
                                      src={platformInfo[platform].logo} 
                                      alt={platformInfo[platform].name}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-gray-700">{platformInfo[platform].name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-800">
                            <span className="font-medium">
                              {buttonData.buttonLayout === 'individual' ? "Individual Platform Buttons" : "Interactive Widget"}
                            </span> - {buttonData.buttonLayout === 'individual' 
                              ? "Each platform gets its own button - the most popular choice for maximum conversion rates."
                              : "Embed this button on your website. Users can add events directly to their preferred calendar."
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'links' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Direct Links</h3>
                    
                    <div className="space-y-3">
                      {selectedPlatforms.map(platform => (
                        <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center">
                            <img 
                              src={platformInfo[platform].logo} 
                              alt={platformInfo[platform].name}
                              className="w-5 h-5 mr-3"
                            />
                            <span className="font-medium text-gray-900">{platformInfo[platform].name}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => copyToClipboard(calendarLinks[platform], platformInfo[platform].name)}
                              className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                              {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                              onClick={() => window.open(calendarLinks[platform], '_blank')}
                              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Generated Code</h3>
                      <button
                        onClick={() => copyToClipboard(generatedCode, 'Code')}
                        className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                      >
                        📋 {copied ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <pre className="text-sm text-gray-100 whitespace-pre-wrap font-mono">
                        {generatedCode}
                      </pre>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-800">
                            <span className="font-medium">Ready to Deploy</span> - Paste this code into your website to add the calendar button functionality.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Email Links Use Case */}
            {useCase === 'email-links' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">📧 Email-Friendly Links</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Email Ready
                  </span>
                </div>
                
                <div className="space-y-3">
                  {selectedPlatforms.map(platform => (
                    <div key={platform} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <img 
                            src={platformInfo[platform].logo} 
                            alt={platformInfo[platform].name}
                            className="w-5 h-5 mr-3"
                          />
                          <span className="font-medium text-gray-900">{platformInfo[platform].name}</span>
                        </div>
                        
                        <button
                          onClick={() => copyToClipboard(calendarLinks[platform], platformInfo[platform].name)}
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Copy Link
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded border break-all">
                        {calendarLinks[platform]}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Perfect for Email Campaigns</span> - Use these direct links in emails, newsletters, and text messages where HTML isn't supported.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Direct Links Use Case */}
            {useCase === 'direct-links' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">🔗 Raw Platform URLs</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Developer
                  </span>
                </div>
                
                <div className="space-y-4">
                  {selectedPlatforms.map(platform => (
                    <div key={platform} className="space-y-2">
                      <div className="flex items-center">
                        <img 
                          src={platformInfo[platform].logo} 
                          alt={platformInfo[platform].name}
                          className="w-4 h-4 mr-2"
                        />
                        <span className="font-medium text-gray-900">{platformInfo[platform].name}</span>
                      </div>
                      
                      <div className="bg-gray-900 rounded p-3">
                        <pre className="text-xs text-green-400 font-mono break-all whitespace-pre-wrap">
                          {calendarLinks[platform]}
                        </pre>
                      </div>
                      
                      <button
                        onClick={() => copyToClipboard(calendarLinks[platform], platformInfo[platform].name)}
                        className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Copy {platformInfo[platform].name} URL
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">For Custom Integration</span> - Raw URLs for developers building custom calendar integration solutions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicPreview;
