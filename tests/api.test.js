process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const { describe, test, before, after, beforeEach } = require('node:test');
const { expect } = require('expect');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createApp } = require('../server/app');
const { connectDb, disconnectDb } = require('../server/config/db');
const User = require('../server/models/User');
const { advance } = require('../server/utils/dates');

let mongo;
let app;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDb(mongo.getUri());
  app = createApp();
});

after(async () => {
  await disconnectDb();
  await mongo.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

const thisMonth = new Date().toISOString().slice(0, 7);
const today = new Date().toISOString().slice(0, 10);

async function signUp(email = 'kavya@example.com') {
  const res = await request(app).post('/api/v1/auth/register').send({ name: 'Kavya', email, password: 'secret123' });
  expect(res.status).toBe(201);
  return { token: res.body.token, auth: { Authorization: `Bearer ${res.body.token}` } };
}

describe('accounts', () => {
  test('register hashes the password and never returns it', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ name: 'Kavya', email: 'K@Example.com', password: 'secret123' });
    expect(res.status).toBe(201);
    expect(res.body.user).toEqual(expect.objectContaining({ email: 'k@example.com', currency: 'USD' }));
    expect(JSON.stringify(res.body)).not.toContain('secret123');
    const stored = await User.findOne({ email: 'k@example.com' }).select('+passwordHash');
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  test('register creates default categories', async () => {
    const { auth } = await signUp();
    const res = await request(app).get('/api/v1/categories').set(auth);
    expect(res.body.length).toBeGreaterThan(10);
  });

  test('rejects duplicate emails and short passwords', async () => {
    await signUp();
    const dup = await request(app).post('/api/v1/auth/register').send({ name: 'X', email: 'kavya@example.com', password: 'secret123' });
    expect(dup.status).toBe(409);
    const weak = await request(app).post('/api/v1/auth/register').send({ name: 'X', email: 'x@example.com', password: '123' });
    expect(weak.status).toBe(400);
  });

  test('login gives the same message for a wrong password and an unknown email', async () => {
    await signUp();
    const wrong = await request(app).post('/api/v1/auth/login').send({ email: 'kavya@example.com', password: 'nope-nope' });
    const unknown = await request(app).post('/api/v1/auth/login').send({ email: 'who@example.com', password: 'nope-nope' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.message).toBe(unknown.body.message);
    const ok = await request(app).post('/api/v1/auth/login').send({ email: 'kavya@example.com', password: 'secret123' });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();
  });

  test('data routes need a valid token', async () => {
    expect((await request(app).get('/api/v1/transactions')).status).toBe(401);
    expect((await request(app).get('/api/v1/transactions').set({ Authorization: 'Bearer bad' })).status).toBe(401);
  });

  test('password reset needs the emailed code', async () => {
    await signUp();
    const forgot = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'kavya@example.com' });
    expect(forgot.status).toBe(200);
    expect(forgot.body.devCode).toMatch(/^\d{6}$/);
    const wrongCode = forgot.body.devCode === '000000' ? '111111' : '000000';
    const bad = await request(app).post('/api/v1/auth/reset-password').send({ email: 'kavya@example.com', code: wrongCode, newPassword: 'newsecret1' });
    expect(bad.status).toBe(400);
    const good = await request(app).post('/api/v1/auth/reset-password').send({ email: 'kavya@example.com', code: forgot.body.devCode, newPassword: 'newsecret1' });
    expect(good.status).toBe(200);
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'kavya@example.com', password: 'newsecret1' });
    expect(login.status).toBe(200);
    // The code works only once.
    const reuse = await request(app).post('/api/v1/auth/reset-password').send({ email: 'kavya@example.com', code: forgot.body.devCode, newPassword: 'another12' });
    expect(reuse.status).toBe(400);
  });

  test('unknown email on forgot password looks the same', async () => {
    const res = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'nobody@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.devCode).toBeUndefined();
  });
});

describe('transactions', () => {
  test('users can only see and change their own transactions', async () => {
    const a = await signUp('a@example.com');
    const b = await signUp('b@example.com');
    const created = await request(app).post('/api/v1/transactions').set(a.auth)
      .send({ type: 'expense', amount: 42, category: 'Groceries', description: 'Costco', date: today });
    expect(created.status).toBe(201);
    const id = created.body._id;

    expect((await request(app).get('/api/v1/transactions').set(b.auth)).body.total).toBe(0);
    const edit = await request(app).put(`/api/v1/transactions/${id}`).set(b.auth)
      .send({ type: 'expense', amount: 1, category: 'Groceries', date: today });
    expect(edit.status).toBe(404);
    expect((await request(app).delete(`/api/v1/transactions/${id}`).set(b.auth)).status).toBe(404);

    const list = await request(app).get('/api/v1/transactions').set(a.auth);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0].amount).toBe(42);
  });

  test('filters, search, sorting and paging', async () => {
    const { auth } = await signUp();
    const rows = [
      { type: 'expense', amount: 10, category: 'Groceries', description: 'Milk', date: '2026-01-05' },
      { type: 'expense', amount: 80, category: 'Shopping', description: 'Shoes', date: '2026-01-10' },
      { type: 'income', amount: 500, category: 'Salary', description: 'Pay', date: '2026-01-01' },
    ];
    expect((await request(app).post('/api/v1/transactions/import').set(auth).send({ rows })).status).toBe(201);
    const expenses = await request(app).get('/api/v1/transactions?type=expense&sort=-amount').set(auth);
    expect(expenses.body.items.map((t) => t.amount)).toEqual([80, 10]);
    expect(expenses.body.totals).toEqual({ income: 0, expense: 90 });
    const search = await request(app).get('/api/v1/transactions?q=sho').set(auth);
    expect(search.body.items).toHaveLength(1);
    const range = await request(app).get('/api/v1/transactions?from=2026-01-05&to=2026-01-05').set(auth);
    expect(range.body.items.map((t) => t.description)).toEqual(['Milk']);
    const page = await request(app).get('/api/v1/transactions?limit=2&page=2').set(auth);
    expect(page.body.items).toHaveLength(1);
  });

  test('rejects bad input with a clear message', async () => {
    const { auth } = await signUp();
    const res = await request(app).post('/api/v1/transactions').set(auth).send({ type: 'expense', amount: -5, category: 'Groceries', date: today });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/amount/i);
  });
});

