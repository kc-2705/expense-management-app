const mongoose = require('mongoose');

// A rule that adds the same transaction on a schedule (rent, salary, subscriptions).
const recurringSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true, maxlength: 200 },
    frequency: { type: String, enum: ['weekly', 'monthly', 'yearly'], required: true },
    // The next date a transaction should be created for.
    nextDate: { type: Date, required: true },
    // Day of month the rule started on, so monthly dates don't drift after short months.
    anchorDay: { type: Number, min: 1, max: 31 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Recurring', recurringSchema);
