/**
 * Enhanced calendar generator with minified/readable code options
 */

import type { EventData, ButtonData, CalendarLinks, CodeGenerationOptions, OutputType } from '@/types';

// Helper function to format date for different calendar platforms
const formatDateTime = (date: string, time?: string, isAllDay: boolean = false): string => {
  if (!date) return '';
  
  if (isAllDay) {
    return date.replace(/-/g, '');
  }
  
  if (!time) {
    time = '10:00';
  }
  
  const dateTime = `${date}T${time}:00`;
  return dateTime.replace(/[-:]/g, '');
};

const formatOutlookDateTime = (date: string, time?: string, isAllDay: boolean = false): string => {
  if (!date) return '';
  
  if (isAllDay) {
    return `${date}T00:00:00.000Z`;
  }
  
  if (!time) {
    time = '10:00';
  }
  
  return `${date}T${time}:00.000Z`;
};

const encodeParam = (str: string): string => encodeURIComponent(str || '');

/**
 * Generate individual calendar platform URLs
 */
export const generateCalendarLinks = (eventData: EventData): CalendarLinks => {
  const {
    title = '',
    description = '',
    location = '',
    startDate,
    startTime = '10:00',
    endDate,
    endTime = '11:00',
    isAllDay = false
  } = eventData;

  if (!startDate || !title) {
    return {
      google: '',
      apple: '',
      outlook: '',
      office365: '',
      outlookcom: '',
      yahoo: ''
    };
  }

  const finalEndDate = endDate || startDate;
  const finalEndTime = endTime || '11:00';
  const startDateTime = formatDateTime(startDate, startTime, isAllDay);
  const endDateTime = formatDateTime(finalEndDate, finalEndTime, isAllDay);
  
  const links: CalendarLinks = {};

  // Google Calendar
  links.google = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeParam(title)}` +
    `&dates=${startDateTime}/${endDateTime}` +
    `&details=${encodeParam(description)}` +
    `&location=${encodeParam(location)}`;

  // Apple Calendar (.ics file)
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Punktual//Punktual//EN
BEGIN:VEVENT
UID:${Date.now()}@punktual.co
DTSTAMP:${formatDateTime(new Date().toISOString().split('T')[0], new Date().toTimeString().slice(0, 5))}
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
  links.apple = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

  // Microsoft Outlook
  links.outlook = `https://outlook.live.com/calendar/0/deeplink/compose?` +
    `subject=${encodeParam(title)}` +
    `&startdt=${formatOutlookDateTime(startDate, startTime, isAllDay)}` +
    `&enddt=${formatOutlookDateTime(finalEndDate, finalEndTime, isAllDay)}` +
    `&body=${encodeParam(description)}` +
    `&location=${encodeParam(location)}`;

  // Office 365
  links.office365 = `https://outlook.office.com/calendar/0/deeplink/compose?` +
    `subject=${encodeParam(title)}` +
    `&startdt=${formatOutlookDateTime(startDate, startTime, isAllDay)}` +
    `&enddt=${formatOutlookDateTime(finalEndDate, finalEndTime, isAllDay)}` +
    `&body=${encodeParam(description)}` +
    `&location=${encodeParam(location)}`;

  links.outlookcom = links.outlook;

  // Yahoo Calendar
  const yahooStart = `${startDate}T${startTime || '10:00'}`;
  const yahooEnd = `${finalEndDate}T${finalEndTime || '11:00'}`;
  
  links.yahoo = `https://calendar.yahoo.com/?` +
    `v=60` +
    `&title=${encodeParam(title)}` +
    `&st=${yahooStart}` +
    `&et=${yahooEnd}` +
    `&desc=${encodeParam(description)}` +
    `&in_loc=${encodeParam(location)}`;

  return links;
};

/**
 * Generate CSS styles (separate from HTML)
 */
