const { z } = require('zod');
const Recurring = require('../models/Recurring');
const { HttpError } = require('../middleware/errors');
const { applyRecurring } = require('../services/recurring');
const { toDay } = require('../utils/dates');

const recurringSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be more than 0.').max(1e9),
  category: z.string().trim().min(1, 'Choose a category.').max(30),
  description: z.string().trim().max(200).optional().default(''),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  nextDate: z
    .string()
    .refine((s) => toDay(s) !== null, 'Enter a valid start date.')
    .transform((s) => toDay(s)),
  active: z.boolean().optional().default(true),
});

async function list(req, res) {
  await applyRecurring(req.userId);
  const items = await Recurring.find({ user: req.userId }).sort({ active: -1, nextDate: 1 }).lean();
  res.json(items);
}

async function create(req, res) {
  const data = recurringSchema.parse(req.body);
  const rule = await Recurring.create({ ...data, anchorDay: data.nextDate.getUTCDate(), user: req.userId });
  // If the start date is today or earlier, add the owed transactions right away.
  await applyRecurring(req.userId);
  res.status(201).json(await Recurring.findById(rule._id));
}

async function update(req, res) {
  const data = recurringSchema.parse(req.body);
  const rule = await Recurring.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { ...data, anchorDay: data.nextDate.getUTCDate() },
    { returnDocument: 'after', runValidators: true },
  );
  if (!rule) throw new HttpError(404, 'Recurring payment not found.');
  await applyRecurring(req.userId);
  res.json(await Recurring.findById(rule._id));
}

async function remove(req, res) {
  const result = await Recurring.deleteOne({ _id: req.params.id, user: req.userId });
  if (!result.deletedCount) throw new HttpError(404, 'Recurring payment not found.');
  res.status(204).end();
}

module.exports = { list, create, update, remove };
