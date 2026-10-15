import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'SGD', 'AED'];

const formatters = new Map();

export function money(amount, currency = 'USD', opts = {}) {
  const key = `${currency}-${opts.compact ? 'c' : 'f'}`;
  if (!formatters.has(key)) {
    formatters.set(
      key,
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        notation: opts.compact ? 'compact' : 'standard',
        maximumFractionDigits: opts.compact ? 1 : 2,
      }),
    );
  }
  return formatters.get(key).format(amount ?? 0);
}

// Dates are stored at midnight UTC for the chosen day, so read them as UTC.
export const showDate = (d, f = 'MMM D, YYYY') => dayjs.utc(d).format(f);
export const toDayParam = (d) => (d ? dayjs(d).format('YYYY-MM-DD') : undefined);
/** A stored (UTC) date as a local dayjs for date pickers, keeping the same calendar day. */
export const toPickerDay = (d) => dayjs(dayjs.utc(d).format('YYYY-MM-DD'));
export const monthLabel = (key, f = 'MMMM YYYY') => dayjs(`${key}-01`).format(f);
export const currentMonth = () => dayjs().format('YYYY-MM');

/** Percent change from `prev` to `now`, or null when there's nothing to compare. */
export function change(now, prev) {
  if (!prev) return null;
  return Math.round(((now - prev) / prev) * 100);
}

export { dayjs };
