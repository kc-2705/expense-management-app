import { CategoryDonut, TrendChart } from './Charts';

export default {
  title: 'Charts/Spending charts',
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
};

const TREND = [
  { month: '2026-06', income: 5000, expense: 3600 },
  { month: '2026-07', income: 5000, expense: 4100 },
  { month: '2026-08', income: 5400, expense: 3900 },
  { month: '2026-09', income: 5000, expense: 4600 },
  { month: '2026-10', income: 6200, expense: 3800 },
  { month: '2026-11', income: 5200, expense: 3100 },
];

const SPENDING = [
  { category: 'Rent', amount: 1400, color: '#6366f1' },
  { category: 'Groceries', amount: 520, color: '#22c55e' },
  { category: 'Dining out', amount: 310, color: '#f97316' },
  { category: 'Transport', amount: 240, color: '#0ea5e9' },
  { category: 'Utilities', amount: 180, color: '#eab308' },
  { category: 'Entertainment', amount: 150, color: '#ec4899' },
];
const total = SPENDING.reduce((sum, s) => sum + s.amount, 0);

/** Income vs expenses for the last six months. */
export const Trend = { render: () => <TrendChart data={TREND} /> };

/** A new account has no history, so the chart shows an empty state. */
export const TrendEmpty = { render: () => <TrendChart data={TREND.map((r) => ({ ...r, income: 0, expense: 0 }))} /> };

/** Where this month's money went. */
export const SpendingByCategory = { render: () => <CategoryDonut data={SPENDING} total={total} /> };

export const SpendingEmpty = { render: () => <CategoryDonut data={[]} total={0} /> };
