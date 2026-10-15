const { z } = require('zod');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Recurring = require('../models/Recurring');
const { HttpError } = require('../middleware/errors');

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(30),
  type: z.enum(['income', 'expense']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a color.').optional(),
  icon: z.string().max(40).optional(),
});

async function list(req, res) {
  const items = await Category.find({ user: req.userId }).sort({ type: 1, name: 1 }).lean();
  res.json(items);
}

async function create(req, res) {
  const data = categorySchema.parse(req.body);
  const cat = await Category.create({ ...data, user: req.userId });
  res.status(201).json(cat);
}

async function update(req, res) {
  const data = categorySchema.parse(req.body);
  const cat = await Category.findOne({ _id: req.params.id, user: req.userId });
  if (!cat) throw new HttpError(404, 'Category not found.');
  const oldName = cat.name;
  Object.assign(cat, data);
  await cat.save();
  // A rename carries over to everything that uses the category.
  if (oldName !== cat.name) {
    const match = { user: req.userId, category: oldName };
    await Promise.all([
      Transaction.updateMany({ ...match, type: cat.type }, { category: cat.name }),
      Recurring.updateMany({ ...match, type: cat.type }, { category: cat.name }),
      cat.type === 'expense' ? Budget.updateMany(match, { category: cat.name }) : null,
    ]);
  }
  res.json(cat);
}

async function remove(req, res) {
  const cat = await Category.findOne({ _id: req.params.id, user: req.userId });
  if (!cat) throw new HttpError(404, 'Category not found.');
  const used = await Transaction.countDocuments({ user: req.userId, category: cat.name, type: cat.type });
  if (used) {
    throw new HttpError(409, `“${cat.name}” is used by ${used} transaction${used === 1 ? '' : 's'}. Move them to another category first, or rename this one.`);
  }
  await Promise.all([cat.deleteOne(), Budget.deleteOne({ user: req.userId, category: cat.name })]);
  res.status(204).end();
}

module.exports = { list, create, update, remove };
