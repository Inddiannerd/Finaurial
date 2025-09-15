const User = require('../models/User');
const FeatureFlag = require('../models/FeatureFlag');
const Transaction = require('../models/transactions');
const bcrypt = require('bcryptjs');

const initializeDB = async () => {
  try {
    // Ensure DB is clean for consistent seeding (optional, for development)
    // await User.deleteMany({});
    // await Transaction.deleteMany({});
    // await FeatureFlag.deleteMany({});

    // Create admin user if doesn't exist
    let adminUser = await User.findOne({ email: 'admin@finaurial.com' });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@finaurial.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created');
      // Seed transaction for admin
      await Transaction.create({
        user: adminUser._id,
        type: 'income',
        category: 'Salary',
        amount: 5000,
        description: 'Monthly salary'
      });
      console.log('Sample transaction for admin created');
    }

    // Seed regular users if they don't exist
    const usersToSeed = [
      { username: 'testuser1', email: 'testuser1@example.com', password: 'password123', role: 'user', sampleTransaction: { type: 'expense', category: 'Groceries', amount: 150, description: 'Weekly shopping' } },
      { username: 'testuser2', email: 'testuser2@example.com', password: 'password123', role: 'user', sampleTransaction: { type: 'expense', category: 'Utilities', amount: 75, description: 'Electricity bill' } },
    ];

    for (const userData of usersToSeed) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        user = await User.create({ ...userData, password: hashedPassword });
        console.log(`User ${userData.username} created`);
        
        // Seed transaction for the new user
        await Transaction.create({ ...userData.sampleTransaction, user: user._id });
        console.log(`Sample transaction for ${userData.username} created`);
      }
    }

    // Create default feature flags
    const features = ['Transactions', 'Goals', 'Budgets', 'Savings'];
    for (const feature of features) {
      const exists = await FeatureFlag.findOne({ name: feature });
      if (!exists) {
        await FeatureFlag.create({ name: feature, isEnabled: true });
        console.log(`Feature flag ${feature} created`);
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = initializeDB;
