'use client';
import { useState } from 'react';
import { useEventContext } from '../../contexts/EventContext';
import { generateCalendarCode } from '../../utils/calendarGenerator';
import toast from 'react-hot-toast';

const DynamicPreview = () => {
  const { eventData, buttonData, calendarLinks } = useEventContext();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('button');
  const [isMinified, setIsMinified] = useState(false);
  const [codeFormat, setCodeFormat] = useState('html');
  const [selectedUseCase, setSelectedUseCase] = useState('email-links');
  
  // Use case options in new order
  const useCaseOptions = [
    { id: 'email-links', label: 'Add to Calendar - Links' },
    { id: 'button-widget', label: 'Add to Calendar - Button' },
    { id: 'direct-links', label: 'Direct Links' },
    { id: 'event-page', label: 'Event Landing Page' }
  ];
  
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

  // Generate code based on current settings
  const getGeneratedCode = () => {
    if (!isComplete) return '<!-- Complete the form to generate code -->';
    
    const options = {
      minified: isMinified,
      format: codeFormat,
      includeCss: true,
      includeJs: true
    };
    
    return generateCalendarCode(eventData, buttonData, 'button', options);
  };

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
      {/* Event Summary */}
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

      {/* Main Preview Panel */}
      <div className="bg-white border rounded-lg flex-1 flex flex-col">
        {/* Segmented Control Header */}
        <div className="p-4 border-b">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            {useCaseOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedUseCase(option.id)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  selectedUseCase === option.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-4 flex-1">
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
              {/* Add to Calendar - Links */}
              {selectedUseCase === 'email-links' && (
                <div className="space-y-4">
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
                </div>
              )}

              {/* Add to Calendar - Button */}
              {selectedUseCase === 'button-widget' && (
                <div>
                  {/* Tabs */}
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

                  {/* Button Tab */}
                  {activeTab === 'button' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-6 border">
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
                      </div>
                    </div>
                  )}

                  {/* Links Tab */}
                  {activeTab === 'links' && (
                    <div className="space-y-4">
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

                  {/* Code Tab */}
                  {activeTab === 'code' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Generated Code</h3>
                        <div className="flex items-center gap-3">
                          <select
                            value={codeFormat}
                            onChange={(e) => setCodeFormat(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded"
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
                              className="w-3 h-3"
                            />
                            <span>Minified</span>
                          </label>
                          
                          <button
                            onClick={() => copyToClipboard(getGeneratedCode(), 'Code')}
                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
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

              {/* Direct Links */}
              {selectedUseCase === 'direct-links' && (
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
              )}

              {/* Event Landing Page */}
              {selectedUseCase === 'event-page' && (
                <div className="space-y-4">
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