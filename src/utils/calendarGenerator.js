// src/utils/calendarGenerator.js - FIXED VERSION

/**
 * Generates calendar links and HTML code for events
 */

// Helper function to format date for different calendar platforms
const formatDateTime = (date, time, isAllDay = false) => {
  if (!date) return '';
  
  if (isAllDay) {
    return date.replace(/-/g, '');
  }
  
  if (!time) {
    // Default to 10:00 AM if no time provided
    time = '10:00';
  }
  
  const dateTime = `${date}T${time}:00`;
  return dateTime.replace(/[-:]/g, '');
};

// Helper function to format date for Outlook (different format)
const formatOutlookDateTime = (date, time, isAllDay = false) => {
  if (!date) return '';
  
  if (isAllDay) {
    return `${date}T00:00:00.000Z`;
  }
  
  if (!time) {
    time = '10:00';
  }
  
  return `${date}T${time}:00.000Z`;
};

// Helper function to encode URL parameters
const encodeParam = (str) => encodeURIComponent(str || '');

/**
 * Generate individual calendar platform URLs
 */
export const generateCalendarLinks = (eventData) => {
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

  // Ensure we have required data
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
  
  const links = {};

  // Google Calendar - Fixed format
  links.google = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeParam(title)}` +
    `&dates=${startDateTime}/${endDateTime}` +
    `&details=${encodeParam(description)}` +
    `&location=${encodeParam(location)}`;

  // Apple Calendar (.ics file) - Fixed format
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EasyCal//EasyCal//EN
BEGIN:VEVENT
UID:${Date.now()}@easycal.app
DTSTAMP:${formatDateTime(new Date().toISOString().split('T')[0], new Date().toTimeString().slice(0, 5))}
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

  links.apple = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

  // Microsoft Outlook - Fixed format
  links.outlook = `https://outlook.live.com/calendar/0/deeplink/compose?` +
    `subject=${encodeParam(title)}` +
    `&startdt=${formatOutlookDateTime(startDate, startTime, isAllDay)}` +
    `&enddt=${formatOutlookDateTime(finalEndDate, finalEndTime, isAllDay)}` +
    `&body=${encodeParam(description)}` +
    `&location=${encodeParam(location)}`;

  // Office 365 - Fixed format
  links.office365 = `https://outlook.office.com/calendar/0/deeplink/compose?` +
    `subject=${encodeParam(title)}` +
    `&startdt=${formatOutlookDateTime(startDate, startTime, isAllDay)}` +
    `&enddt=${formatOutlookDateTime(finalEndDate, finalEndTime, isAllDay)}` +
    `&body=${encodeParam(description)}` +
    `&location=${encodeParam(location)}`;

  // Outlook.com (same as outlook)
  links.outlookcom = links.outlook;

  // Yahoo Calendar - Fixed format
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
 * Generate HTML code for calendar button
 */
export const generateButtonCode = (eventData, buttonData) => {
  const links = generateCalendarLinks(eventData);
  const { selectedPlatforms, buttonStyle, buttonSize, colorScheme, textColor } = buttonData;
  
  // Filter selected platforms
  const activePlatforms = Object.keys(selectedPlatforms)
    .filter(platform => selectedPlatforms[platform])
    .map(platform => ({
      id: platform,
      name: getPlatformDisplayName(platform),
      url: links[platform]
    }));

  if (activePlatforms.length === 0) {
    return '<!-- Please select at least one calendar platform -->';
  }

  // Generate unique ID for this button
  const buttonId = `easycal-${Date.now()}`;
  
  // Button size classes
  const sizeClasses = {
    small: 'padding: 8px 12px; font-size: 14px;',
    medium: 'padding: 10px 16px; font-size: 16px;',
    large: 'padding: 12px 20px; font-size: 18px;'
  };

  // Button style classes
  const getButtonStyles = () => {
    let styles = `
      background-color: ${colorScheme};
      color: ${textColor};
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      ${sizeClasses[buttonSize] || sizeClasses.medium}
    `;

    if (buttonStyle === 'outlined') {
      styles = `
        background-color: transparent;
        color: ${colorScheme};
        border: 2px solid ${colorScheme};
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        ${sizeClasses[buttonSize] || sizeClasses.medium}
      `;
    }

    return styles;
  };

  // Generate dropdown items
  const dropdownItems = activePlatforms.map(platform => `
    <a href="${platform.url}" 
       target="_blank" 
       class="easycal-dropdown-item"
       style="display: block; padding: 8px 16px; text-decoration: none; color: #333; font-size: 14px; transition: background-color 0.2s ease;"
       onmouseover="this.style.backgroundColor='#f5f5f5'"
       onmouseout="this.style.backgroundColor='transparent'">
      ${platform.name}
    </a>
  `).join('');

  return `<!-- EasyCal Calendar Button -->
<div class="easycal-container" style="position: relative; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <button 
    id="${buttonId}" 
    class="easycal-button"
    style="${getButtonStyles()}"
    onclick="document.getElementById('${buttonId}-dropdown').style.display = document.getElementById('${buttonId}-dropdown').style.display === 'block' ? 'none' : 'block'"
    onmouseover="this.style.opacity='0.9'"
    onmouseout="this.style.opacity='1'">
    📅 Add to Calendar ▼
  </button>
  
  <div 
    id="${buttonId}-dropdown" 
    class="easycal-dropdown"
    style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ddd; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 200px; z-index: 1000; margin-top: 4px;">
    ${dropdownItems}
  </div>
</div>

<script>
// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const container = event.target.closest('.easycal-container');
  if (!container) {
    document.querySelectorAll('.easycal-dropdown').forEach(dropdown => {
      dropdown.style.display = 'none';
    });
  }
});
</script>`;
};

/**
 * Generate direct links HTML (for emails)
 */
export const generateDirectLinks = (eventData, buttonData) => {
  const links = generateCalendarLinks(eventData);
  const { selectedPlatforms } = buttonData;
  
  const activePlatforms = Object.keys(selectedPlatforms)
    .filter(platform => selectedPlatforms[platform])
    .map(platform => ({
      id: platform,
      name: getPlatformDisplayName(platform),
      url: links[platform]
    }));

  if (activePlatforms.length === 0) {
    return '<!-- Please select at least one calendar platform -->';
  }

  const linkItems = activePlatforms.map(platform => `
  <li style="margin-bottom: 8px;">
    <a href="${platform.url}" 
       target="_blank" 
       style="color: #4D90FF; text-decoration: none; font-weight: 500;">
      📅 Add to ${platform.name}
    </a>
  </li>
  `).join('');

  return `<!-- EasyCal Direct Links -->
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <p style="margin-bottom: 12px; font-weight: 600; color: #333;">Add "${eventData.title}" to your calendar:</p>
  <ul style="list-style: none; padding: 0; margin: 0;">
    ${linkItems}
  </ul>
</div>`;
};

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
 * Main function to generate code based on output type
 */
export const generateCalendarCode = (eventData, buttonData, outputType = 'button') => {
  if (!eventData.title || !eventData.startDate) {
    return '<!-- Please fill in the event title and date to generate code -->';
  }

  switch (outputType) {
    case 'button':
      return generateButtonCode(eventData, buttonData);
    case 'links':
      return generateDirectLinks(eventData, buttonData);
    case 'direct':
      return generateDirectLinks(eventData, buttonData);
    default:
      return generateButtonCode(eventData, buttonData);
  }
};