const { describe, test, afterEach } = require('node:test');
const { expect } = require('expect');
const ai = require('../server/services/ai');

// These tests replace fetch with a fake Ollama, so they run without a model installed.
const realFetch = global.fetch;
afterEach(() => {
  global.fetch = realFetch;
});

const json = (body, ok = true) => Promise.resolve({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) });

function fakeOllama(answerFor) {
  const calls = [];
  global.fetch = (url, options) => {
    const body = JSON.parse(options.body);
    calls.push(body);
    const batch = body.messages[1].content.split('\n').filter((l) => /^\d+\. /.test(l)).map((l) => Number(l.split('.')[0]));
    return json({ message: { content: JSON.stringify({ results: batch.map(answerFor) }) } });
  };
  return calls;
}

const categories = [
  { type: 'expense', name: 'Groceries' },
  { type: 'expense', name: 'Subscriptions' },
  { type: 'expense', name: 'Other' },
  { type: 'income', name: 'Freelance' },
  { type: 'income', name: 'Other income' },
];

describe('AI categorize', () => {
  test('applies valid suggestions and keeps the original category for unknown ones', async () => {
    fakeOllama((id) =>
      [
        { id, category: 'Subscriptions', business: true },
        { id, category: 'Made Up Category', business: false },
        { id, category: 'Freelance', business: true },
      ][id],
    );
    const rows = [
      { type: 'expense', amount: 54.99, category: 'Other', description: 'ADOBE' },
      { type: 'expense', amount: 10, category: 'Other', description: 'SOMETHING' },
      { type: 'income', amount: 2500, category: 'Other income', description: 'STRIPE PAYOUT' },
    ];
    const result = await ai.categorize(rows, categories);

    expect(result[0]).toEqual({ index: 0, category: 'Subscriptions', business: true, changed: true });
    expect(result[1]).toEqual({ index: 1, category: 'Other', business: false, changed: false });
    // Income is never flagged as a business expense, even if the model says so.
    expect(result[2]).toEqual({ index: 2, category: 'Freelance', business: false, changed: true });
  });

  test('sends rows in small batches and keeps every row in order', async () => {
    const calls = fakeOllama((id) => ({ id, category: 'Groceries', business: false }));
    const rows = Array.from({ length: 12 }, (_, i) => ({ type: 'expense', amount: i + 1, category: 'Other', description: `ROW ${i}` }));
    const result = await ai.categorize(rows, categories);

    expect(calls).toHaveLength(Math.ceil(12 / ai.BATCH_SIZE));
    expect(result.map((r) => r.index)).toEqual(rows.map((_, i) => i));
    expect(result.every((r) => r.category === 'Groceries')).toBe(true);
  });

  test('survives an answer that is not valid JSON', async () => {
    global.fetch = () => json({ message: { content: 'not json' } });
    const result = await ai.categorize([{ type: 'expense', amount: 5, category: 'Other', description: 'X' }], categories);
    expect(result).toEqual([{ index: 0, category: 'Other', business: false, changed: false }]);
  });
});

describe('AI status', () => {
  test('reports when Ollama is not running', async () => {
    global.fetch = () => Promise.reject(new Error('ECONNREFUSED'));
    const s = await ai.status();
    expect(s.available).toBe(false);
    expect(s.reason).toMatch(/not running/);
  });

  test('reports when the model has not been downloaded', async () => {
    global.fetch = () => json({ models: [{ name: 'some-other-model:latest' }] });
    const s = await ai.status();
    expect(s.available).toBe(false);
    expect(s.reason).toMatch(/ollama pull/);
  });

  test('is available when the model is installed', async () => {
    global.fetch = () => json({ models: [{ name: 'llama3.2:3b' }] });
    expect((await ai.status()).available).toBe(true);
  });
});

describe('AI month facts', () => {
  test('works out the comparisons in code so the model cannot get them wrong', () => {
    const facts = ai.monthFacts({
      label: 'October 2026',
      currencySymbol: '$',
      income: 9757.38,
      expense: 4914.67,
      balance: 4842.71,
      previous: { income: 5200, expense: 2538.09 },
      byCategory: [
        { category: 'Rent & Housing', amount: 3229 },
        { category: 'Shopping', amount: 338 },
        { category: 'Travel', amount: 312 },
        { category: 'Groceries', amount: 306 },
      ],
      business: 183.99,
      budgets: [
        { category: 'Food & Dining', percent: 118 },
        { category: 'Groceries', percent: 68 },
        { category: 'Shopping', percent: 225 },
        { category: 'Entertainment', percent: 85 },
      ],
    }).join(' ');

    expect(facts).toContain('Spending was 94% higher than last month ($2,538)');
    expect(facts).toContain('Rent & Housing ($3,229, 66% of spending)');
    expect(facts).toContain('Over budget: Food & Dining has used 118% of its monthly budget, Shopping has used 225% of its monthly budget');
    expect(facts).toContain('Close to the budget limit: Entertainment has used 85% of its monthly budget');
    expect(facts).not.toContain('Groceries has used');
    expect(facts).toContain('$184 was marked as possible business expenses');
  });
});
