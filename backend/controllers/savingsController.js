const Saving = require('../models/Saving');
const User = require('../models/User');

// @desc    Get savings summary
// @route   GET /api/savings/summary
// @access  Private
exports.getSavingsSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: { totalSavings: user.savings || 0 } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all savings transactions
// @route   GET /api/savings
// @access  Private
exports.getSavings = async (req, res) => {
  try {
    const savings = await Saving.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: savings.length, data: savings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Add a savings transaction (deposit/withdrawal)
// @route   POST /api/savings
// @access  Private
exports.addSaving = async (req, res) => {
  try {
    const { amount, type, note } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const newSaving = await Saving.create({ user: req.user.id, amount, type, note });

    if (type === 'deposit') {
      user.savings = (user.savings || 0) + amount;
    } else if (type === 'withdrawal') {
      user.savings = (user.savings || 0) - amount;
    }
    await user.save();

    res.status(201).json({ success: true, data: newSaving });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};