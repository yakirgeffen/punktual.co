/**
 * EmailLinksPreview.tsx - Email-ready calendar solutions
 * Provides platform links and embeddable buttons for email campaigns
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { 
  EmailLinksPreviewProps, 
  EmailFormat, 
  EmailFormatOption 
} from '@/types/preview';

const EMAIL_FORMAT_OPTIONS: EmailFormatOption[] = [
  { 
    id: 'platform-links', 
    label: 'Platform Links', 
    description: 'Individual calendar platform links',
    icon: '🔗'
  },
  { 
    id: 'button-embed', 
    label: 'Calendar Button', 
    description: 'Embeddable add to calendar button',
    icon: '🔘'
  }
];

const INTEGRATION_PLATFORMS = [
  'MailChimp', 'HubSpot', 'Marketo', 'Constant Contact', 'ActiveCampaign'
];

export default function EmailLinksPreview({
  eventData,
  buttonData,
  calendarLinks,
  selectedPlatforms,
  platformInfo,
  onCopy
}: EmailLinksPreviewProps) {
  const [emailFormat, setEmailFormat] = useState<EmailFormat>('platform-links');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async (): Promise<void> => {
    const content = getEmailContent();
    await onCopy(content, 'Email content');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEmailContent = (): string => {
    switch (emailFormat) {
      case 'platform-links':
        return generatePlatformLinksText();
      case 'button-embed':
        return generateButtonEmbedCode();
      default:
        return '';
    }
  };

  const generatePlatformLinksText = (): string => {
    let content = `Add "${eventData.title}" to your calendar:\n\n`;
    
    selectedPlatforms.forEach(platform => {
      const platformName = platformInfo[platform]?.name || platform;
      const platformUrl = calendarLinks[platform as keyof typeof calendarLinks];
      if (platformUrl) {
        content += `📅 ${platformName}: ${platformUrl}\n`;
      }
    });
    
    content += `\n---\nPowered by Punktual`;
    return content;
  };

  const generateButtonEmbedCode = (): string => {
    const buttonStyle = `
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background-color: ${buttonData.colorScheme || '#4D90FF'};
      color: ${buttonData.textColor || '#FFFFFF'};
      border: none;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    `.replace(/\s+/g, ' ').trim();

    let htmlCode = `<!-- Punktual Add to Calendar Button -->\n`;
    htmlCode += `<div style="text-align: center; margin: 20px 0;">\n`;
    
    if (selectedPlatforms.length === 1) {
      // Single platform - direct link
      const platform = selectedPlatforms[0];
      const platformUrl = calendarLinks[platform as keyof typeof calendarLinks];
      htmlCode += `  <a href="${platformUrl}" target="_blank" style="${buttonStyle}">\n`;
      htmlCode += `    ${buttonData.showIcons !== false ? '📅 ' : ''}Add to Calendar\n`;
      htmlCode += `  </a>\n`;
    } else {
      // Multiple platforms - dropdown simulation
      htmlCode += `  <div style="position: relative; display: inline-block;">\n`;
      htmlCode += `    <button style="${buttonStyle}" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">\n`;
      htmlCode += `      ${buttonData.showIcons !== false ? '📅 ' : ''}Add to Calendar ▼\n`;
      htmlCode += `    </button>\n`;
      htmlCode += `    <div style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ddd; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 200px; z-index: 1000; margin-top: 4px;">\n`;
      
      selectedPlatforms.forEach(platform => {
        const platformUrl = calendarLinks[platform as keyof typeof calendarLinks];
        const platformName = platformInfo[platform]?.name || platform;
        if (platformUrl) {
          htmlCode += `      <a href="${platformUrl}" target="_blank" style="display: block; padding: 8px 16px; text-decoration: none; color: #333; font-size: 14px; border-bottom: 1px solid #eee;">${platformName}</a>\n`;
        }
      });
      
      htmlCode += `    </div>\n`;
      htmlCode += `  </div>\n`;
    }
    
    htmlCode += `</div>\n`;
    htmlCode += `<!-- End Punktual Button -->`;
    
    return htmlCode;
  };

  const renderPreviewContent = () => {
    if (emailFormat === 'platform-links') {
      return (
        <div className="space-y-2">
          <div className="font-medium text-gray-900">
            Add &quot;{eventData.title}&quot; to your calendar:
          </div>
          <div className="space-y-1">
            {selectedPlatforms.map(platform => (
              <div key={platform} className="flex items-center space-x-2">
                <Image
                  src={platformInfo[platform]?.logo || '/placeholder.png'}
                  alt={platformInfo[platform]?.name || 'Platform logo'}
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                <span className="text-blue-600 underline">
                  {platformInfo[platform]?.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (emailFormat === 'button-embed') {
      return (
        <div className="text-center">
          <button 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: buttonData.colorScheme || '#4D90FF',
              color: buttonData.textColor || '#FFFFFF'
            }}
          >
            {buttonData.showIcons !== false && <span>📅</span>}
            <span>Add to Calendar</span>
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Embeddable HTML button for emails
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Add to Calendar - Email Links
        </h3>
        <p className="text-sm text-gray-600">
          Email-ready solutions for campaigns and newsletters
        </p>
      </div>

      {/* Format Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Choose Email Format
        </label>
        <div className="grid grid-cols-1 gap-3">
          {EMAIL_FORMAT_OPTIONS.map((format) => (
            <button
              key={format.id}
              onClick={() => setEmailFormat(format.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                emailFormat === format.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl">{format.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{format.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Generated Content</h4>
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
          <div className="text-sm">
            {renderPreviewContent()}
          </div>
        </div>

        {/* Integration Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">💡</span>
            <div>
              <h5 className="font-medium text-blue-900 mb-1">Works great with:</h5>
              <div className="flex flex-wrap gap-2 text-sm">
                {INTEGRATION_PLATFORMS.map((platform, index) => (
                  <span key={platform} className="inline-flex items-center">
                    <span className="bg-white px-2 py-1 rounded text-blue-800 font-medium">
                      {platform}
                    </span>
                    {index < INTEGRATION_PLATFORMS.length - 1 && (
                      <span className="mx-1 text-blue-600">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}