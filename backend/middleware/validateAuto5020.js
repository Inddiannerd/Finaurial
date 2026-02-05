const Budget = require('../models/Budget');

const validateAuto5020 = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if any budget already has amountMinor set for this user
    const existingBudget = await Budget.findOne({
      user: userId,
      amountMinor: { $exists: true, $ne: null } // Ensure amountMinor is present and not null
    });

    if (existingBudget) {
      return res.status(409).json({
        success: false,
        error: 'Budgets have already been auto-allocated using minor units. Please manage existing budgets or delete them to re-run auto-allocation.'
      });
    }

    next(); // No conflicting budgets found, proceed
  } catch (err) {
    console.error('Error in validateAuto5020 middleware:', err);
    res.status(500).json({ success: false, error: 'Server Error during budget validation.' });
  }
};

module.exports = validateAuto5020;
