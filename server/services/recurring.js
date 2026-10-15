const Recurring = require('../models/Recurring');
const Transaction = require('../models/Transaction');
const { advance } = require('../utils/dates');

const MAX_PER_RULE = 120; // safety cap: about 10 years of monthly entries

/**
 * Creates any transactions that recurring rules owe up to today.
 * Runs when the user opens their data, so no background job is needed.
 */
async function applyRecurring(userId, now = new Date()) {
  const due = await Recurring.find({ user: userId, active: true, nextDate: { $lte: now } });
  let created = 0;
  for (const rule of due) {
    const docs = [];
    let next = rule.nextDate;
    while (next <= now && docs.length < MAX_PER_RULE) {
      docs.push({
        user: userId,
        type: rule.type,
        amount: rule.amount,
        category: rule.category,
        description: rule.description,
        date: next,
        recurring: rule._id,
      });
      next = advance(next, rule.frequency, rule.anchorDay);
    }
    if (docs.length) await Transaction.insertMany(docs);
    rule.nextDate = next;
    await rule.save();
    created += docs.length;
  }
  return created;
}

module.exports = { applyRecurring };
