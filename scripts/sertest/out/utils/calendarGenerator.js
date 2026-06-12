"use strict";
/**
 * Calendar link generator.
 *
 * Times are converted from the event's wall-clock time in its selected IANA
 * timezone to real UTC instants (src/utils/datetime.ts), and the Apple link
 * is built by the RFC 5545 serializer (src/utils/ics.ts). This replaces the
 * previous floating-local-time output and the Outlook "local time stamped as
 * UTC" bug (studio review finding S3).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCalendarCode = exports.generateDirectLinks = exports.generateButtonCode = exports.generateCalendarLinks = void 0;
const escape_1 = require("./escape");
const datetime_1 = require("./datetime");
const ics_1 = require("./ics");
const encodeParam = (str) => encodeURIComponent(str || '');
const generateCalendarLinks = (eventData) => {
    const { title = '', description = '', location = '', startDate, startTime = '10:00', endDate, endTime = '11:00', timezone, isAllDay = false } = eventData;
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
    const links = {};
    if (isAllDay) {
        // All-day: date-only values with an EXCLUSIVE end date across providers.
        const gStart = (0, datetime_1.toDateBasic)(startDate);
        const gEndExclusive = (0, datetime_1.toDateBasic)((0, datetime_1.nextDay)(finalEndDate));
        links.google = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
            `&text=${encodeParam(title)}` +
            `&dates=${gStart}/${gEndExclusive}` +
            `&details=${encodeParam(description)}` +
            `&location=${encodeParam(location)}`;
        const outlookAllDay = (base) => `${base}?` +
            `subject=${encodeParam(title)}` +
            `&startdt=${startDate}` +
            `&enddt=${(0, datetime_1.nextDay)(finalEndDate)}` +
            `&allday=true` +
            `&body=${encodeParam(description)}` +
            `&location=${encodeParam(location)}`;
        links.outlook = outlookAllDay('https://outlook.live.com/calendar/0/deeplink/compose');
        links.office365 = outlookAllDay('https://outlook.office.com/calendar/0/deeplink/compose');
        links.outlookcom = links.outlook;
        links.yahoo = `https://calendar.yahoo.com/?` +
            `v=60` +
            `&title=${encodeParam(title)}` +
            `&st=${gStart}` +
            `&et=${gEndExclusive}` +
            `&dur=allday` +
            `&desc=${encodeParam(description)}` +
            `&in_loc=${encodeParam(location)}`;
    }
    else {
        const startUtc = (0, datetime_1.zonedWallTimeToUtc)(startDate, startTime, timezone);
        const endUtc = (0, datetime_1.zonedWallTimeToUtc)(finalEndDate, finalEndTime, timezone);
        const gStart = (0, datetime_1.toUtcBasic)(startUtc);
        const gEnd = (0, datetime_1.toUtcBasic)(endUtc);
        // ctz sets the display timezone Google shows before saving
        const ctz = timezone && timezone !== 'UTC' ? `&ctz=${encodeParam(timezone)}` : '';
        links.google = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
            `&text=${encodeParam(title)}` +
            `&dates=${gStart}/${gEnd}` +
            ctz +
            `&details=${encodeParam(description)}` +
            `&location=${encodeParam(location)}`;
        const outlookTimed = (base) => `${base}?` +
            `subject=${encodeParam(title)}` +
            `&startdt=${encodeParam((0, datetime_1.toUtcIso)(startUtc))}` +
            `&enddt=${encodeParam((0, datetime_1.toUtcIso)(endUtc))}` +
            `&body=${encodeParam(description)}` +
            `&location=${encodeParam(location)}`;
        links.outlook = outlookTimed('https://outlook.live.com/calendar/0/deeplink/compose');
        links.office365 = outlookTimed('https://outlook.office.com/calendar/0/deeplink/compose');
        links.outlookcom = links.outlook;
        links.yahoo = `https://calendar.yahoo.com/?` +
            `v=60` +
            `&title=${encodeParam(title)}` +
            `&st=${gStart}` +
            `&et=${gEnd}` +
            `&desc=${encodeParam(description)}` +
            `&in_loc=${encodeParam(location)}`;
    }
    // Apple Calendar: RFC 5545-compliant ICS (escaped text, folded lines,
    // crypto-random UID, UTC times / VALUE=DATE all-day with exclusive end).
    const icsContent = (0, ics_1.buildIcsCalendar)({
        title,
        description,
        location,
        startDate,
        startTime,
        endDate: finalEndDate,
        endTime: finalEndTime,
        timezone,
        isAllDay
    });
    links.apple = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
    return links;
};
exports.generateCalendarLinks = generateCalendarLinks;
/**
 * Calculate contrast color for accessibility
 */
