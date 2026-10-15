const mongoose = require('mongoose');
const { z } = require('zod');
const Transaction = require('../models/Transaction');
const { HttpError } = require('../middleware/errors');
const { applyRecurring } = require('../services/recurring');
const { toDay } = require('../utils/dates');

const day = z
  .string()
  .refine((s) => toDay(s) !== null, 'Enter a valid date.')
  .transform((s) => toDay(s));

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be more than 0.').max(1e9),
  category: z.string().trim().min(1, 'Choose a category.').max(30),
  description: z.string().trim().max(200).optional().default(''),
  date: day,
});

const listSchema = z.object({
  from: day.optional(),
  to: day.optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(['date', '-date', 'amount', '-amount']).optional().default('-date'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(20),
  all: z.enum(['true', 'false']).optional(),
});

const importSchema = z.object({
  rows: z.array(transactionSchema).min(1, 'The file has no rows.').max(5000, 'Import up to 5,000 rows at a time.'),
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildFilter(userId, q) {
  // An ObjectId (not a string) so the same filter also works in aggregations, which don't cast types.
  const filter = { user: new mongoose.Types.ObjectId(userId) };
  if (q.from || q.to) {
    filter.date = {};
    if (q.from) filter.date.$gte = q.from;
    // `to` is inclusive: everything before the next day.
    if (q.to) filter.date.$lt = new Date(q.to.getTime() + 86_400_000);
  }
  if (q.type) filter.type = q.type;
  if (q.category) filter.category = { $in: q.category.split(',') };
  if (q.q) {
    const re = new RegExp(escapeRegex(q.q), 'i');
    filter.$or = [{ description: re }, { category: re }];
  }
  return filter;
}

async function list(req, res) {
  await applyRecurring(req.userId);
  const q = listSchema.parse(req.query);
  const filter = buildFilter(req.userId, q);
  const sortField = q.sort.replace('-', '');
  const sort = { [sortField]: q.sort.startsWith('-') ? -1 : 1, _id: -1 };

  if (q.all === 'true') {
    const items = await Transaction.find(filter).sort(sort).limit(20000).lean();
    return res.json({ items, total: items.length, page: 1, limit: items.length });
  }
  const [items, total, totals] = await Promise.all([
    Transaction.find(filter).sort(sort).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
    Transaction.countDocuments(filter),
    Transaction.aggregate([{ $match: filter }, { $group: { _id: '$type', sum: { $sum: '$amount' } } }]),
  ]);
  const sum = (t) => totals.find((x) => x._id === t)?.sum ?? 0;
  res.json({ items, total, page: q.page, limit: q.limit, totals: { income: sum('income'), expense: sum('expense') } });
}

async function create(req, res) {
  const data = transactionSchema.parse(req.body);
  const tx = await Transaction.create({ ...data, user: req.userId });
  res.status(201).json(tx);
}

async function update(req, res) {
  const data = transactionSchema.parse(req.body);
  // Matching on both id and user means one user can never edit another user's transaction.
  const tx = await Transaction.findOneAndUpdate({ _id: req.params.id, user: req.userId }, data, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!tx) throw new HttpError(404, 'Transaction not found.');
  res.json(tx);
}

async function remove(req, res) {
  const result = await Transaction.deleteOne({ _id: req.params.id, user: req.userId });
  if (!result.deletedCount) throw new HttpError(404, 'Transaction not found.');
  res.status(204).end();
}

async function importRows(req, res) {
  const { rows } = importSchema.parse(req.body);
  const docs = rows.map((r) => ({ ...r, user: req.userId }));
  await Transaction.insertMany(docs);
  res.status(201).json({ inserted: docs.length });
}

module.exports = { list, create, update, remove, importRows, transactionSchema };
