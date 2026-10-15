// All dates are stored at midnight UTC for the calendar day the user picked,
// so a transaction never shifts to another day because of time zones.

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function isMonthKey(s) {
  return typeof s === 'string' && MONTH_RE.test(s);
}

/** [start, end) of a 'YYYY-MM' month in UTC. */
function monthRange(key) {
  const [y, m] = key.split('-').map(Number);
  return { start: new Date(Date.UTC(y, m - 1, 1)), end: new Date(Date.UTC(y, m, 1)) };
}

function shiftMonth(key, n) {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(Date.UTC(y, m - 1 + n, 1)));
}

/** Parses 'YYYY-MM-DD' (or any ISO string) to midnight UTC of that day. */
function toDay(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * The next date after `date`. Monthly rules keep their original day of month
 * (`anchorDay`): a rule for the 31st lands on 28/29 Feb, then back on 31 Mar.
 */
function advance(date, frequency, anchorDay) {
  const d = new Date(date);
  if (frequency === 'weekly') d.setUTCDate(d.getUTCDate() + 7);
  else if (frequency === 'monthly') {
    const day = anchorDay || d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + 1);
    const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    d.setUTCDate(Math.min(day, last));
  } else d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d;
}

module.exports = { monthKey, isMonthKey, monthRange, shiftMonth, toDay, advance };
