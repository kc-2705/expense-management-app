const express = require('express');
const { addTransaction, getAllTransaction, editTransaction, deleteTransaction } = require('../controllers/transactionCtrl');

const router = express.Router();

// POST route for adding transaction
router.post('/add-transaction', addTransaction);

// POST route for Editing transaction
router.post('/edit-transaction', editTransaction);

// POST route for deleting transaction
router.post('/delete-transaction', deleteTransaction);

// POST route for getting all transactions
router.post('/get-transaction', getAllTransaction);

module.exports = router;
