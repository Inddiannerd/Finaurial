const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Budget = require('../models/Budget');

// Setup a mock express app
const app = express();
app.use(express.json());

// Mock middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Mount the router
const budgetsRouter = require('../routes/Budgets');
app.use('/api/budgets', authMiddleware, budgetsRouter);

// Test Suite
describe('POST /api/budgets/auto-allocate', () => {
  let mongoServer;
  let user;
  let token;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Set a dummy JWT secret for testing
    process.env.JWT_SECRET = 'test_secret';
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    delete process.env.JWT_SECRET;
  });

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await Budget.deleteMany({});

    // Create a test user
    user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123', // In a real scenario, this would be hashed
    });
    await user.save();

    // Create a JWT for the user
    const payload = { user: { id: user.id } };
    token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  it('should allocate 10000 income correctly into minor units and not touch major unit fields', async () => {
    // 1. Act: Call the endpoint
    const response = await request(app)
      .post('/api/budgets/auto-allocate')
      .set('x-auth-token', token)
      .send({ monthlyIncome: 10000 });

    // 2. Assert on the response
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(3);

    // 3. Assert on the database state
    const userBudgets = await Budget.find({ user: user.id });
    expect(userBudgets).toHaveLength(3);

    // Verify Needs budget (50%)
    const needsBudget = userBudgets.find(b => b.category === 'Needs');
    expect(needsBudget).toBeDefined();
    expect(needsBudget.amountMinor).toBe(500000); // 10000 * 100 * 0.5
    expect(needsBudget.amount).toBeUndefined(); // Ensure major unit field is not set
    expect(needsBudget.spent).toBe(0); // Default value
    expect(needsBudget.spentMinor).toBe(0); // Should be reset
    expect(needsBudget.currency).toBe('INR');

    // Verify Wants budget (30%)
    const wantsBudget = userBudgets.find(b => b.category === 'Wants');
    expect(wantsBudget).toBeDefined();
    expect(wantsBudget.amountMinor).toBe(300000); // 10000 * 100 * 0.3
    expect(wantsBudget.amount).toBeUndefined(); // Ensure major unit field is not set
    expect(wantsBudget.spentMinor).toBe(0);
    expect(wantsBudget.currency).toBe('INR');

    // Verify Savings budget (20%)
    const savingsBudget = userBudgets.find(b => b.category === 'Savings');
    expect(savingsBudget).toBeDefined();
    expect(savingsBudget.amountMinor).toBe(200000); // 10000 * 100 * 0.2
    expect(savingsBudget.amount).toBeUndefined(); // Ensure major unit field is not set
    expect(savingsBudget.spentMinor).toBe(0);
    expect(savingsBudget.currency).toBe('INR');
  });

  it('should return 400 if monthlyIncome is not a positive number', async () => {
    const invalidIncomes = [-100, 0, 'abc', null];
    
    for (const income of invalidIncomes) {
      const response = await request(app)
        .post('/api/budgets/auto-allocate')
        .set('x-auth-token', token)
        .send({ monthlyIncome: income });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('A valid monthly income is required');
    }
  });
});
