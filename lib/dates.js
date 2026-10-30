// Meetup times are stored as the venue's local wall-clock time, e.g. "2026-11-14T18:30"
// (the value a datetime-local input gives us). Formatting is done by hand, not with
// toLocaleString, so the server and the browser always render exactly the same text.

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function parseMeetupDate(value) {
  const match = DATE_PATTERN.exec(value || '');
  if (!match) {
    return null;
  }

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));

  // reject values like "2026-02-31" that Date would silently roll over
  if (
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }

  return { year, month: month - 1, day, hour, minute, weekday: date.getUTCDay(), utc: date };
}

function formatTime(hour, minute) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

// "Sat, Nov 14 · 6:30 PM"
export function formatShortDate(value) {
  const d = parseMeetupDate(value);
  if (!d) {
    return null;
  }
  return `${DAYS[d.weekday]}, ${MONTHS[d.month]} ${d.day} · ${formatTime(d.hour, d.minute)}`;
}

// { date: "Saturday, November 14, 2026", time: "6:30 PM" }
export function formatLongDate(value) {
  const d = parseMeetupDate(value);
  if (!d) {
    return null;
  }
  return {
    date: `${DAYS_LONG[d.weekday]}, ${MONTHS_LONG[d.month]} ${d.day}, ${d.year}`,
    time: formatTime(d.hour, d.minute),
  };
}

// { month: "NOV", day: 14 } for the calendar badge on cards
export function getBadgeParts(value) {
  const d = parseMeetupDate(value);
  if (!d) {
    return null;
  }
  return { month: MONTHS[d.month].toUpperCase(), day: d.day };
}

// "YYYY-MM-DD" for today, used to hide meetups that already happened
export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function toCalendarStamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00`
  );
}

// Google Calendar "add event" link. The times have no "Z" suffix, so Google treats
// them as local time, which matches how we store them. Assumes a 2 hour meetup.
export function googleCalendarUrl(meetup) {
  const d = parseMeetupDate(meetup.date);
  if (!d) {
    return null;
  }

  const end = new Date(d.utc.getTime() + 2 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meetup.title,
    dates: `${toCalendarStamp(d.utc)}/${toCalendarStamp(end)}`,
    details: (meetup.description || '').slice(0, 500),
    location: meetup.address || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
