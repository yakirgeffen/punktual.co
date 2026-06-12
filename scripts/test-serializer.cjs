/**
 * Golden-value tests for the datetime/ICS serializer and calendar link generator.
 *
 * Run: npm run test:serializer
 * (compiles src/utils via scripts/sertest/tsconfig.json, then asserts golden values)
 */

const { execSync } = require('child_process');
const path = require('path');

execSync('npx tsc -p ' + path.join(__dirname, 'sertest', 'tsconfig.json'), { stdio: 'inherit' });

const out = path.join(__dirname, 'sertest', 'out', 'utils');
const dt = require(path.join(out, 'datetime.js'));
const ics = require(path.join(out, 'ics.js'));
const gen = require(path.join(out, 'calendarGenerator.js'));
const esc = require(path.join(out, 'escape.js'));
const sl = require(path.join(out, 'shortLinks.js'));

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
  } else {
    console.log(`ok   ${name}`);
  }
}
function checkIncludes(name, haystack, needle) {
  const ok = typeof haystack === 'string' && haystack.includes(needle);
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}\n  missing: ${JSON.stringify(needle)}\n  in:      ${JSON.stringify(String(haystack).slice(0, 300))}`);
  } else {
    console.log(`ok   ${name}`);
  }
}

// --- timezone conversion ---------------------------------------------------

check('Jerusalem summer (IDT, UTC+3): 10:00 wall -> 07:00Z',
  dt.zonedWallTimeToUtc('2026-06-12', '10:00', 'Asia/Jerusalem').toISOString(),
  '2026-06-12T07:00:00.000Z');

check('New York winter (EST, UTC-5): 10:00 wall -> 15:00Z',
  dt.zonedWallTimeToUtc('2026-01-15', '10:00', 'America/New_York').toISOString(),
  '2026-01-15T15:00:00.000Z');

check('New York summer (EDT, UTC-4): 10:00 wall -> 14:00Z',
  dt.zonedWallTimeToUtc('2026-07-15', '10:00', 'America/New_York').toISOString(),
  '2026-07-15T14:00:00.000Z');

check('UTC passthrough',
  dt.zonedWallTimeToUtc('2026-06-12', '10:00', 'UTC').toISOString(),
  '2026-06-12T07:00:00.000Z'.replace('07:00', '10:00'));

check('missing zone treated as UTC',
  dt.zonedWallTimeToUtc('2026-06-12', '10:00').toISOString(),
  '2026-06-12T10:00:00.000Z');

check('unknown zone falls back to UTC without crashing',
  dt.zonedWallTimeToUtc('2026-06-12', '10:00', 'Not/AZone').toISOString(),
  '2026-06-12T10:00:00.000Z');

// DST spring-forward gap: 2026-03-08 02:30 does not exist in New York.
// Any deterministic resolution within an hour of 07:00Z is acceptable.
{
  const got = dt.zonedWallTimeToUtc('2026-03-08', '02:30', 'America/New_York').getTime();
  const target = Date.parse('2026-03-08T07:30:00Z');
  const ok = Math.abs(got - target) <= 60 * 60 * 1000;
  if (!ok) { failures++; console.error(`FAIL DST gap resolution: got ${new Date(got).toISOString()}`); }
  else console.log('ok   DST spring-forward gap resolves deterministically');
}

check('toUtcBasic format', dt.toUtcBasic(new Date('2026-06-12T07:00:00Z')), '20260612T070000Z');
check('toUtcIso format', dt.toUtcIso(new Date('2026-06-12T07:00:00Z')), '2026-06-12T07:00:00Z');
check('nextDay month rollover', dt.nextDay('2026-06-30'), '2026-07-01');
check('nextDay year rollover', dt.nextDay('2026-12-31'), '2027-01-01');

// --- ICS text escaping and folding ------------------------------------------

check('ICS text escaping',
  ics.escapeIcsText('a,b;c\nd\\e'),
  'a\\,b\\;c\\nd\\\\e');

{
  const long = 'SUMMARY:' + 'x'.repeat(200);
  const folded = ics.foldIcsLine(long);
  const physical = folded.split('\r\n');
  const enc = new (require('util').TextEncoder)();
  const allWithinBudget = physical.every(l => enc.encode(l).length <= 75);
  const continuationsSpaced = physical.slice(1).every(l => l.startsWith(' '));
  const unfolded = physical.map((l, i) => (i === 0 ? l : l.slice(1))).join('');
  if (!allWithinBudget || !continuationsSpaced || unfolded !== long) {
    failures++; console.error('FAIL line folding (budget/space/roundtrip)');
  } else console.log('ok   line folding: <=75 octets, spaced continuations, lossless roundtrip');
}

{
  const long = 'DESCRIPTION:ééé' + 'é'.repeat(100); // 2-byte chars — must not split mid-sequence
  const folded = ics.foldIcsLine(long);
  const unfolded = folded.split('\r\n').map((l, i) => (i === 0 ? l : l.slice(1))).join('');
  check('folding never splits multi-byte chars (roundtrip)', unfolded, long);
}

// --- full ICS document -------------------------------------------------------

{
  const doc = ics.buildIcsCalendar({
    title: 'Launch, party; tonight',
    description: 'Line1\nLine2',
    location: 'Tel Aviv, Israel',
    startDate: '2026-06-12',
    startTime: '10:00',
    endDate: '2026-06-12',
    endTime: '11:00',
    timezone: 'Asia/Jerusalem',
    uid: 'test-uid@punktual.co'
  });
  checkIncludes('ICS: timed DTSTART converted to UTC', doc, 'DTSTART:20260612T070000Z');
  checkIncludes('ICS: timed DTEND converted to UTC', doc, 'DTEND:20260612T080000Z');
  checkIncludes('ICS: SUMMARY escaped', doc, 'SUMMARY:Launch\\, party\\; tonight');
  checkIncludes('ICS: DESCRIPTION newline escaped', doc, 'DESCRIPTION:Line1\\nLine2');
  checkIncludes('ICS: LOCATION escaped', doc, 'LOCATION:Tel Aviv\\, Israel');
  checkIncludes('ICS: stable UID honored', doc, 'UID:test-uid@punktual.co');
  checkIncludes('ICS: PRODID present', doc, 'PRODID:-//Punktual//Calendar//EN');
  check('ICS: CRLF line endings only',
    doc.includes('\r\n') && !doc.replace(/\r\n/g, '').includes('\n'), true);
}

{
  const doc = ics.buildIcsCalendar({
    title: 'All day',
    startDate: '2026-06-12',
    endDate: '2026-06-12',
    isAllDay: true,
    uid: 'allday@punktual.co'
  });
  checkIncludes('ICS all-day: VALUE=DATE start', doc, 'DTSTART;VALUE=DATE:20260612');
  checkIncludes('ICS all-day: exclusive end (+1 day)', doc, 'DTEND;VALUE=DATE:20260613');
}

{
  const feed = ics.buildIcsFeed([
    { title: 'A', startDate: '2026-06-12', startTime: '10:00', uid: 'a@punktual.co' },
    { title: 'B', startDate: '2026-06-13', startTime: '10:00', uid: 'b@punktual.co' }
  ], 'My Feed');
  checkIncludes('feed: calendar name', feed, 'X-WR-CALNAME:My Feed');
  check('feed: two VEVENTs', (feed.match(/BEGIN:VEVENT/g) || []).length, 2);
  check('feed: single VCALENDAR', (feed.match(/BEGIN:VCALENDAR/g) || []).length, 1);
}

// --- provider links ----------------------------------------------------------

{
  const links = gen.generateCalendarLinks({
    title: 'Team Sync',
    description: 'Weekly',
    location: 'Online',
    startDate: '2026-06-12',
    startTime: '10:00',
    endDate: '2026-06-12',
    endTime: '11:00',
    timezone: 'Asia/Jerusalem',
    isAllDay: false
  });
  checkIncludes('Google: UTC instants', links.google, 'dates=20260612T070000Z/20260612T080000Z');
  checkIncludes('Google: ctz display zone', links.google, 'ctz=Asia%2FJerusalem');
  checkIncludes('Outlook: real UTC startdt (was wall time stamped Z)', links.outlook, 'startdt=2026-06-12T07%3A00%3A00Z');
  checkIncludes('Office365: real UTC startdt', links.office365, 'startdt=2026-06-12T07%3A00%3A00Z');
  checkIncludes('Yahoo: UTC instants', links.yahoo, 'st=20260612T070000Z');
  checkIncludes('Apple: data URI with text/calendar', links.apple, 'data:text/calendar');
  checkIncludes('Apple: ICS start in UTC', decodeURIComponent(links.apple), 'DTSTART:20260612T070000Z');
}

{
  const links = gen.generateCalendarLinks({
    title: 'Conference',
    startDate: '2026-06-12',
    endDate: '2026-06-13',
    isAllDay: true
  });
  checkIncludes('Google all-day: exclusive end', links.google, 'dates=20260612/20260614');
  checkIncludes('Outlook all-day: allday=true', links.outlook, 'allday=true');
  checkIncludes('Outlook all-day: exclusive end date', links.outlook, 'enddt=2026-06-14');
  checkIncludes('Yahoo all-day: dur=allday', links.yahoo, 'dur=allday');
}

{
  const links = gen.generateCalendarLinks({ title: '', startDate: '' });
  check('empty input returns empty links', links.google, '');
}

// --- escape utilities (security-critical, direct unit assertions) ------------

check('escapeHtml: script tag neutralized',
  esc.escapeHtml('<script>alert("xss")</script>'),
  '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');

check('escapeHtml: ampersand escaped first (no double-escaping)',
  esc.escapeHtml('&lt; & <'),
  '&amp;lt; &amp; &lt;');

check('escapeHtml: quotes for attribute context',
  esc.escapeHtml(`O'Brien says "hi"`),
  'O&#039;Brien says &quot;hi&quot;');

