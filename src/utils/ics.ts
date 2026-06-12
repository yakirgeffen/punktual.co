/**
 * RFC 5545-compliant ICS (iCalendar) serialization.
 *
 * Replaces the ad-hoc ICS string in calendarGenerator (review finding:
 * no text escaping, no line folding, floating times, Date.now() UIDs).
 * This serializer is also the foundation for the webcal-feed endpoint
 * (review §5 — the Pro-tier verdict was GO, gated on exactly this module).
 */

import { zonedWallTimeToUtc, toUtcBasic, toDateBasic, nextDay } from './datetime';

export interface IcsEventInput {
  title: string;
  description?: string;
  location?: string;
  /** 'YYYY-MM-DD' */
  startDate: string;
  /** 'HH:MM' — ignored for all-day events */
  startTime?: string;
  endDate?: string;
  endTime?: string;
  /** IANA zone the wall times are expressed in; defaults to UTC */
  timezone?: string;
  isAllDay?: boolean;
  /** Stable unique id; generated if omitted */
  uid?: string;
  /** Absolute URL associated with the event */
  url?: string;
  /** RFC 5545 RRULE value (without the "RRULE:" prefix) for recurring events */
  rrule?: string;
}

/** RFC 5545 §3.3.11 TEXT escaping: backslash, semicolon, comma, newline. */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/**
 * RFC 5545 §3.1 line folding: content lines longer than 75 octets are split
 * with CRLF + single space. Folding is done on UTF-8 octet length so
 * multi-byte characters never get split mid-sequence.
 */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const out: string[] = [];
  let current = '';
  let currentOctets = 0;
  // continuation lines start with a space, so their budget is 74
  let budget = 75;

  for (const ch of line) {
    const chOctets = encoder.encode(ch).length;
    if (currentOctets + chOctets > budget) {
      out.push(current);
      current = ' ' + ch;
      currentOctets = 1 + chOctets;
      budget = 75;
    } else {
      current += ch;
      currentOctets += chOctets;
    }
  }
  if (current) out.push(current);
  return out.join('\r\n');
}

function generateUid(): string {
  // crypto-random, collision-safe (replaces Date.now() — review finding)
  const bytes = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex}@punktual.co`;
}

/** Serializes one event to a complete VCALENDAR document (CRLF line endings, folded lines). */
export function buildIcsCalendar(event: IcsEventInput): string {
  const lines = buildVEventLines(event);
  const doc = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'PRODID:-//Punktual//Calendar//EN',
    ...lines,
    'END:VCALENDAR',
  ];
  return doc.map(foldIcsLine).join('\r\n');
}

/** Serializes multiple events to one VCALENDAR — the shape a webcal feed endpoint serves. */
export function buildIcsFeed(events: IcsEventInput[], calendarName?: string): string {
  const doc = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'PRODID:-//Punktual//Calendar//EN',
    ...(calendarName ? [`X-WR-CALNAME:${escapeIcsText(calendarName)}`] : []),
    ...events.flatMap(buildVEventLines),
    'END:VCALENDAR',
  ];
  return doc.map(foldIcsLine).join('\r\n');
}

function buildVEventLines(event: IcsEventInput): string[] {
  const {
    title,
    description = '',
    location = '',
    startDate,
    startTime = '10:00',
    endDate,
    endTime,
    timezone,
    isAllDay = false,
    uid,
    url,
    rrule,
  } = event;

  const finalEndDate = endDate || startDate;
  const dtstamp = toUtcBasic(new Date());

  const lines: string[] = ['BEGIN:VEVENT', `UID:${uid || generateUid()}`, `DTSTAMP:${dtstamp}`];

  if (isAllDay) {
    // All-day events use VALUE=DATE with an EXCLUSIVE end date (RFC 5545):
    // a one-day event on the 12th is DTSTART 0612 / DTEND 0613.
    lines.push(`DTSTART;VALUE=DATE:${toDateBasic(startDate)}`);
    lines.push(`DTEND;VALUE=DATE:${toDateBasic(nextDay(finalEndDate))}`);
  } else {
    const startUtc = zonedWallTimeToUtc(startDate, startTime, timezone);
    const endUtc = zonedWallTimeToUtc(finalEndDate, endTime || addOneHour(startTime), timezone);
    lines.push(`DTSTART:${toUtcBasic(startUtc)}`);
    lines.push(`DTEND:${toUtcBasic(endUtc)}`);
  }

  if (rrule) lines.push(`RRULE:${rrule}`);

  lines.push(`SUMMARY:${escapeIcsText(title)}`);
  if (description) lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
  if (location) lines.push(`LOCATION:${escapeIcsText(location)}`);
  if (url) lines.push(`URL:${url}`);
  lines.push('STATUS:CONFIRMED', 'SEQUENCE:0', 'END:VEVENT');
  return lines;
}

function addOneHour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
