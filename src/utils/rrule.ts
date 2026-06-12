/**
 * RFC 5545 RRULE generation from the event form's recurrence fields.
 *
 * Provider support reality: the RRULE is honored by the .ics path (Apple,
 * and any calendar importing the file) and by Google's template link via the
 * `recur` parameter. Outlook/Office 365/Yahoo compose deeplinks have no
 * recurrence parameters — those links create the first occurrence only.
 */

import type { EventData } from '@/types';

const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * Builds the RRULE value (without the leading "RRULE:") for a recurring
 * event, or null when the event does not recur.
 */
export function buildRRule(eventData: EventData): string | null {
  const {
    isRecurring,
    recurrencePattern,
    recurrenceInterval,
    recurrenceCount,
    recurrenceEndDate,
    weeklyDays,
    monthlyOption,
    monthlyWeekday,
    monthlyWeekdayOrdinal,
    yearlyMonth,
    startDate,
    isAllDay,
  } = eventData;

  if (!isRecurring || !recurrencePattern || !startDate) return null;

  const parts: string[] = [`FREQ=${recurrencePattern.toUpperCase()}`];

  if (recurrenceInterval && recurrenceInterval > 1) {
    parts.push(`INTERVAL=${Math.floor(recurrenceInterval)}`);
  }

  if (recurrencePattern === 'weekly' && weeklyDays && weeklyDays.length > 0) {
    const days = [...new Set(weeklyDays)]
      .filter(d => d >= 0 && d <= 6)
      .sort((a, b) => a - b)
      .map(d => BYDAY[d]);
    if (days.length > 0) parts.push(`BYDAY=${days.join(',')}`);
  }

  if (recurrencePattern === 'monthly') {
    if (monthlyOption === 'weekday' && monthlyWeekday !== undefined && monthlyWeekdayOrdinal !== undefined) {
      // ordinal field: 0-4 = first..fifth, 5 = last (-1 in RRULE terms)
      const ordinal = monthlyWeekdayOrdinal === 5 ? -1 : monthlyWeekdayOrdinal + 1;
      parts.push(`BYDAY=${ordinal}${BYDAY[monthlyWeekday] || 'MO'}`);
    } else {
      parts.push(`BYMONTHDAY=${Number(startDate.split('-')[2])}`);
    }
  }

  if (recurrencePattern === 'yearly') {
    const month = yearlyMonth !== undefined ? yearlyMonth + 1 : Number(startDate.split('-')[1]);
    parts.push(`BYMONTH=${month}`);
    parts.push(`BYMONTHDAY=${Number(startDate.split('-')[2])}`);
  }

  // End condition: an explicit count wins; otherwise an end date; otherwise
  // the series is open-ended. COUNT=1 would mean "occurs once" — treat it as
  // no meaningful end condition rather than emitting a pointless rule.
  if (recurrenceCount && recurrenceCount > 1) {
    parts.push(`COUNT=${Math.floor(recurrenceCount)}`);
  } else if (recurrenceEndDate) {
    // UNTIL must match DTSTART's value type (RFC 5545): date-only for all-day
    // events, UTC date-time otherwise (end of the chosen day, inclusive).
    const basic = recurrenceEndDate.replace(/-/g, '');
    parts.push(`UNTIL=${isAllDay ? basic : `${basic}T235959Z`}`);
  }

  return parts.join(';');
}
