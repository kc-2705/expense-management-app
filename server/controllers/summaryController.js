const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { applyRecurring } = require('../services/recurring');
const { budgetsWithSpending } = require('./budgetController');
const { isMonthKey, monthKey, monthRange, shiftMonth } = require('../utils/dates');

const TREND_MONTHS = 6;

/**
 * Everything the dashboard needs for one month in a single request:
 * totals vs last month, spending by category, a 6-month trend, top expenses and budgets.
 */
async function summary(req, res) {
  await applyRecurring(req.userId);
  const key = isMonthKey(req.query.month) ? req.query.month : monthKey();
  const user = new mongoose.Types.ObjectId(req.userId);
  const { start, end } = monthRange(key);
  const prev = monthRange(shiftMonth(key, -1));
  const trendStart = monthRange(shiftMonth(key, -(TREND_MONTHS - 1))).start;

  const [totals, prevTotals, byCategory, trendRaw, topExpenses, categories, budgets, count] = await Promise.all([
    totalsBetween(user, start, end),
    totalsBetween(user, prev.start, prev.end),
    Transaction.aggregate([
      { $match: { user, type: 'expense', date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { amount: -1 } },
    ]),
    Transaction.aggregate([
      { $match: { user, date: { $gte: trendStart, $lt: end } } },
      {
        $group: {
          _id: { month: { $dateToString: { format: '%Y-%m', date: '$date' } }, type: '$type' },
          sum: { $sum: '$amount' },
        },
      },
    ]),
    Transaction.find({ user, type: 'expense', date: { $gte: start, $lt: end } }).sort({ amount: -1 }).limit(5).lean(),
    Category.find({ user }).lean(),
    budgetsWithSpending(req.userId, key),
    Transaction.countDocuments({ user, date: { $gte: start, $lt: end } }),
  ]);

  const colorOf = (name) => categories.find((c) => c.name === name && c.type === 'expense')?.color ?? '#64748b';
  const trend = [];
  for (let i = TREND_MONTHS - 1; i >= 0; i--) {
    const m = shiftMonth(key, -i);
    const pick = (type) => trendRaw.find((r) => r._id.month === m && r._id.type === type)?.sum ?? 0;
    trend.push({ month: m, income: pick('income'), expense: pick('expense') });
  }

  res.json({
    month: key,
    count,
    income: totals.income,
    expense: totals.expense,
    balance: totals.income - totals.expense,
    savingsRate: totals.income > 0 ? Math.round(((totals.income - totals.expense) / totals.income) * 100) : null,
    previous: prevTotals,
    byCategory: byCategory.map((c) => ({ category: c._id, amount: c.amount, count: c.count, color: colorOf(c._id) })),
    trend,
    topExpenses,
    budgets,
  });
}

async function totalsBetween(user, start, end) {
  const rows = await Transaction.aggregate([
    { $match: { user, date: { $gte: start, $lt: end } } },
    { $group: { _id: '$type', sum: { $sum: '$amount' } } },
  ]);
  const sum = (t) => rows.find((r) => r._id === t)?.sum ?? 0;
  return { income: sum('income'), expense: sum('expense') };
}

module.exports = { summary };
