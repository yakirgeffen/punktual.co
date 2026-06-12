/**
 * Timezone-correct datetime conversion for calendar link generation.
 *
 * Converts a wall-clock time in a named IANA timezone (what the user picked
 * in the event form) into a real UTC instant. This is the fix for review
 * finding S3: the previous generators emitted floating local times, or worse,
 * stamped local wall time with a `Z` suffix (claiming it was UTC).
 *
 * No dependencies — uses Intl.DateTimeFormat to resolve zone offsets,
 * with a two-pass adjustment that handles DST transitions.
 */

const dtfCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let dtf = dtfCache.get(timeZone);
  if (!dtf) {
    dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    dtfCache.set(timeZone, dtf);
  }
  return dtf;
}

/** What wall-clock time does this UTC instant show in the given zone? (ms since epoch, as if the wall time were UTC) */
function wallTimeAsUtcMs(utcMs: number, timeZone: string): number {
  const parts = getFormatter(timeZone).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0);
  // 'hour' can come back as 24 for midnight in some environments
  const hour = get('hour') % 24;
  return Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'));
}

/**
 * Returns the UTC instant (Date) for a wall-clock date+time in an IANA zone.
 *
 * @param date 'YYYY-MM-DD'
 * @param time 'HH:MM' (24h)
 * @param timeZone IANA zone name, e.g. 'Asia/Jerusalem'. Invalid/missing zones fall back to UTC.
 */
export function zonedWallTimeToUtc(date: string, time: string, timeZone?: string): Date {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi, 0);

  if (!timeZone || timeZone === 'UTC') return new Date(asUtc);

  let zone = timeZone;
  try {
    getFormatter(zone);
  } catch {
    return new Date(asUtc); // unknown zone — treat the wall time as UTC rather than crashing
  }

  // Two-pass: guess the instant, see what wall time the zone shows for it,
  // correct by the difference. The second pass settles DST-edge cases.
  let guess = asUtc - (wallTimeAsUtcMs(asUtc, zone) - asUtc);
  guess = asUtc - (wallTimeAsUtcMs(guess, zone) - guess);
  return new Date(guess);
}

/** Formats a Date as an ICS/Google UTC basic timestamp: YYYYMMDDTHHMMSSZ */
export function toUtcBasic(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Formats a Date as an ISO 8601 UTC timestamp with seconds: YYYY-MM-DDTHH:MM:SSZ (Outlook deeplinks) */
export function toUtcIso(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** 'YYYY-MM-DD' -> 'YYYYMMDD' (all-day values) */
export function toDateBasic(date: string): string {
  return date.replace(/-/g, '');
}

/** Returns the day after a 'YYYY-MM-DD' date as 'YYYY-MM-DD' (exclusive all-day end). */
export function nextDay(date: string): string {
  const [y, mo, d] = date.split('-').map(Number);
  const next = new Date(Date.UTC(y, mo - 1, d + 1));
  return next.toISOString().slice(0, 10);
}
