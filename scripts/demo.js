/**
 * Runs the API with a temporary in-memory MongoDB and a demo account full of
 * sample data. No database setup needed. Data is lost when you stop it.
 *
 *   npm run demo        then log in as demo@expenso.app / demo12345
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET ||= crypto.randomBytes(32).toString('hex');

const env = require('../server/config/env');
const { connectDb } = require('../server/config/db');
const { createApp } = require('../server/app');
const User = require('../server/models/User');
const Transaction = require('../server/models/Transaction');
const Budget = require('../server/models/Budget');
const Recurring = require('../server/models/Recurring');
const { createDefaultCategories } = require('../server/services/defaults');

const DEMO = { email: 'demo@expenso.app', password: 'demo12345' };

function utcDay(y, m, d) {
  return new Date(Date.UTC(y, m, d));
}

async function seed() {
  const user = await User.create({ name: 'Demo User', email: DEMO.email, passwordHash: await bcrypt.hash(DEMO.password, 10) });
  await createDefaultCategories(user._id);

  const now = new Date();
  const txs = [];
  const rand = (a, b) => Math.round((a + Math.random() * (b - a)) * 100) / 100;
  // Six months of realistic history.
  for (let back = 5; back >= 0; back--) {
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth() - back;
    const lastDay = back === 0 ? now.getUTCDate() : 28;
    const add = (day, type, category, amount, description) => {
      if (day <= lastDay) txs.push({ user: user._id, type, category, amount, description, date: utcDay(y, m, day) });
    };
    add(1, 'income', 'Salary', 5200, 'Monthly salary');
    if (back % 2 === 0) add(14, 'income', 'Freelance', rand(400, 900), 'Website project');
    add(3, 'expense', 'Rent & Housing', 1650, 'Apartment rent');
    add(5, 'expense', 'Utilities', rand(90, 140), 'Electricity and internet');
    add(8, 'expense', 'Subscriptions', 15.99, 'Netflix');
    add(8, 'expense', 'Subscriptions', 10.99, 'Spotify');
    for (const d of [2, 9, 16, 23]) add(d, 'expense', 'Groceries', rand(55, 140), d % 2 ? 'Costco' : 'Trader Joe’s');
    for (const d of [4, 11, 18, 25]) add(d, 'expense', 'Food & Dining', rand(18, 75), d === 18 ? 'Dinner with friends' : 'Lunch out');
    for (const d of [6, 20]) add(d, 'expense', 'Transport', rand(30, 60), 'Gas');
    add(12, 'expense', 'Shopping', rand(40, 220), 'Clothes');
    add(21, 'expense', 'Entertainment', rand(20, 80), 'Movie night');
    if (back === 2) add(15, 'expense', 'Travel', 640, 'Flight home');
    if (back === 4) add(10, 'expense', 'Health', 120, 'Dentist');
  }
  await Transaction.insertMany(txs);

  await Budget.insertMany([
    { user: user._id, category: 'Groceries', limit: 450 },
    { user: user._id, category: 'Food & Dining', limit: 200 },
    { user: user._id, category: 'Shopping', limit: 150 },
    { user: user._id, category: 'Entertainment', limit: 100 },
  ]);

  const nextMonth = utcDay(now.getUTCFullYear(), now.getUTCMonth() + 1, 3);
  await Recurring.create({
    user: user._id, type: 'expense', amount: 1650, category: 'Rent & Housing', description: 'Apartment rent',
    frequency: 'monthly', nextDate: nextMonth, anchorDay: 3,
  });
  await Recurring.create({
    user: user._id, type: 'income', amount: 5200, category: 'Salary', description: 'Monthly salary',
    frequency: 'monthly', nextDate: utcDay(now.getUTCFullYear(), now.getUTCMonth() + 1, 1), anchorDay: 1,
  });
  return txs.length;
}

async function main() {
  const mongo = await MongoMemoryServer.create();
  await connectDb(mongo.getUri());
  const count = await seed();
  createApp().listen(env.port, () => {
    console.log(`\nExpenso demo API on http://localhost:${env.port} (in-memory database, ${count} sample transactions)`);
    console.log(`Log in with ${DEMO.email} / ${DEMO.password}\n`);
  });
  const stop = async () => {
    await mongo.stop();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
