const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const Recurring = require('../models/Recurring');
const env = require('../config/env');
const { signToken } = require('../middleware/auth');
const { HttpError } = require('../middleware/errors');
const { createDefaultCategories } = require('../services/defaults');
const { sendResetCode } = require('../services/mailer');

const email = z.email('Enter a valid email address.').transform((s) => s.toLowerCase().trim());
const password = z.string().min(8, 'Password must be at least 8 characters.').max(100);

const registerSchema = z.object({ name: z.string().trim().min(1, 'Name is required.').max(60), email, password });
const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required.') });
const profileSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  currency: z.string().length(3).toUpperCase().optional(),
});
const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: password });
const forgotSchema = z.object({ email });
const resetSchema = z.object({ email, code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.'), newPassword: password });

const RESET_MINUTES = 15;
const MAX_RESET_ATTEMPTS = 5;

const session = (user) => ({ token: signToken(user._id), user: user.toPublic() });

async function register(req, res) {
  const data = registerSchema.parse(req.body);
  if (await User.exists({ email: data.email })) throw new HttpError(409, 'An account with this email already exists.');
  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash: await bcrypt.hash(data.password, 12),
  });
  await createDefaultCategories(user._id);
  res.status(201).json(session(user));
}

async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ email: data.email }).select('+passwordHash');
  // Same message for unknown email and wrong password, so attackers can't find out which emails exist.
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }
  res.json(session(user));
}

async function me(req, res) {
  const user = await User.findById(req.userId);
  if (!user) throw new HttpError(401, 'Please log in.');
  res.json({ user: user.toPublic() });
}

async function updateProfile(req, res) {
  const data = profileSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.userId, data, { returnDocument: 'after', runValidators: true });
  res.json({ user: user.toPublic() });
}

async function changePassword(req, res) {
  const data = changePasswordSchema.parse(req.body);
  const user = await User.findById(req.userId).select('+passwordHash');
  if (!(await bcrypt.compare(data.currentPassword, user.passwordHash))) {
    throw new HttpError(400, 'Your current password is incorrect.');
  }
  user.passwordHash = await bcrypt.hash(data.newPassword, 12);
  await user.save();
  res.json({ message: 'Password changed.' });
}

async function forgotPassword(req, res) {
  const { email: address } = forgotSchema.parse(req.body);
  const user = await User.findOne({ email: address });
  const reply = { message: 'If that email has an account, we sent a 6-digit code to it.' };
  if (!user) return res.json(reply);

  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  await User.updateOne(
    { _id: user._id },
    {
      resetCodeHash: await bcrypt.hash(code, 10),
      resetCodeExpires: new Date(Date.now() + RESET_MINUTES * 60_000),
      resetAttempts: 0,
    },
  );
  const sent = await sendResetCode(address, code);
  // Without an email server (local demo), show the code so the flow can still be tried.
  if (!sent && !env.isProd) {
    if (!env.isTest) console.log(`[dev] Password reset code for ${address}: ${code}`);
    return res.json({ ...reply, devCode: code });
  }
  return res.json(reply);
}

async function resetPassword(req, res) {
  const data = resetSchema.parse(req.body);
  const user = await User.findOne({ email: data.email }).select('+resetCodeHash +resetCodeExpires +resetAttempts');
  const invalid = new HttpError(400, 'That code is wrong or has expired. Ask for a new one.');
  if (!user?.resetCodeHash || !user.resetCodeExpires || user.resetCodeExpires < new Date()) throw invalid;
  if (user.resetAttempts >= MAX_RESET_ATTEMPTS) throw invalid;
  if (!(await bcrypt.compare(data.code, user.resetCodeHash))) {
    user.resetAttempts += 1;
    await user.save();
    throw invalid;
  }
  user.passwordHash = await bcrypt.hash(data.newPassword, 12);
  user.resetCodeHash = undefined;
  user.resetCodeExpires = undefined;
  user.resetAttempts = 0;
  await user.save();
  res.json(session(user));
}

async function deleteAccount(req, res) {
  const user = req.userId;
  await Promise.all([
    Transaction.deleteMany({ user }),
    Category.deleteMany({ user }),
    Budget.deleteMany({ user }),
    Recurring.deleteMany({ user }),
  ]);
  await User.deleteOne({ _id: user });
  res.status(204).end();
}

module.exports = { register, login, me, updateProfile, changePassword, forgotPassword, resetPassword, deleteAccount };