const generateButtonCSS = (buttonData: ButtonData, minified: boolean = false): string => {
  const { buttonSize = 'medium', colorScheme = '#4D90FF', textColor = '#FFFFFF', buttonStyle = 'standard' } = buttonData;
  
  const sizeStyles = {
    small: { padding: '8px 12px', fontSize: '14px' },
    medium: { padding: '10px 16px', fontSize: '16px' },
    large: { padding: '12px 20px', fontSize: '18px' }
  };

  const size = sizeStyles[buttonSize as keyof typeof sizeStyles] || sizeStyles.medium;

  const css = `
.punktual-container {
  position: relative;
  display: inline-block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.punktual-button {
  display: inline-flex;
  align-items: center;
  padding: ${size.padding};
  font-size: ${size.fontSize};
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  border: none;
  ${buttonStyle === 'outlined' ? 
    `background-color: transparent; color: ${colorScheme}; border: 2px solid ${colorScheme};` :
    `background-color: ${colorScheme}; color: ${textColor};`
  }
}

.punktual-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.punktual-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 200px;
  z-index: 1000;
  margin-top: 4px;
}

.punktual-dropdown-item {
  display: block;
  padding: 8px 16px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.punktual-dropdown-item:hover {
  background-color: #f5f5f5;
}`;

  if (minified) {
    return css.replace(/\s+/g, ' ').replace(/;\s*/g, ';').replace(/{\s*/g, '{').replace(/}\s*/g, '}').trim();
  }

  return css;
};

/**
 * Generate JavaScript (separate from HTML)
 */
const generateButtonJS = (minified: boolean = false): string => {
  const js = `
// Punktual Button Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Handle button clicks
  document.querySelectorAll('.punktual-button').forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const dropdown = this.parentNode.querySelector('.punktual-dropdown');
      if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.punktual-container')) {
      document.querySelectorAll('.punktual-dropdown').forEach(function(dropdown) {
        dropdown.style.display = 'none';
      });
    }
  });
});`;

  if (minified) {
    return js.replace(/\s+/g, ' ').replace(/;\s*/g, ';').replace(/{\s*/g, '{').replace(/}\s*/g, '}').trim();
  }

  return js;
};

interface PlatformInfo {
  id: string;
  name: string;
  url: string;
}

/**
 * Generate HTML button code
 */
export const generateButtonCode = (eventData: EventData, buttonData: ButtonData, options: CodeGenerationOptions = {}): string => {
  const { minified = false, includeCss = true, includeJs = true, format = 'html' } = options;
  
  const links = generateCalendarLinks(eventData);
  const { selectedPlatforms } = buttonData;
  
  const activePlatforms: PlatformInfo[] = Object.keys(selectedPlatforms || {})
    .filter(platform => selectedPlatforms?.[platform as keyof typeof selectedPlatforms])
    .map(platform => ({
      id: platform,
      name: getPlatformDisplayName(platform),
      url: links[platform as keyof CalendarLinks] || ''
    }));

  if (activePlatforms.length === 0) {
    return '<!-- Please select at least one calendar platform -->';
  }

  const buttonId = `punktual-${Date.now()}`;

  // Generate different formats
  switch (format) {
    case 'react':
      return generateReactComponent(eventData, buttonData, activePlatforms, minified);
    case 'css':
      return generateButtonCSS(buttonData, minified);
    case 'js':
      return generateButtonJS(minified);
    default:
      return generateHTMLCode(activePlatforms, buttonId, buttonData, { minified, includeCss, includeJs });
  }
};

interface HTMLCodeOptions {
  minified?: boolean;
  includeCss?: boolean;
  includeJs?: boolean;
}

/**
 * Generate HTML code
 */
const generateHTMLCode = (activePlatforms: PlatformInfo[], buttonId: string, buttonData: ButtonData, options: HTMLCodeOptions = {}): string => {
  const { minified = false, includeCss = true, includeJs = true } = options;

  const dropdownItems = activePlatforms.map(platform => 
    `<a href="${platform.url}" target="_blank" class="punktual-dropdown-item">${platform.name}</a>`
  ).join(minified ? '' : '\n    ');

  let html = `<!-- Punktual Calendar Button -->
<div class="punktual-container">
  <button id="${buttonId}" class="punktual-button">
    📅 Add to Calendar ▼
  </button>
  <div id="${buttonId}-dropdown" class="punktual-dropdown">
    ${dropdownItems}
  </div>
</div>`;

  if (includeCss) {
    html += `\n\n<style>\n${generateButtonCSS(buttonData, minified)}\n</style>`;
  }

  if (includeJs) {
    html += `\n\n<script>\n${generateButtonJS(minified)}\n</script>`;
  }

  if (minified) {
    html = html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
  }

  return html;
};

