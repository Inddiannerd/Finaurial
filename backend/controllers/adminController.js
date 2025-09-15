const User = require('../models/User');
const FeatureFlag = require('../models/FeatureFlag');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Suspend a user
// @route   PUT /api/admin/users/:id/suspend
// @access  Admin
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isSuspended = !user.isSuspended;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Get all feature flags
// @route   GET /api/admin/features
// @access  Admin
exports.getFeatureFlags = async (req, res) => {
  try {
    const features = await FeatureFlag.find().sort({ name: 1 });
    res.json(features);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Add a new feature flag
// @route   POST /api/admin/features
// @access  Admin
exports.addFeatureFlag = async (req, res) => {
    const { name, isEnabled } = req.body;
    try {
        let feature = await FeatureFlag.findOne({ name });
        if (feature) {
            return res.status(400).json({ msg: 'Feature already exists' });
        }
        feature = new FeatureFlag({ name, isEnabled });
        await feature.save();
        res.status(201).json(feature);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc    Update a feature flag
// @route   PUT /api/admin/features/:id
// @access  Admin
exports.updateFeatureFlag = async (req, res) => {
  try {
    const { name, isEnabled } = req.body;
    const feature = await FeatureFlag.findById(req.params.id);

    if (!feature) {
      return res.status(404).json({ msg: 'Feature not found' });
    }

    feature.name = name ?? feature.name;
    feature.isEnabled = isEnabled ?? feature.isEnabled;
    
    await feature.save();
    res.json(feature);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a feature flag
// @route   DELETE /api/admin/features/:id
// @access  Admin
exports.deleteFeatureFlag = async (req, res) => {
    try {
        const feature = await FeatureFlag.findById(req.params.id);
        if (!feature) {
            return res.status(404).json({ msg: 'Feature not found' });
        }
        await feature.remove();
        res.json({ msg: 'Feature removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};