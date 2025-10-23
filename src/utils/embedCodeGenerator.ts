/**
 * Inline script embed code generator
 * Generates self-contained JavaScript that can be embedded on any website
 */

import { EventData, ButtonData, CalendarLinks } from '@/types';

export function generateInlineEmbedCode(
  eventData: EventData,
  buttonData: ButtonData,
  calendarLinks: CalendarLinks,
  containerID: string = 'punktual-calendar-buttons'
): string {
  // Generate button HTML
  const selectedPlatforms = Object.entries(buttonData.selectedPlatforms || {})
    .filter(([_, selected]) => selected)
    .map(([platform]) => platform);

  if (selectedPlatforms.length === 0) {
    return '<!-- No calendar platforms selected -->';
  }

  // Platform display info
  const platformInfo: Record<string, { name: string; emoji: string; color: string }> = {
    google: { name: 'Google Calendar', emoji: '📅', color: '#EA4335' },
    apple: { name: 'Apple Calendar', emoji: '🍎', color: '#000000' },
    outlook: { name: 'Outlook', emoji: '📧', color: '#0078D4' },
    office365: { name: 'Microsoft 365', emoji: '📊', color: '#0078D4' },
    outlookcom: { name: 'Outlook.com', emoji: '📧', color: '#0078D4' },
    yahoo: { name: 'Yahoo Calendar', emoji: '🔵', color: '#430297' }
  };

  // Generate buttons HTML
  let buttonsHTML = '';

  if (buttonData.buttonLayout === 'dropdown' || buttonData.buttonLayout === 'single') {
    // Dropdown/Single button - show first selected platform with dropdown menu
    const firstPlatform = selectedPlatforms[0];
    const info = platformInfo[firstPlatform];

    buttonsHTML = `
<div id="${containerID}" style="display: inline-block;">
  <button
    onclick="document.getElementById('${containerID}-menu').style.display = document.getElementById('${containerID}-menu').style.display === 'none' ? 'block' : 'none';"
    style="
      background-color: ${buttonData.colorTheme || '#10b981'};
      color: ${buttonData.textColor || '#FFFFFF'};
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.2s;
    "
    onmouseover="this.style.opacity='0.9'"
    onmouseout="this.style.opacity='1'"
  >
    📅 ${buttonData.ctaText || 'Add to Calendar'}
  </button>
  <div
    id="${containerID}-menu"
    style="
      display: none;
      position: absolute;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-top: 4px;
      z-index: 1000;
      min-width: 200px;
    "
  >
    ${selectedPlatforms
      .map((platform) => {
        const platformData = platformInfo[platform];
        const url = calendarLinks[platform as keyof CalendarLinks];
        return url
          ? `
    <a
      href="${url}"
      target="${buttonData.openInNewTab ? '_blank' : '_self'}"
      rel="noopener noreferrer"
      style="
        display: block;
        padding: 12px 16px;
        color: #1f2937;
        text-decoration: none;
        border-bottom: 1px solid #f3f4f6;
        font-family: 'Nunito', sans-serif;
        transition: background-color 0.2s;
      "
      onmouseover="this.style.backgroundColor='#f9fafb'"
      onmouseout="this.style.backgroundColor='transparent'"
    >
      ${platformData.emoji} ${platformData.name}
    </a>
    `
          : '';
      })
      .join('')}
  </div>
</div>`;
  } else {
    // Individual buttons layout
    buttonsHTML = `
<div id="${containerID}" style="display: inline-flex; gap: 12px; flex-wrap: wrap;">
  ${selectedPlatforms
    .map((platform) => {
      const platformData = platformInfo[platform];
      const url = calendarLinks[platform as keyof CalendarLinks];
      return url
        ? `
  <a
    href="${url}"
    target="${buttonData.openInNewTab ? '_blank' : '_self'}"
    rel="noopener noreferrer"
    style="
      background-color: ${buttonData.colorTheme || '#10b981'};
      color: ${buttonData.textColor || '#FFFFFF'};
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.2s;
    "
    onmouseover="this.style.opacity='0.9'"
    onmouseout="this.style.opacity='1'"
  >
    ${platformData.emoji} ${platformData.name}
  </a>
  `
        : '';
    })
    .join('')}
</div>`;
  }

  // Wrap in script that handles click tracking
  const scriptCode = `
<script>
(function() {
  const container = document.getElementById('${containerID}');
  if (container) {
    // Track button clicks
    const links = container.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', function() {
        // Send analytics event (optional - requires analytics setup)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'calendar_link_click', {
            event_title: '${eventData.title || 'Event'}',
            platform: this.getAttribute('data-platform') || 'unknown'
          });
        }
      });
    });
  }
})();
</script>`;

  return buttonsHTML + scriptCode;
}

/**
 * Generate the complete embed script that users can copy and paste
 */
export function generateCompleteEmbedScript(
  eventData: EventData,
  buttonData: ButtonData,
  calendarLinks: CalendarLinks,
  baseUrl: string = 'https://punktual.co'
): string {
  const embedCode = generateInlineEmbedCode(eventData, buttonData, calendarLinks);

  return `<!-- Punktual Calendar Button Embed -->
<div id="punktual-calendar-embed">
${embedCode}
</div>
<!-- End Punktual Calendar Button Embed -->`;
}
