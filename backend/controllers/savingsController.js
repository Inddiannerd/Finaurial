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
    const { amount: amountStr, type, note, date } = req.body;

    if (!date || !new Date(date).getTime()) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid date',
      });
    }

    const amount = parseFloat(amountStr);
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    if (type === 'withdrawal' && (user.savings || 0) < amount) {
      return res.status(400).json({ success: false, error: 'Unable to withdraw, please save more' });
    }

    const newSaving = await Saving.create({ user: req.user.id, amount, type, note, date: new Date(date) });

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

// @desc    Delete a savings transaction
// @route   DELETE /api/savings/:id
// @access  Private
exports.deleteSaving = async (req, res) => {
    try {
        const saving = await Saving.findById(req.params.id);
        if (!saving) {
            return res.status(404).json({ success: false, error: 'Saving not found' });
        }

        if (saving.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await Saving.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Clear all savings history
// @route   DELETE /api/savings
// @access  Private
exports.clearSavings = async (req, res) => {
    try {
        await Saving.deleteMany({ user: req.user.id });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};