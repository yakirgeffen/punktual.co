'use client';
import React from 'react';
import { useEventContext } from '@/contexts/EventContext';
import Image from 'next/image';

/**
 * UnifiedPreview Component
 *
 * Shows a clean, simple preview of the event before it's saved.
 * Goal: Let users verify details without showing code/links (conversion gate).
 *
 * Displays:
 * - Event details (title, date/time, location, description, timezone)
 * - Static button preview (no interaction)
 * - Selected platforms list
 */
const UnifiedPreview: React.FC = () => {
  const { eventData, buttonData } = useEventContext();

  // Platform info mapping
  const platformInfo: Record<string, { name: string; logo: string }> = {
    google: { name: 'Google Calendar', logo: '/icons/platforms/icon-google.svg' },
    apple: { name: 'Apple Calendar', logo: '/icons/platforms/icon-apple.svg' },
    outlook: { name: 'Outlook', logo: '/icons/platforms/icon-outlook.svg' },
    office365: { name: 'Office 365', logo: '/icons/platforms/icon-office365.svg' },
    outlookcom: { name: 'Outlook.com', logo: '/icons/platforms/icon-outlook.svg' },
    yahoo: { name: 'Yahoo Calendar', logo: '/icons/platforms/icon-yahoo.svg' }
  };

  // Get selected platforms
  const selectedPlatforms = Object.keys(buttonData?.selectedPlatforms || {})
    .filter(platform => buttonData?.selectedPlatforms?.[platform as keyof typeof buttonData.selectedPlatforms]);

  // Individual validation checks for each step
  const hasTitle = !!eventData?.title?.trim();

  // For the preview, we only care if the event can be rendered
  // Dates/times have defaults, so they're always "valid" in that sense
  // BUT for the checklist UX, we want to show progress meaningfully

  // Since dates/times/platforms have defaults, they're technically "complete"
  // The only thing the user MUST fill is the title
  const hasStartDateTime = !!eventData?.startDate && (!!eventData?.startTime || !!eventData?.isAllDay);
  const hasEndDateTime = !!eventData?.endDate && (!!eventData?.endTime || !!eventData?.isAllDay);
  const hasPlatforms = selectedPlatforms.length > 0;

  // Event is complete and can be saved when all required fields are filled
  const isComplete = hasTitle && hasStartDateTime && hasEndDateTime && hasPlatforms;

  // Format date/time for display
  const formatDateTime = () => {
    if (!eventData?.startDate) return null;

    try {
      const startDate = new Date(eventData.startDate);
      const dateStr = startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Handle all-day events
      if (eventData.isAllDay) {
        if (eventData.endDate && eventData.endDate !== eventData.startDate) {
          const endDate = new Date(eventData.endDate);
          const endDateStr = endDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          return `${dateStr} - ${endDateStr} (All day)`;
        }
        return `${dateStr} (All day)`;
      }

      // Handle regular events with time
      if (!eventData.startTime) return dateStr;

      const [hours, minutes] = eventData.startTime.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      const timeStr = `${hour12}:${minutes} ${ampm}`;

      // Include end time if different day or show time range
      if (eventData.endDate && eventData.endTime) {
        const endDate = new Date(eventData.endDate);
        const isSameDay = startDate.toDateString() === endDate.toDateString();

        if (isSameDay) {
          const [endHours, endMinutes] = eventData.endTime.split(':');
          const endHour = parseInt(endHours, 10);
          const endAmpm = endHour >= 12 ? 'PM' : 'AM';
          const endHour12 = endHour % 12 || 12;
          const endTimeStr = `${endHour12}:${endMinutes} ${endAmpm}`;

          return `${dateStr}, ${timeStr} - ${endTimeStr}`;
        } else {
          const endDateStr = endDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          return `${dateStr} ${timeStr} - ${endDateStr}`;
        }
      }

      return `${dateStr}, ${timeStr}`;
    } catch {
      return null;
    }
  };

  // Button styling helpers
  const getButtonSizeClasses = (size: string) => {
    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-5 py-2.5 text-lg'
    };
    return sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium;
  };

  const getButtonStyleClasses = (style: string) => {
    const styleClasses = {
      standard: 'shadow-sm border border-transparent',
      minimal: 'shadow-none',
      pill: 'rounded-full'
    };
    return styleClasses[style as keyof typeof styleClasses] || styleClasses.standard;
  };

  const getContrastColor = (hexColor: string): string => {
    const color = hexColor.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const sRGB = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    const luminance = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    return luminance > 0.179 ? '#374151' : '#FFFFFF';
  };

  const getButtonStyles = (style: string, colorScheme: string): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    const backgroundColor = colorScheme || '#10b981';

    if (style === 'minimal') {
      styles.backgroundColor = 'transparent';
      styles.color = backgroundColor;
      styles.border = `1px solid ${backgroundColor}`;
    } else {
      styles.backgroundColor = backgroundColor;
      styles.color = getContrastColor(backgroundColor);
    }

    return styles;
  };

  const buttonSize = buttonData?.buttonSize || 'medium';
  const buttonStyle = buttonData?.buttonStyle || 'standard';
  const colorScheme = buttonData?.colorTheme || '#10b981';

  const buttonClasses = `
    inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 cursor-default
    ${getButtonSizeClasses(buttonSize)}
    ${getButtonStyleClasses(buttonStyle)}
    ${buttonStyle !== 'pill' ? 'rounded-lg' : ''}
  `.trim();

  const buttonStyles = getButtonStyles(buttonStyle, colorScheme);

  const formattedDateTime = formatDateTime();

  return (
    <div className="h-full sticky top-4">
      <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col shadow-sm overflow-hidden">

        {/* Header with status indicator */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Preview</h3>
              <p className="text-xs text-gray-600">Live preview of your event</p>
            </div>
            {/* Status Badge */}
            {hasTitle ? (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isComplete
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                {isComplete ? '✓ Ready' : 'In Progress'}
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                Not Started
              </div>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {!hasTitle ? (
            <div className="text-center py-8 px-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <span className="text-3xl">✏️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What&apos;s your event called?</h3>
              <p className="text-gray-600 text-sm max-w-xs mx-auto">
                We&apos;ve set smart defaults for date, time &amp; platforms
              </p>
            </div>
          ) : !isComplete ? (
            <div className="text-center py-8 px-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-blue-200">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Almost There!</h3>
              <p className="text-gray-600 text-sm mb-4 max-w-xs mx-auto">
                Please verify the dates and times are correct
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-xs mx-auto text-left space-y-2">
                {!hasStartDateTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500">○</span>
                    <span>Set start date & time</span>
                  </div>
                )}
                {!hasEndDateTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500">○</span>
                    <span>Set end date & time</span>
                  </div>
                )}
                {!hasPlatforms && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500">○</span>
                    <span>Select at least one platform</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Event Details Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  {/* Title */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 break-words leading-tight">
                      {eventData?.title}
                    </h2>
                  </div>

                  {/* Date & Time */}
                  {formattedDateTime && (
                    <div className="flex items-start gap-2.5 text-gray-700">
                      <span className="text-base mt-0.5">🕒</span>
                      <p className="font-medium text-sm flex-1">{formattedDateTime}</p>
                    </div>
                  )}

                  {/* Location */}
                  {eventData?.location && (
                    <div className="flex items-start gap-2.5 text-gray-700">
                      <span className="text-base mt-0.5">📍</span>
                      <span className="text-sm break-words flex-1">{eventData.location}</span>
                    </div>
                  )}

                  {/* Description */}
                  {eventData?.description && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-gray-600 text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {eventData.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Button Preview */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Button Style</h4>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 flex items-center justify-center min-h-[100px]">
                  <div
                    className={buttonClasses}
                    style={buttonStyles}
                  >
                    {buttonData?.showIcons !== false && <span className="text-base">📅</span>}
                    <span>{buttonData?.customText || 'Add to Calendar'}</span>
                    <span className="text-xs opacity-70">▼</span>
                  </div>
                </div>
              </div>

              {/* Selected Platforms */}
              {selectedPlatforms.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Platforms <span className="text-emerald-600">({selectedPlatforms.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlatforms.map(platform => {
                      const info = platformInfo[platform] || {
                        name: platform.charAt(0).toUpperCase() + platform.slice(1),
                        logo: '/icons/platforms/icon-calendar.svg'
                      };

                      return (
                        <div
                          key={platform}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-md border border-gray-200 shadow-sm"
                        >
                          <Image
                            src={info.logo}
                            alt={info.name}
                            width={14}
                            height={14}
                            className="flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/icons/platforms/icon-calendar.svg';
                            }}
                          />
                          <span className="text-xs font-medium text-gray-700">{info.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer CTA - Always visible when complete */}
        {isComplete && (
          <div className="border-t border-gray-200 p-3 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30">
            <div className="flex items-center gap-2 text-emerald-900">
              <span className="text-base">✨</span>
              <p className="text-xs font-medium">
                Ready to save! Click <strong>Create Event</strong> below
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UnifiedPreview;