const getContrastColor = (hexColor) => {
    // Remove # if present
    const color = hexColor.replace('#', '');
    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    // WCAG relative luminance formula
    const sRGB = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    // Return dark text for light backgrounds, light text for dark backgrounds
    return luminance > 0.179 ? '#374151' : '#FFFFFF';
};
/**
 * Generate CSS styles
 */
const generateButtonCSS = (buttonData, minified = false) => {
    const { buttonSize = 'medium', colorTheme = '#4D90FF', buttonStyle = 'standard' } = buttonData;
    const textColor = buttonData.textColor || getContrastColor(colorTheme);
    const sizeStyles = {
        small: { padding: '8px 12px', fontSize: '14px' },
        medium: { padding: '10px 16px', fontSize: '16px' },
        large: { padding: '12px 20px', fontSize: '18px' }
    };
    const size = sizeStyles[buttonSize] || sizeStyles.medium;
    // Generate style-specific CSS
    const getStyleCSS = () => {
        switch (buttonStyle) {
            case 'minimal':
                return `
  background-color: transparent;
  color: ${colorTheme};
  border: 1px solid ${colorTheme};`;
            case 'pill':
                return `
  background-color: ${colorTheme};
  color: ${textColor};
  border-radius: 25px;
  border: none;`;
            default: // standard
                return `
  background-color: ${colorTheme};
  color: ${textColor};
  border: none;`;
        }
    };
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
  border-radius: ${buttonStyle === 'pill' ? '25px' : '6px'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;${getStyleCSS()}
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
 * Generate JavaScript
 */
const generateButtonJS = (minified = false) => {
    const js = `
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.punktual-button').forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const dropdown = this.parentNode.querySelector('.punktual-dropdown');
      if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      }
    });
  });

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
/**
 * Generate HTML button code
 */
const generateButtonCode = (eventData, buttonData, options = {}) => {
    const { minified = false, includeCss = true, includeJs = true, format = 'html' } = options;
    const links = (0, exports.generateCalendarLinks)(eventData);
    const { selectedPlatforms } = buttonData;
    const activePlatforms = Object.keys(selectedPlatforms || {})
        .filter(platform => selectedPlatforms?.[platform])
        .map(platform => ({
        id: platform,
        name: getPlatformDisplayName(platform),
        url: links[platform] || ''
    }));
    if (activePlatforms.length === 0) {
        return '<!-- Please select at least one calendar platform -->';
    }
    const buttonId = `punktual-${Date.now()}`;
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
exports.generateButtonCode = generateButtonCode;
const generateHTMLCode = (activePlatforms, buttonId, buttonData, options) => {
    const { minified = false, includeCss = true, includeJs = true } = options;
    const dropdownItems = activePlatforms.map(platform => `<a href="${(0, escape_1.escapeHtml)(platform.url)}" target="_blank" class="punktual-dropdown-item">${platform.name}</a>`).join(minified ? '' : '\n    ');
    let html = `<!-- Punktual Calendar Button -->
<div class="punktual-container">
  <button class="punktual-button" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
    📅 ${(0, escape_1.escapeHtml)(buttonData.customText || 'Add to Calendar')} ▼
  </button>
  <div class="punktual-dropdown">
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
const generateReactComponent = (eventData, buttonData, activePlatforms, minified = false) => {
    const colorTheme = buttonData.colorTheme || '#4D90FF';
    const textColor = buttonData.textColor || getContrastColor(colorTheme);
    const buttonStyle = buttonData.buttonStyle || 'standard';
    // Generate style-specific properties
    const getStyleProps = () => {
        switch (buttonStyle) {
            case 'minimal':
                return {
                    backgroundColor: 'transparent',
                    color: colorTheme,
                    border: `1px solid ${colorTheme}`,
                    borderRadius: '6px'
                };
            case 'pill':
                return {
                    backgroundColor: colorTheme,
                    color: textColor,
                    border: 'none',
                    borderRadius: '25px'
                };
            default: // standard
                return {
                    backgroundColor: colorTheme,
                    color: textColor,
                    border: 'none',
                    borderRadius: '6px'
                };
        }
    };
    const styleProps = getStyleProps();
    const component = `import React, { useState } from 'react';

const PunktualButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const platforms = ${JSON.stringify(activePlatforms, null, minified ? 0 : 2)};
  
  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '${buttonData.buttonSize === 'small' ? '8px 12px' : buttonData.buttonSize === 'large' ? '12px 20px' : '10px 16px'}',
    fontSize: '${buttonData.buttonSize === 'small' ? '14px' : buttonData.buttonSize === 'large' ? '18px' : '16px'}',
    fontWeight: 600,
    borderRadius: '${styleProps.borderRadius}',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    border: '${styleProps.border}',
    backgroundColor: '${styleProps.backgroundColor}',
    color: '${styleProps.color}'
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        style={buttonStyle}
        onClick={() => setIsOpen(!isOpen)}
      >
        {${JSON.stringify(`📅 ${buttonData.customText || 'Add to Calendar'} ▼`)}}
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
const generateDirectLinks = (eventData, buttonData, options = {}) => {
    const { minified = false } = options;
    const links = (0, exports.generateCalendarLinks)(eventData);
    const { selectedPlatforms } = buttonData;
    const activePlatforms = Object.keys(selectedPlatforms || {})
        .filter(platform => selectedPlatforms?.[platform])
        .map(platform => ({
        id: platform,
        name: getPlatformDisplayName(platform),
        url: links[platform] || ''
    }));
    if (activePlatforms.length === 0) {
        return '<!-- Please select at least one calendar platform -->';
    }
    const linkItems = activePlatforms.map(platform => `<li><a href="${(0, escape_1.escapeHtml)(platform.url)}" target="_blank">📅 ${(0, escape_1.escapeHtml)(buttonData.customText || `Add to ${platform.name}`)}</a></li>`).join(minified ? '' : '\n  ');
    let html = `<!-- Punktual Direct Links -->
<div>
  <p>Add "${(0, escape_1.escapeHtml)(eventData.title || '')}" to your calendar:</p>
  <ul>
    ${linkItems}
  </ul>
</div>`;
    if (minified) {
        html = html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
    }
    return html;
};
exports.generateDirectLinks = generateDirectLinks;
/**
 * Helper function to get platform display names
 */
function getPlatformDisplayName(platform) {
    const names = {
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
const generateCalendarCode = (eventData, buttonData, outputType = 'button', options = {}) => {
    if (!eventData.title || !eventData.startDate) {
        return '<!-- Please fill in the event title and date to generate code -->';
    }
    switch (outputType) {
        case 'button':
        case 'button-widget':
            return (0, exports.generateButtonCode)(eventData, buttonData, options);
        case 'links':
        case 'email-links':
        case 'direct':
        case 'direct-links':
            return (0, exports.generateDirectLinks)(eventData, buttonData, options);
        default:
            return (0, exports.generateButtonCode)(eventData, buttonData, options);
    }
};
exports.generateCalendarCode = generateCalendarCode;
