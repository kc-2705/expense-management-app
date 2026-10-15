const express = require('express');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { requireAuth } = require('./middleware/auth');
const auth = require('./controllers/authController');
const transactions = require('./controllers/transactionController');
const categories = require('./controllers/categoryController');
const budgets = require('./controllers/budgetController');
const recurring = require('./controllers/recurringController');
const { summary } = require('./controllers/summaryController');

const router = express.Router();

// Slows down password guessing and reset-code guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isTest ? 1000 : 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

router.get('/health', (req, res) => res.json({ ok: true }));

// Public
router.post('/auth/register', authLimiter, auth.register);
router.post('/auth/login', authLimiter, auth.login);
router.post('/auth/forgot-password', authLimiter, auth.forgotPassword);
router.post('/auth/reset-password', authLimiter, auth.resetPassword);

// Everything below needs a signed-in user.
router.use(requireAuth);

router.get('/auth/me', auth.me);
router.put('/auth/me', auth.updateProfile);
router.put('/auth/password', auth.changePassword);
router.delete('/auth/me', auth.deleteAccount);

router.get('/transactions', transactions.list);
router.post('/transactions', transactions.create);
router.post('/transactions/import', transactions.importRows);
router.put('/transactions/:id', transactions.update);
router.delete('/transactions/:id', transactions.remove);

router.get('/categories', categories.list);
router.post('/categories', categories.create);
router.put('/categories/:id', categories.update);
router.delete('/categories/:id', categories.remove);

router.get('/budgets', budgets.list);
router.put('/budgets', budgets.upsert);
router.delete('/budgets/:id', budgets.remove);

router.get('/recurring', recurring.list);
router.post('/recurring', recurring.create);
router.put('/recurring/:id', recurring.update);
router.delete('/recurring/:id', recurring.remove);

router.get('/summary', summary);

module.exports = router;
