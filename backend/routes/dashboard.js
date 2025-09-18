const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDashboardSummary, getCumulativeSavings, getMonthlyCategoryExpenses } = require('../controllers/dashboardController');

// @route   GET api/dashboard/summary
// @desc    Get aggregated dashboard summary
// @access  Private
router.get('/summary', auth, getDashboardSummary);

// @route   GET api/dashboard/cumulative-savings
// @desc    Get cumulative savings growth
// @access  Private
router.get('/cumulative-savings', auth, getCumulativeSavings);

// @route   GET api/dashboard/monthly-category-expenses
// @desc    Get monthly expenses by category
// @access  Private
router.get('/monthly-category-expenses', auth, getMonthlyCategoryExpenses);


module.exports = router;
