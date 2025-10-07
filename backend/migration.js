
const mongoose = require('mongoose');
const Budget = require('./models/Budget');
const User = require('./models/User'); // Assuming you have a User model
const Transaction = require('./models/transactions'); // Assuming you have a Transaction model
const db = require('./config/db');

const migrateBudgets = async () => {
  try {
    await db.connectDB();
    console.log('MongoDB Connected...');

    const budgets = await Budget.find({});
    console.log(`Found ${budgets.length} budgets to process.`);

    for (const budget of budgets) {
      const limit = Number(budget.amount || budget.limit || 0);
      const spent = Number(budget.spent || 0);

      await Budget.updateOne(
        { _id: budget._id },
        {
          $set: {
            limit: limit,
            spent: spent,
          },
          $unset: {
            amount: '',
          },
        }
      );
      console.log(`Migrated budget ${budget._id}`);
    }

    console.log('Budget migration completed successfully.');
  } catch (error) {
    console.error('Error during budget migration:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

const runMigration = async () => {
    console.log('Starting data migration...');
    await migrateBudgets();
    console.log('Data migration finished.');
};

runMigration();
