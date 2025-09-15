const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const transactionsController = require('../controllers/transactionscontroller');

// @route   GET api/transactions/export
// @desc    Export transactions to CSV
// @access  Private
router.get('/export', auth, transactionsController.exportTransactions);

// @route   GET api/transactions
// @desc    Get all transactions
// @access  Private
router.get('/', auth, transactionsController.getTransactions);

// @route   POST api/transactions
// @desc    Add transaction
// @access  Private
router.post('/', auth, transactionsController.addTransaction);

// @route   PUT api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', auth, transactionsController.updateTransaction);

// @route   DELETE api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', auth, transactionsController.deleteTransaction);

// @route   GET api/transactions/summary
// @desc    Get transaction summary
// @access  Private
router.get('/summary', auth, transactionsController.getTransactionSummary);

// @route   GET api/transactions/monthly-summary
// @desc    Get monthly transaction summary
// @access  Private
router.get('/monthly-summary', auth, transactionsController.getMonthlySummary);

// @route   GET api/transactions/spending-breakdown
// @desc    Get spending breakdown by category
// @access  Private
router.get('/spending-breakdown', auth, transactionsController.getSpendingBreakdown);

// @route   POST api/transactions/seed-sample
// @desc    Seed a sample transaction for the logged-in user
// @access  Private
router.post('/seed-sample', auth, transactionsController.seedSampleTransaction);

// @route   GET api/transactions/category-spending
// @desc    Get spending by category
// @access  Private
router.get('/category-spending', auth, transactionsController.getCategorySpending);

module.exports = router;
