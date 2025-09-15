const mongoose = require('mongoose'); // Added mongoose import
const Transaction = require('../models/transactions');
const { Parser } = require('json2csv');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 10, search, sort } = req.query;
    const query = { user: req.user.id };

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

// @desc    Add transaction
// @route   POST /api/transactions
// @access  Private
exports.addTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, description } = req.body;
    const newTransaction = await Transaction.create({
      user: req.user.id,
      type,
      category,
      amount,
      description,
    });
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

    const { type, category, amount, description } = req.body;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { type, category, amount, description },
      { new: true, runValidators: true }
    );

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

    await transaction.remove();

    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
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
    const transactions = await Transaction.find({ user: req.user.id });

    const totalIncome = transactions
      .filter((item) => item.type === 'income')
      .reduce((acc, item) => (acc += item.amount), 0);

    const totalExpenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((acc, item) => (acc += item.amount), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
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

// @desc    Get spending breakdown by category (monthly/weekly)
// @route   GET /api/transactions/spending-breakdown
// @access  Private
exports.getSpendingBreakdown = async (req, res, next) => {
  try {
    const { period } = req.query; // 'monthly' or 'weekly'
    const userId = req.user.id;

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
      { $match: { user: mongoose.Types.ObjectId(userId), type: 'expense' } },
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
          _id: '$_id.period',
          categories: {
            $push: {
              category: '$_id.category',
              amount: '$totalAmount',
            },
          },
          periodTotal: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
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
    const categorySpending = await Transaction.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user.id), type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $project: { _id: 0, category: '$_id', total: '$total' } },
      { $sort: { total: -1 } }
    ]);
    res.json({ success: true, data: categorySpending });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
