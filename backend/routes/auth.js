const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, getUserSavings, updateUserSavings } = require('../controllers/authcontroller');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET api/auth/savings
// @desc    Get user savings
// @access  Private
router.get('/savings', auth, getUserSavings);

// @route   PUT api/auth/update-savings
// @desc    Update user savings
// @access  Private
router.put('/update-savings', auth, updateUserSavings);

module.exports = router;