/**
 * Generate React component
 */
const generateReactComponent = (eventData: EventData, buttonData: ButtonData, activePlatforms: PlatformInfo[], minified: boolean = false): string => {
  const component = `import React, { useState } from 'react';

const PunktualButton = ({ eventData, buttonData }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const platforms = ${JSON.stringify(activePlatforms, null, minified ? 0 : 2)};
  
  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '${buttonData.buttonSize === 'small' ? '8px 12px' : buttonData.buttonSize === 'large' ? '12px 20px' : '10px 16px'}',
    fontSize: '${buttonData.buttonSize === 'small' ? '14px' : buttonData.buttonSize === 'large' ? '18px' : '16px'}',
    fontWeight: 600,
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    border: 'none',
    backgroundColor: '${buttonData.colorScheme || '#4D90FF'}',
    color: '${buttonData.textColor || '#FFFFFF'}'
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        style={buttonStyle}
        onClick={() => setIsOpen(!isOpen)}
      >
        📅 Add to Calendar ▼
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minWidth: '200px',
          zIndex: 1000,
          marginTop: '4px'
        }}>
          {platforms.map(platform => (
            <a 
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '8px 16px',
                textDecoration: 'none',
                color: '#333',
                fontSize: '14px'
              }}
              onClick={() => setIsOpen(false)}
            >
              {platform.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default PunktualButton;`;

  if (minified) {
    return component.replace(/\s+/g, ' ').replace(/;\s*/g, ';').trim();
  }

  return component;
};

/**
 * Generate direct links
 */
export const generateDirectLinks = (eventData: EventData, buttonData: ButtonData, options: CodeGenerationOptions = {}): string => {
  const { minified = false } = options;
  const links = generateCalendarLinks(eventData);
  const { selectedPlatforms } = buttonData;
  
  const activePlatforms: PlatformInfo[] = Object.keys(selectedPlatforms || {})
    .filter(platform => selectedPlatforms?.[platform as keyof typeof selectedPlatforms])
    .map(platform => ({
      id: platform,
      name: getPlatformDisplayName(platform),
      url: links[platform as keyof CalendarLinks] || ''
    }));

  if (activePlatforms.length === 0) {
    return '<!-- Please select at least one calendar platform -->';
  }

  const linkItems = activePlatforms.map(platform => 
    `<li><a href="${platform.url}" target="_blank">📅 Add to ${platform.name}</a></li>`
  ).join(minified ? '' : '\n  ');

  let html = `<!-- Punktual Direct Links -->
<div>
  <p>Add "${eventData.title}" to your calendar:</p>
  <ul>
    ${linkItems}
  </ul>
</div>`;

  if (minified) {
    html = html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
  }

  return html;
};

/**
 * Helper function to get platform display names
 */
function getPlatformDisplayName(platform: string): string {
  const names: Record<string, string> = {
    google: 'Google Calendar',
    apple: 'Apple Calendar',
    outlook: 'Microsoft Outlook', 
    office365: 'Office 365',
    outlookcom: 'Outlook.com',
    yahoo: 'Yahoo Calendar'
  };
  return names[platform] || platform;
}

/**
 * Main function to generate code based on output type and options
 */
export const generateCalendarCode = (eventData: EventData, buttonData: ButtonData, outputType: OutputType | string = 'button', options: CodeGenerationOptions = {}): string => {
  if (!eventData.title || !eventData.startDate) {
    return '<!-- Please fill in the event title and date to generate code -->';
  }

  switch (outputType) {
    case 'button':
      return generateButtonCode(eventData, buttonData, options);
    case 'links':
    case 'direct':
      return generateDirectLinks(eventData, buttonData, options);
    default:
      return generateButtonCode(eventData, buttonData, options);
  }
};