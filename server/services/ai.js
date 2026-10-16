const env = require('../config/env');

// Talks to a local Ollama server, so transaction data never leaves the user's computer.

// Small batches keep a 3B model accurate (13/15 correct in testing, vs 11/15 with 15 rows at once).
const BATCH_SIZE = 5;

async function chat(messages, format) {
  const res = await fetch(`${env.ollama.url}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.ollama.model,
      messages,
      format,
      stream: false,
      // Keep the model in memory between requests; loading it takes up to a minute.
      keep_alive: '30m',
      options: { temperature: 0 },
    }),
    signal: AbortSignal.timeout(env.ollama.timeoutMs),
  });
  if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
  const body = await res.json();
  return body.message?.content ?? '';
}

/** Is Ollama running, and is the configured model downloaded? */
async function status() {
  try {
    const res = await fetch(`${env.ollama.url}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { available: false, model: env.ollama.model, reason: 'Ollama is not responding.' };
    const { models = [] } = await res.json();
    const installed = models.some((m) => m.name === env.ollama.model || m.name === `${env.ollama.model}:latest`);
    return installed
      ? { available: true, model: env.ollama.model }
      : { available: false, model: env.ollama.model, reason: `Run "ollama pull ${env.ollama.model}" first.` };
  } catch {
    return { available: false, model: env.ollama.model, reason: 'Ollama is not running. Start it and try again.' };
  }
}

const categorizeFormat = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          category: { type: 'string' },
          business: { type: 'boolean' },
        },
        required: ['id', 'category', 'business'],
      },
    },
  },
  required: ['results'],
};

function categorizePrompt(rows, categories) {
  const names = (type) => categories.filter((c) => c.type === type).map((c) => c.name).join(', ');
  const lines = rows.map((r) => `${r.id}. [${r.type}] ${r.amount} | ${r.description || '(no description)'}`).join('\n');
  return [
    {
      role: 'system',
      content:
        'You sort bank transactions for a freelancer. For each transaction pick exactly one category from the allowed list for its type. ' +
        'Set "business" to true only when the expense is likely a business cost a freelancer could deduct (software, equipment, ' +
        'coworking, client travel, professional services, advertising). Income is never business. ' +
        'Only use "Other" or "Other income" when nothing else fits.\n\n' +
        'Examples:\n' +
        '- "ADOBE *CREATIVE CLOUD", "FIGMA" or "GITHUB" -> Subscriptions, business true (software tools)\n' +
        '- "NETFLIX.COM" -> Subscriptions or Entertainment, business false\n' +
        '- "STRIPE PAYOUT" or "PAYPAL TRANSFER FROM CLIENT" (income) -> Freelance\n' +
        '- "PAYROLL ACME INC" (income) -> Salary\n' +
        '- "SHELL OIL 5521" or "UBER TRIP" -> Transport, business false unless it mentions a client\n' +
        '- "DELTA AIR" or "MARRIOTT" -> Travel\n' +
        '- "CVS PHARMACY" or "WALGREENS" -> Health\n' +
        '- "WEWORK" or "COWORKING" -> Rent & Housing or Other, business true\n' +
        '- "WHOLE FOODS" or "TRADER JOE\'S" -> Groceries, business false\n\n' +
        'Answer with JSON only.',
    },
    {
      role: 'user',
      content:
        `Expense categories: ${names('expense')}\nIncome categories: ${names('income')}\n\n` +
        `Transactions (id. [type] amount | description):\n${lines}`,
    },
  ];
}

/**
 * Suggests a category (and a possible-business-expense flag) for each row.
 * Answers that name an unknown category, or that the model skipped, keep the row's original category.
 */
async function categorize(rows, categories) {
  const allowed = new Set(categories.map((c) => `${c.type}:${c.name}`));
  const suggestions = [];

  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE).map((r, i) => ({ ...r, id: start + i }));
    const content = await chat(categorizePrompt(batch, categories), categorizeFormat);
    let results = [];
    try {
      results = JSON.parse(content).results ?? [];
    } catch {
      results = [];
    }
    const byId = new Map(results.map((r) => [r.id, r]));

    for (const row of batch) {
      const answer = byId.get(row.id);
      const valid = answer && allowed.has(`${row.type}:${answer.category}`);
      suggestions.push({
        index: row.id,
        category: valid ? answer.category : row.category,
        business: row.type === 'expense' && Boolean(answer?.business),
        changed: Boolean(valid && answer.category !== row.category),
      });
    }
  }
  return suggestions;
}

/**
 * Turns one month of totals into plain facts. Small models are unreliable at arithmetic and comparisons,
 * so every number and judgement is worked out here and the model only has to phrase it.
 */
function monthFacts(month) {
  const s = month.currencySymbol;
  const money = (n) => `${s}${Math.round(n).toLocaleString('en-US')}`;
  const facts = [`In ${month.label} you earned ${money(month.income)} and spent ${money(month.expense)}, leaving ${money(month.balance)}.`];

  const before = month.previous.expense;
  if (before > 0) {
    const change = Math.round(((month.expense - before) / before) * 100);
    facts.push(
      change === 0
        ? `Spending was the same as last month (${money(before)}).`
        : `Spending was ${Math.abs(change)}% ${change > 0 ? 'higher' : 'lower'} than last month (${money(before)}).`,
    );
  }

  const top = month.byCategory.slice(0, 3);
  if (top.length) {
    const share = (c) => (month.expense > 0 ? Math.round((c.amount / month.expense) * 100) : 0);
    facts.push(`The biggest spending categories were ${top.map((c) => `${c.category} (${money(c.amount)}, ${share(c)}% of spending)`).join(', ')}.`);
  }

  const over = month.budgets.filter((b) => b.percent >= 100);
  const near = month.budgets.filter((b) => b.percent >= 80 && b.percent < 100);
  const used = (b) => `${b.category} has used ${b.percent}% of its monthly budget`;
  if (over.length) facts.push(`Over budget: ${over.map(used).join(', ')}.`);
  if (near.length) facts.push(`Close to the budget limit: ${near.map(used).join(', ')}.`);
  if (month.budgets.length && !over.length && !near.length) facts.push('Every budget is comfortably under its limit.');

  if (month.business > 0) facts.push(`${money(month.business)} was marked as possible business expenses.`);
  return facts;
}

/** Writes a short plain-English summary of one month from totals only (no raw transactions are sent). */
async function summarize(month) {
  const facts = monthFacts(month);
  const text = await chat([
    {
      role: 'system',
      content:
        'You are a friendly personal finance assistant. Rewrite the facts below as 3 to 4 short, warm sentences, ' +
        'then add one practical tip based on them. Use only the numbers and statements given, exactly as written. ' +
        'Do not calculate anything, do not add new numbers, and do not say a category is over budget unless the facts say so. ' +
        'Start directly with the summary. Do not write an introduction such as "Here is" or "Here are".',
    },
    { role: 'user', content: facts.join('\n') },
  ]);
  // Small models sometimes still add a lead-in line; drop it.
  return text.replace(/^\s*here (is|are)[^\n]*:\s*/i, '').trim();
}

module.exports = { status, categorize, summarize, monthFacts, BATCH_SIZE };
