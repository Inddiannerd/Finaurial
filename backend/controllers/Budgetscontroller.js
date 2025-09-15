const Budget = require('../models/Budget');
const Transaction = require('../models/transactions');

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    // Optionally, enrich with current spending
    const enrichedBudgets = await Promise.all(budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
            { $match: { user: budget.user, category: budget.category, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        return {
            ...budget.toObject(),
            spent: spent.length > 0 ? spent[0].total : 0
        };
    }));
    res.status(200).json({ success: true, data: enrichedBudgets });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.addBudget = async (req, res) => {
  try {
    const budget = await Budget.create({ ...req.body, user: req.user.id });
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
    await budget.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};