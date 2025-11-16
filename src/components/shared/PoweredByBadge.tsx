/**
 * PoweredByBadge.tsx
 * Reusable "Powered by Punktual" badge component
 * Used in previews, landing pages, and embedded code
 */

'use client';

import React from 'react';

interface PoweredByBadgeProps {
  variant?: 'default' | 'minimal' | 'inline';
  className?: string;
  utmSource?: string; // For tracking different placements
  showIcon?: boolean;
}

const PoweredByBadge: React.FC<PoweredByBadgeProps> = ({
  variant = 'default',
  className = '',
  utmSource = 'embed',
  showIcon = true
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://punktual.co';
  const trackingUrl = `${baseUrl}?utm_source=${utmSource}&utm_medium=badge`;

  if (variant === 'minimal') {
    return (
      <div className={`text-center ${className}`}>
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>Powered by</span>
          <span className="font-semibold">Punktual</span>
        </a>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <a
        href={trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      >
        {showIcon && <span>📅</span>}
        <span>Powered by</span>
        <span className="font-semibold text-emerald-600">Punktual</span>
      </a>
    );
  }

  // Default variant
  return (
    <div className={`text-center py-2 ${className}`}>
      <a
        href={trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
      >
        {showIcon && <span className="text-base">📅</span>}
        <span className="flex items-center gap-1">
          <span>Powered by</span>
          <span className="font-semibold text-emerald-600">Punktual</span>
        </span>
      </a>
    </div>
  );
};

export default PoweredByBadge;

/**
 * Generates HTML string for "Powered by" badge (for code generation)
 * @param utmSource - UTM source for tracking
 * @param variant - Style variant
 */
export function generatePoweredByHTML(
  utmSource: string = 'embed',
  variant: 'default' | 'minimal' = 'default'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://punktual.co';
  const trackingUrl = `${baseUrl}?utm_source=${utmSource}&utm_medium=badge`;

  if (variant === 'minimal') {
    return `
<!-- Powered by Punktual -->
<div style="text-align: center; margin-top: 12px;">
  <a href="${trackingUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #6b7280; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; transition: color 0.2s;">
    <span>Powered by</span>
    <span style="font-weight: 600; color: #10b981;">Punktual</span>
  </a>
</div>`.trim();
  }

  return `
<!-- Powered by Punktual -->
<div style="text-align: center; padding: 8px 0; margin-top: 12px;">
  <a href="${trackingUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #6b7280; font-size: 11px; display: inline-flex; align-items: center; gap: 6px; transition: color 0.2s;">
    <span style="font-size: 14px;">📅</span>
    <span style="display: inline-flex; align-items: center; gap: 4px;">
      <span>Powered by</span>
      <span style="font-weight: 600; color: #10b981;">Punktual</span>
    </span>
  </a>
</div>`.trim();
}

/**
 * Generates email-safe table-based HTML for "Powered by" badge
 * @param utmSource - UTM source for tracking
 */
export function generatePoweredByTableHTML(utmSource: string = 'email_embed'): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://punktual.co';
  const trackingUrl = `${baseUrl}?utm_source=${utmSource}&utm_medium=badge`;

  return `
<tr>
  <td align="center" style="padding: 10px 0 15px 0;">
    <a href="${trackingUrl}" target="_blank" style="text-decoration: none; color: #6b7280; display: inline-block;">
      <table cellpadding="0" cellspacing="0" border="0" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
        <tr>
          <td valign="middle" style="vertical-align: middle; font-size: 11px; line-height: 15px;">Powered by</td>
          <td valign="middle" style="vertical-align: middle; padding-left: 4px; line-height: 0;">
            <span style="font-size: 11px; font-weight: 600; color: #10b981;">Punktual</span>
          </td>
        </tr>
      </table>
    </a>
  </td>
</tr>`.trim();
}
