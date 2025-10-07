const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });
    res.status(200).json({ success: true, data: goals });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.addGoal = async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    res.status(200).json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    await goal.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.addContribution = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    const { amount } = req.body;
    goal.currentAmount += amount;
    goal.contributions.push({ amount });

    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();
    res.status(200).json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};