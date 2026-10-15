const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Only the bcrypt hash is stored, never the password itself.
    passwordHash: { type: String, required: true, select: false },
    currency: { type: String, default: 'USD', uppercase: true, minlength: 3, maxlength: 3 },
    // One-time code for "forgot password", stored hashed with an expiry.
    resetCodeHash: { type: String, select: false },
    resetCodeExpires: { type: Date, select: false },
    resetAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true },
);

userSchema.methods.toPublic = function toPublic() {
  return { id: this._id.toString(), name: this.name, email: this.email, currency: this.currency, createdAt: this.createdAt };
};

module.exports = mongoose.model('User', userSchema);
