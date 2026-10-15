const Category = require('../models/Category');

// Icons are Ant Design icon names; the client maps them to components.
const DEFAULT_CATEGORIES = [
  { type: 'expense', name: 'Food & Dining', color: '#f97316', icon: 'coffee' },
  { type: 'expense', name: 'Groceries', color: '#22c55e', icon: 'shopping-cart' },
  { type: 'expense', name: 'Rent & Housing', color: '#6366f1', icon: 'home' },
  { type: 'expense', name: 'Transport', color: '#0ea5e9', icon: 'car' },
  { type: 'expense', name: 'Utilities', color: '#eab308', icon: 'thunderbolt' },
  { type: 'expense', name: 'Shopping', color: '#ec4899', icon: 'shopping' },
  { type: 'expense', name: 'Health', color: '#ef4444', icon: 'medicine-box' },
  { type: 'expense', name: 'Entertainment', color: '#a855f7', icon: 'play-circle' },
  { type: 'expense', name: 'Travel', color: '#14b8a6', icon: 'global' },
  { type: 'expense', name: 'Education', color: '#3b82f6', icon: 'book' },
  { type: 'expense', name: 'Subscriptions', color: '#8b5cf6', icon: 'sync' },
  { type: 'expense', name: 'Other', color: '#64748b', icon: 'tag' },
  { type: 'income', name: 'Salary', color: '#16a34a', icon: 'bank' },
  { type: 'income', name: 'Freelance', color: '#0d9488', icon: 'laptop' },
  { type: 'income', name: 'Investments', color: '#2563eb', icon: 'rise' },
  { type: 'income', name: 'Gifts', color: '#db2777', icon: 'gift' },
  { type: 'income', name: 'Other income', color: '#64748b', icon: 'tag' },
];

async function createDefaultCategories(userId) {
  await Category.insertMany(DEFAULT_CATEGORIES.map((c) => ({ ...c, user: userId })));
}

module.exports = { DEFAULT_CATEGORIES, createDefaultCategories };
