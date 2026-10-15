const mongoose = require('mongoose');
const { z } = require('zod');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { HttpError } = require('../middleware/errors');
const { applyRecurring } = require('../services/recurring');
const { isMonthKey, monthKey, monthRange } = require('../utils/dates');

const budgetSchema = z.object({
  category: z.string().trim().min(1, 'Choose a category.').max(30),
  limit: z.coerce.number().min(1, 'Budget must be at least 1.').max(1e9),
});

function status(percent) {
  if (percent >= 100) return 'over';
  if (percent >= 80) return 'warning';
  return 'ok';
}

/** Budgets with how much has been spent in the given month. */
async function budgetsWithSpending(userId, key) {
  const { start, end } = monthRange(key);
  const [budgets, spent] = await Promise.all([
    Budget.find({ user: userId }).sort({ category: 1 }).lean(),
    Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), type: 'expense', date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
  ]);
  return budgets.map((b) => {
    const total = spent.find((s) => s._id === b.category)?.total ?? 0;
    const percent = Math.round((total / b.limit) * 100);
    return { ...b, spent: total, remaining: b.limit - total, percent, status: status(percent) };
  });
}

async function list(req, res) {
  await applyRecurring(req.userId);
  const key = isMonthKey(req.query.month) ? req.query.month : monthKey();
  res.json({ month: key, items: await budgetsWithSpending(req.userId, key) });
}

async function upsert(req, res) {
  const data = budgetSchema.parse(req.body);
  const budget = await Budget.findOneAndUpdate(
    { user: req.userId, category: data.category },
    { $set: { limit: data.limit } },
    { upsert: true, returnDocument: 'after', runValidators: true },
  );
  res.json(budget);
}

async function remove(req, res) {
  const result = await Budget.deleteOne({ _id: req.params.id, user: req.userId });
  if (!result.deletedCount) throw new HttpError(404, 'Budget not found.');
  res.status(204).end();
}

module.exports = { list, upsert, remove, budgetsWithSpending };
