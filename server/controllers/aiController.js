const mongoose = require('mongoose');
const { z } = require('zod');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const ai = require('../services/ai');
const { HttpError } = require('../middleware/errors');
const { budgetsWithSpending } = require('./budgetController');
const { isMonthKey, monthKey, monthRange, shiftMonth } = require('../utils/dates');

const categorizeSchema = z.object({
  rows: z
    .array(
      z.object({
        type: z.enum(['income', 'expense']),
        amount: z.coerce.number(),
        category: z.string().max(30).optional().default(''),
        description: z.string().max(200).optional().default(''),
      }),
    )
    .min(1, 'Nothing to categorize.')
    .max(500, 'Categorize up to 500 rows at a time.'),
});

async function requireOllama() {
  const s = await ai.status();
  if (!s.available) throw new HttpError(503, s.reason);
}

async function status(req, res) {
  res.json(await ai.status());
}

async function categorize(req, res) {
  const { rows } = categorizeSchema.parse(req.body);
  await requireOllama();
  const categories = await Category.find({ user: req.userId }).lean();
  const suggestions = await ai.categorize(rows, categories);
  res.json({ suggestions });
}

const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: '$', AUD: '$' };

async function summary(req, res) {
  await requireOllama();
  const key = isMonthKey(req.query.month) ? req.query.month : monthKey();
  const user = new mongoose.Types.ObjectId(req.userId);
  const { start, end } = monthRange(key);
  const prev = monthRange(shiftMonth(key, -1));

  const totals = async (from, to) => {
    const rows = await Transaction.aggregate([
      { $match: { user, date: { $gte: from, $lt: to } } },
      { $group: { _id: '$type', sum: { $sum: '$amount' } } },
    ]);
    const pick = (t) => rows.find((r) => r._id === t)?.sum ?? 0;
    return { income: pick('income'), expense: pick('expense') };
  };

  const [now, before, byCategory, business, budgets, profile] = await Promise.all([
    totals(start, end),
    totals(prev.start, prev.end),
    Transaction.aggregate([
      { $match: { user, type: 'expense', date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', amount: { $sum: '$amount' } } },
      { $sort: { amount: -1 } },
      { $limit: 6 },
    ]),
    Transaction.aggregate([
      { $match: { user, type: 'expense', business: true, date: { $gte: start, $lt: end } } },
      { $group: { _id: null, sum: { $sum: '$amount' } } },
    ]),
    budgetsWithSpending(req.userId, key),
    User.findById(req.userId).lean(),
  ]);

  if (now.income === 0 && now.expense === 0) {
    return res.json({ month: key, text: 'There are no transactions in this month yet, so there is nothing to summarize.' });
  }

  const [y, m] = key.split('-').map(Number);
  const text = await ai.summarize({
    label: new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    currencySymbol: symbols[profile?.currency] ?? `${profile?.currency ?? 'USD'} `,
    income: now.income,
    expense: now.expense,
    balance: now.income - now.expense,
    previous: before,
    byCategory: byCategory.map((c) => ({ category: c._id, amount: c.amount })),
    business: business[0]?.sum ?? 0,
    budgets: budgets.map((b) => ({ category: b.category, percent: b.percent })),
  });
  res.json({ month: key, text: text.trim() });
}

module.exports = { status, categorize, summary };
