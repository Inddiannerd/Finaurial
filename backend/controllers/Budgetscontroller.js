const Budget = require('../models/Budget');
const Transaction = require('../models/transactions');

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.status(200).json({ success: true, data: budgets });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.addBudget = async (req, res) => {
  const { category, amount } = req.body;

  if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be a positive number.' });
  }

  try {
    const budget = await Budget.create({ category, amount, user: req.user.id });
    res.status(201).json({ success: true, data: budget });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!budget) return res.status(404).json({ success: false, error: 'Budget not found' });
    res.status(200).json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ success: false, error: 'Budget not found' });

    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};