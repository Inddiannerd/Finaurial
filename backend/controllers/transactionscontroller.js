const mongoose = require('mongoose'); // Added mongoose import
const Transaction = require('../models/transactions');
const Budget = require('../models/Budget');
const User = require('../models/User');
const { Parser } = require('json2csv');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 10, search, sort, all } = req.query;
    let query = {};

    if (req.user.role === 'admin' && all === 'true') {
      // Admin can view all transactions
    } else {
      query.user = req.user.id;
    }

    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const sortOptions = {};
    if (sort) {
      const [field, direction] = sort.split(',');
      sortOptions[field] = direction === 'desc' ? -1 : 1;
    } else {
      sortOptions.date = -1;
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      data: transactions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

const updateBudget = async (userId, category, amount) => {
  const budget = await Budget.findOne({ user: userId, category });
  if (budget) {
    budget.spent += amount;
    await budget.save();
  }
};

// @desc    Add transaction
// @route   POST /api/transactions
// @access  Private
exports.addTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, description, date } = req.body;

    if (!date || !new Date(date).getTime()) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid date',
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid amount',
      });
    }

    const newTransaction = await Transaction.create({
      user: req.user.id,
      type,
      category,
      amount,
      description,
      date: new Date(date),
    });

    if (type === 'expense') {
      await updateBudget(req.user.id, category, amount);
    }

    return res.status(201).json({
      success: true,
      data: newTransaction,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error',
      });
    }
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'No transaction found',
      });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    const { type, category, amount, description, date } = req.body;

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid amount',
      });
    }

    const oldAmount = transaction.amount;
    const oldCategory = transaction.category;
    const oldType = transaction.type;

    const updateData = { type, category, amount, description };
    if (date) {
      if (!new Date(date).getTime()) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid date',
        });
      }
      updateData.date = new Date(date);
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (oldType === 'expense') {
      await updateBudget(req.user.id, oldCategory, -oldAmount);
    }

    if (type === 'expense') {
      await updateBudget(req.user.id, category, amount);
    }

    return res.status(200).json({
      success: true,
      data: updatedTransaction,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'No transaction found',
      });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    if (transaction.type === 'expense') {
      await updateBudget(transaction.user, transaction.category, -transaction.amount);
    }

    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error('Delete transaction error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Export transactions to CSV
// @route   GET /api/transactions/export
// @access  Private
exports.exportTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No transactions found to export',
      });
    }

    const fields = ['type', 'category', 'amount', 'date', 'description'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(transactions);

    res.header('Content-Type', 'text/csv');
    res.attachment(`transactions-${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get transaction summary
// @route   GET /api/transactions/summary
// @access  Private
exports.getTransactionSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const summary = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const summaryData = summary.reduce((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        income: summaryData.income || 0,
        expense: summaryData.expense || 0,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get monthly transaction summary
// @route   GET /api/transactions/monthly-summary
// @access  Private
exports.getMonthlySummary = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

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

    return res.status(200).json({
      success: true,
      data: {
        labels,
        incomeData,
        expenseData,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get all reports data
// @route   GET /api/transactions/reports
// @access  Private
exports.getReportsData = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    sixMonthsAgo.setHours(0, 0, 0, 0);


    // 1. Last Month's Summary
    const lastMonthSummary = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: lastMonth, $lte: lastMonthEnd } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    const incomeLastMonth = lastMonthSummary.find(d => d._id === 'income')?.total || 0;
    const expenseLastMonth = lastMonthSummary.find(d => d._id === 'expense')?.total || 0;
    const netSavingsLastMonth = incomeLastMonth - expenseLastMonth;

    // 2. Spending Breakdown for Pie Chart (Last Month)
    const spendingBreakdown = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: lastMonth, $lte: lastMonthEnd } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    // 3. Top 3 Spending Categories (Last Month)
    const top3Categories = spendingBreakdown.slice(0, 3);

    // 4. Cumulative Savings Trend (Last 6 Months)
    const monthlyTransactions = await Transaction.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
                expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const cumulativeSavingsData = {
        labels: [],
        values: []
    };
    let cumulativeSaving = 0;
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Create a map of the last 6 months to ensure all months are present
    const lastSixMonthsMap = new Map();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const key = `${year}-${month}`;
        lastSixMonthsMap.set(key, { income: 0, expense: 0 });
    }

    monthlyTransactions.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`;
        if(lastSixMonthsMap.has(key)) {
            lastSixMonthsMap.set(key, { income: item.income, expense: item.expense });
        }
    });

    for (const [key, value] of lastSixMonthsMap.entries()) {
        const [year, month] = key.split('-').map(Number);
        const net = value.income - value.expense;
        cumulativeSaving += net;
        cumulativeSavingsData.labels.push(`${monthNames[month - 1]} ${year}`);
        cumulativeSavingsData.values.push(cumulativeSaving);
    }


    res.status(200).json({
      success: true,
      data: {
        summary: {
          income: incomeLastMonth,
          expenses: expenseLastMonth,
          net: netSavingsLastMonth,
        },
        spendingBreakdown,
        incomeVsExpense: {
          income: incomeLastMonth,
          expense: expenseLastMonth,
        },
        cumulativeSavings: cumulativeSavingsData,
        topCategories: top3Categories,
      }
    });

  } catch (err) {
    console.error('Error in getReportsData:', err);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      detailedError: err.message
    });
  }
};

// @desc    Get spending breakdown by category (monthly/weekly)
// @route   GET /api/transactions/spending-breakdown
// @access  Private
exports.getSpendingBreakdown = async (req, res, next) => {
  try {
    const { period } = req.query; // 'monthly' or 'weekly'
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    let groupField;
    if (period === 'monthly') {
      groupField = {
        year: { $year: '$date' },
        month: { $month: '$date' },
      };
    } else if (period === 'weekly') {
      groupField = {
        year: { $year: '$date' },
        week: { $week: '$date' },
      };
    } else {
      return res.status(400).json({ success: false, error: 'Invalid period specified. Use "monthly" or "weekly".' });
    }

    const breakdown = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), type: 'expense' } },
      {
        $group: {
          _id: {
            period: groupField,
            category: '$category',
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (err) {
    console.error('Error in getSpendingBreakdown:', err);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      detailedError: err.message // for debugging
    });
  }
};

// @desc    Seed a sample transaction
// @route   POST /api/transactions/seed-sample
// @access  Private
exports.seedSampleTransaction = async (req, res, next) => {
  try {
    const sampleTransaction = {
      user: req.user.id,
      type: Math.random() > 0.5 ? 'income' : 'expense',
      category: ['Salary', 'Groceries', 'Bills', 'Entertainment', 'Shopping'][Math.floor(Math.random() * 5)],
      amount: Math.floor(Math.random() * (300 - 20 + 1)) + 20,
      description: 'Sample seeded transaction',
    };

    const newTransaction = await Transaction.create(sampleTransaction);

    return res.status(201).json({
      success: true,
      data: newTransaction,
    });
  } catch (err) {
    console.error('Seeding error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server Error during seeding',
    });
  }
};

// @desc    Get spending by category
// @route   GET /api/transactions/category-spending
// @access  Private
exports.getCategorySpending = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const categorySpending = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: '$total',
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json({ success: true, data: categorySpending });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};