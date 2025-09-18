const mongoose = require('mongoose');
const Transaction = require('../models/transactions');
const Saving = require('../models/Saving');

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const savingsSummary = await Saving.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalSavings: { $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', { $multiply: ['$amount', -1] }] } } } }
    ]);

    const monthlyData = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month"
          },
          monthlyTotals: {
            $push: {
              type: "$_id.type",
              total: "$total"
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const labels = monthlyData.map(d => `${d._id.month}/${d._id.year}`);
    const incomeData = monthlyData.map(d => d.monthlyTotals.find(t => t.type === 'income')?.total || 0);
    const expenseData = monthlyData.map(d => d.monthlyTotals.find(t => t.type === 'expense')?.total || 0);

    const totalIncome = incomeData.reduce((acc, val) => acc + val, 0);
    const totalExpenses = expenseData.reduce((acc, val) => acc + val, 0);

    const categorySpendingData = await Transaction.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), type: 'expense' } },
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

exports.getCumulativeSavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 12;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const monthlyChanges = await Saving.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          netChange: { $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', { $multiply: ['$amount', -1] }] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const labels = [];
    const values = [];
    let cumulativeTotal = 0;

    const monthMap = new Map(monthlyChanges.map(item => [`${item._id.year}-${item._id.month}`, item.netChange]));

    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      labels.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
      
      const key = `${year}-${month}`;
      if (monthMap.has(key)) {
        cumulativeTotal += monthMap.get(key);
      }
      values.push(cumulativeTotal);
    }

    res.status(200).json({
      success: true,
      data: { labels, values },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      detail: err.message,
    });
  }
};

exports.getMonthlyCategoryExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 12;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.category': 1 } },
    ]);

    if (expenses.length === 0) {
      return res.status(200).json({
        success: true,
        data: { labels: [], categories: [], datasets: [] },
      });
    }

    const labels = [];
    const categoryData = {};
    const allCategories = [...new Set(expenses.map(e => e._id.category))];

    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      labels.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }

    allCategories.forEach(category => {
      categoryData[category] = new Array(months).fill(0);
    });

    expenses.forEach(expense => {
      const label = new Date(expense._id.year, expense._id.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
      const index = labels.indexOf(label);
      if (index !== -1) {
        categoryData[expense._id.category][index] = expense.total;
      }
    });

    const datasets = allCategories.map(category => ({
      label: category,
      data: categoryData[category],
    }));

    res.status(200).json({
      success: true,
      data: {
        labels,
        categories: allCategories,
        datasets,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      detail: err.message,
    });
  }
};