describe('dashboard, budgets and recurring', () => {
  test('summary adds up the month', async () => {
    const { auth } = await signUp();
    await request(app).post('/api/v1/transactions').set(auth).send({ type: 'income', amount: 1000, category: 'Salary', date: today });
    await request(app).post('/api/v1/transactions').set(auth).send({ type: 'expense', amount: 300, category: 'Groceries', date: today });
    const res = await request(app).get(`/api/v1/summary?month=${thisMonth}`).set(auth);
    expect(res.body).toEqual(expect.objectContaining({ income: 1000, expense: 300, balance: 700, savingsRate: 70 }));
    expect(res.body.byCategory[0]).toEqual(expect.objectContaining({ category: 'Groceries', amount: 300 }));
    expect(res.body.trend).toHaveLength(6);
    expect(res.body.trend.at(-1)).toEqual({ month: thisMonth, income: 1000, expense: 300 });
  });

  test('budgets show progress and warn when over', async () => {
    const { auth } = await signUp();
    await request(app).put('/api/v1/budgets').set(auth).send({ category: 'Groceries', limit: 400 });
    await request(app).post('/api/v1/transactions').set(auth).send({ type: 'expense', amount: 300, category: 'Groceries', date: today });
    let res = await request(app).get('/api/v1/budgets').set(auth);
    expect(res.body.items[0]).toEqual(expect.objectContaining({ spent: 300, percent: 75, status: 'ok' }));
    await request(app).post('/api/v1/transactions').set(auth).send({ type: 'expense', amount: 100, category: 'Groceries', date: today });
    res = await request(app).get('/api/v1/budgets').set(auth);
    expect(res.body.items[0]).toEqual(expect.objectContaining({ spent: 400, percent: 100, status: 'over' }));
  });

  test('recurring rules add the transactions they owe', async () => {
    const { auth } = await signUp();
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCMonth(start.getUTCMonth() - 2);
    const res = await request(app).post('/api/v1/recurring').set(auth).send({
      type: 'expense', amount: 1500, category: 'Rent & Housing', description: 'Rent', frequency: 'monthly',
      nextDate: start.toISOString().slice(0, 10),
    });
    expect(res.status).toBe(201);
    expect(new Date(res.body.nextDate) > new Date()).toBe(true);
    const list = await request(app).get('/api/v1/transactions?category=Rent%20%26%20Housing').set(auth);
    expect(list.body.total).toBe(3);
    // Opening again does not add duplicates.
    expect((await request(app).get('/api/v1/transactions?category=Rent%20%26%20Housing').set(auth)).body.total).toBe(3);
  });

  test('monthly dates keep their day after short months', () => {
    let d = new Date(Date.UTC(2026, 0, 31));
    d = advance(d, 'monthly', 31);
    expect(d.toISOString().slice(0, 10)).toBe('2026-02-28');
    d = advance(d, 'monthly', 31);
    expect(d.toISOString().slice(0, 10)).toBe('2026-03-31');
  });
});

describe('categories', () => {
  test('rename carries over to transactions and budgets; a used category cannot be deleted', async () => {
    const { auth } = await signUp();
    const cats = (await request(app).get('/api/v1/categories').set(auth)).body;
    const groceries = cats.find((c) => c.name === 'Groceries');
    await request(app).post('/api/v1/transactions').set(auth).send({ type: 'expense', amount: 20, category: 'Groceries', date: today });
    await request(app).put('/api/v1/budgets').set(auth).send({ category: 'Groceries', limit: 100 });

    const renamed = await request(app).put(`/api/v1/categories/${groceries._id}`).set(auth).send({ name: 'Food shopping', type: 'expense' });
    expect(renamed.status).toBe(200);
    const tx = (await request(app).get('/api/v1/transactions').set(auth)).body.items[0];
    expect(tx.category).toBe('Food shopping');
    const budget = (await request(app).get('/api/v1/budgets').set(auth)).body.items[0];
    expect(budget.category).toBe('Food shopping');

    const del = await request(app).delete(`/api/v1/categories/${groceries._id}`).set(auth);
    expect(del.status).toBe(409);
  });
});