check('escapeJsString: quote cannot terminate the string literal',
  esc.escapeJsString("it's"),
  "it\\'s");

check('escapeJsString: </script> cannot close the script block',
  esc.escapeJsString('</script><script>alert(1)</script>'),
  '\\x3C/script>\\x3Cscript>alert(1)\\x3C/script>');

check('escapeJsString: backslash and newline',
  esc.escapeJsString('a\\b\nc'),
  'a\\\\b\\nc');

// --- short link helpers --------------------------------------------------------

check('isShortLink: current path format', sl.isShortLink('https://punktual.co/eventid/AB12CD34'), true);
check('isShortLink: legacy query-style format', sl.isShortLink('https://punktual.co/eventid=AB12CD34'), true);
check('isShortLink: unrelated URL rejected', sl.isShortLink('https://punktual.co/create'), false);
check('extractShortId: current format', sl.extractShortId('https://punktual.co/eventid/AB12CD34'), 'AB12CD34');
check('extractShortId: legacy format', sl.extractShortId('https://punktual.co/eventid=AB12CD34'), 'AB12CD34');
check('extractShortId: base64url chars (- and _)', sl.extractShortId('https://punktual.co/eventid/XY-Z_A12'), 'XY-Z_A12');
check('extractShortId: no id -> null', sl.extractShortId('https://punktual.co/about'), null);

// --- result ------------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} test(s) FAILED`);
  process.exit(1);
}
console.log('\nAll serializer tests passed.');
