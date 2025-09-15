const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
