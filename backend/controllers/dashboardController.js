const Transaction = require('../models/transactions');
const Saving = require('../models/Saving');
const Budget = require('../models/Budget');

// @desc    Get aggregated dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const defaultSummary = {
      totalBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
      monthlySummary: { labels: [], incomeData: [], expenseData: [] },
      categorySpending: [],
    };

    const transactions = await Transaction.find({ user: userId });
    const savingsSummary = await Saving.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalSavings: { $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', { $multiply: ['$amount', -1] }] } } } }
    ]);
    
    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          ...defaultSummary,
          totalSavings: savingsSummary.length > 0 ? savingsSummary[0].totalSavings : 0,
        }
      });
    }

    const totalIncome = transactions
      .filter((item) => item.type === 'income')
      .reduce((acc, item) => (acc += item.amount), 0);

    const totalExpenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((acc, item) => (acc += item.amount), 0);

    const monthlyData = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0 };
      }
      if (transaction.type === 'income') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expense += transaction.amount;
      }
      return acc;
    }, {});

    const labels = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));
    const incomeData = labels.map(month => monthlyData[month].income);
    const expenseData = labels.map(month => monthlyData[month].expense);

    const mongoose = require('mongoose');
const Transaction = require('../models/transactions');
const Saving = require('../models/Saving');
const Budget = require('../models/Budget');

// @desc    Get aggregated dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const defaultSummary = {
      totalBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
      monthlySummary: { labels: [], incomeData: [], expenseData: [] },
      categorySpending: [],
    };

    const transactions = await Transaction.find({ user: userId });
    const savingsSummary = await Saving.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalSavings: { $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', { $multiply: ['$amount', -1] }] } } } }
    ]);
    
    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          ...defaultSummary,
          totalSavings: savingsSummary.length > 0 ? savingsSummary[0].totalSavings : 0,
        }
      });
    }

    const totalIncome = transactions
      .filter((item) => item.type === 'income')
      .reduce((acc, item) => (acc += item.amount), 0);

    const totalExpenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((acc, item) => (acc += item.amount), 0);

    const monthlyData = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0 };
      }
      if (transaction.type === 'income') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expense += transaction.amount;
      }
      return acc;
    }, {});

    const labels = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));
    const incomeData = labels.map(month => monthlyData[month].income);
    const expenseData = labels.map(month => monthlyData[month].expense);

    const categorySpendingData = await Transaction.aggregate([
        { $match: { user: require('mongoose').Types.ObjectId(userId), type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $project: { _id: 0, category: '$_id', total: '$total' } },
        { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBalance: totalIncome - totalExpenses,
        totalIncome,
        totalExpenses,
        totalSavings: savingsSummary.length > 0 ? savingsSummary[0].totalSavings : 0,
        monthlySummary: { labels, incomeData, expenseData },
        categorySpending: categorySpendingData,
      },
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      data: {
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        monthlySummary: { labels: [], incomeData: [], expenseData: [] },
        categorySpending: [],
      }
    });
  }
};


    res.status(200).json({
      success: true,
      data: {
        totalBalance: totalIncome - totalExpenses,
        totalIncome,
        totalExpenses,
        totalSavings: savingsSummary.length > 0 ? savingsSummary[0].totalSavings : 0,
        monthlySummary: { labels, incomeData, expenseData },
        categorySpending: categorySpendingData,
      },
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      data: {
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        monthlySummary: { labels: [], incomeData: [], expenseData: [] },
        categorySpending: [],
      }
    });
  }
};
