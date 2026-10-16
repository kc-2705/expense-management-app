const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true, maxlength: 200 },
    date: { type: Date, required: true },
    // Marked by the user (or suggested by the AI assistant) as a possible business expense.
    business: { type: Boolean, default: false },
    // Set when the transaction was created by a recurring rule.
    recurring: { type: mongoose.Schema.Types.ObjectId, ref: 'Recurring' },
  },
  { timestamps: true },
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
