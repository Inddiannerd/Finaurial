const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    console.log('Registration attempt received');
    
    if (!req.body) {
      throw new Error('No request body received');
    }
    
    const { username, email, password } = req.body;
    console.log('Parsed registration data:', { username, email, passwordPresent: !!password });

    // Input validation
    if (!username || !email || !password) {
      throw new Error('Please enter all fields');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email');
    }

    // Password strength validation
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user exists
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error(existingUser.email === email ? 'Email already exists' : 'Username already taken');
    }

    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      savings: 0,
      role: 'user',
      goals: [],
      budget: [],
      transactions: []
    });

    await newUser.save();
    console.log('User saved successfully:', newUser._id);

    const payload = {
      user: {
        id: newUser.id,
        role: newUser.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        console.log('JWT generated successfully');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(400).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        console.log('Login successful for user:', user._id);
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(400).json({ msg: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getUserSavings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savings');
    res.json({ savings: user.savings });
  } catch (err) {
    console.error('Get savings error:', err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateUserSavings = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new Error('User not found');
    }

    user.savings += amount;
    await user.save();

    res.json({ savings: user.savings });
  } catch (err) {
    console.error('Update savings error:', err.message);
    res.status(500).send('Server Error');
  }
};
