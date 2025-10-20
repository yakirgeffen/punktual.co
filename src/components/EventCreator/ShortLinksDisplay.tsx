/**
 * Enhanced Links Display Component
 * Shows both original and short links with copy functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useEventContext } from '@/contexts/EventContext';
import { isShortLink, extractShortId } from '@/utils/shortLinks';

interface ShortLinksDisplayProps {
  className?: string;
}

const ShortLinksDisplay: React.FC<ShortLinksDisplayProps> = ({ className = '' }) => {
  const { buttonData, calendarLinks, savedShortLinks } = useEventContext();
  const [displayLinks, setDisplayLinks] = useState(calendarLinks);
  const [copied, setCopied] = useState<string | null>(null);

  // Platform info
  const platformInfo: Record<string, { name: string; logo: string }> = {
    google: { name: 'Google Calendar', logo: '/icons/platforms/icon-google.svg' },
    apple: { name: 'Apple Calendar', logo: '/icons/platforms/icon-apple.svg' },
    outlook: { name: 'Outlook', logo: '/icons/platforms/icon-outlook.svg' },
    office365: { name: 'Office 365', logo: '/icons/platforms/icon-office365.svg' },
    outlookcom: { name: 'Outlook.com', logo: '/icons/platforms/icon-outlook.svg' },
    yahoo: { name: 'Yahoo Calendar', logo: '/icons/platforms/icon-yahoo.svg' }
  };

  // Update display links when calendar links or saved short links change
  useEffect(() => {
    setDisplayLinks(savedShortLinks || calendarLinks);
  }, [calendarLinks, savedShortLinks]);

  // Copy function
  const copyToClipboard = async (text: string, platform: string) => {
    if (!text) {
      toast.error('Nothing to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(platform);
      toast.success(`${platformInfo[platform]?.name || platform} link copied!`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Get selected platforms
  const selectedPlatforms = Object.keys(buttonData?.selectedPlatforms || {})
    .filter(platform => buttonData?.selectedPlatforms?.[platform as keyof typeof buttonData.selectedPlatforms]);

  if (selectedPlatforms.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <div className="text-gray-400 mb-2">
          <span className="text-2xl">🔗</span>
        </div>
        <p className="text-sm text-gray-600">Select calendar platforms to see links</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Calendar Links</h4>
            <p className="text-xs text-gray-600 mt-1">
              {savedShortLinks ? 'Short links for easy sharing' : 'Direct calendar platform links'}
            </p>
          </div>
        </div>
      </div>

      {/* Links List */}
      <div className="p-4 space-y-3">
        {selectedPlatforms.map(platform => {
          const info = platformInfo[platform] || { 
            name: platform.charAt(0).toUpperCase() + platform.slice(1), 
            logo: '/icons/platforms/icon-calendar.svg' 
          };
          const link = displayLinks?.[platform as keyof typeof displayLinks] || '';
          const isShort = isShortLink(link);
          const shortId = isShort ? extractShortId(link) : null;

          return (
            <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center min-w-0 flex-1">
                <Image 
                  src={info.logo} 
                  alt={info.name}
                  width={20}
                  height={20}
                  className="mr-3 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/icons/platforms/icon-calendar.svg';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{info.name}</span>
                    {isShort && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                        Short
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-mono truncate mt-1">
                    {link ? (
                      isShort ? `punktual.co/eventid=${shortId}` : new URL(link).hostname
                    ) : 'No link generated'}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-3">
                <button
                  onClick={() => copyToClipboard(link, platform)}
                  disabled={!link}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    copied === platform
                      ? 'text-emerald-700 bg-emerald-100 border border-emerald-200'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {copied === platform ? '✓' : '📋'}
                </button>
                <button
                  onClick={() => link && window.open(link, '_blank')}
                  disabled={!link}
                  className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Open
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats footer for short links */}
      {displayLinks && Object.values(displayLinks).some(link => link && isShortLink(link)) && (
        <div className="border-t border-gray-200 p-3 bg-emerald-50">
          <div className="text-xs text-emerald-700 text-center">
            ✨ Short links include click tracking and analytics
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortLinksDisplay;
