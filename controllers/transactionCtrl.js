const transactionModel = require('../models/transactionModel');
const moment = require('moment');

const getAllTransaction = async (req, res) => {
    try {
        const { frequency, selectedDate, type, userid } = req.body;

        let filter = { userid };

        if (frequency !== 'all') {
            if (frequency === 'custom' && selectedDate && selectedDate.length === 2) {
                filter.date = {
                    $gte: new Date(selectedDate[0]),
                    $lte: new Date(selectedDate[1]),
                };
            } else {
                filter.date = {
                    $gt: moment().subtract(Number(frequency), 'd').toDate(),
                };
            }
        }

        if (type !== 'all') {
            filter.type = type;
        }

        const transactions = await transactionModel.find(filter);

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
};


const deleteTransaction = async (req, res) => {
    try {
        await transactionModel.findOneAndDelete({ _id: req.body.transactionId });
        res.status(200).send('Transaction Deleted successfully');
    } catch (error) {
        console.error('Error deleting transaction:', error.message);
        res.status(500).json({ message: 'Error deleting transaction', error: error.message });
    }
};

const editTransaction = async (req, res) => {
    try {
        const { payload, transactionId } = req.body;
        await transactionModel.findOneAndUpdate({ _id: transactionId }, payload);
        res.status(200).send('Edit Successful');
    } catch (error) {
        console.error('Error editing transaction:', error.message);
        res.status(500).json({ message: 'Error editing transaction', error: error.message });
    }
};


const addTransaction = async (req, res) => {
    try {
        console.log('Request Body for Adding Transaction:', req.body);
        const newTransaction = new transactionModel(req.body);
        await newTransaction.save();
        res.status(201).send('Transaction created');
    } catch (error) {
        console.error('Error adding transaction:', error.message);
        res.status(500).json({ message: 'Error adding transaction', error: error.message });
    }
};

module.exports = { getAllTransaction, addTransaction, editTransaction, deleteTransaction };
