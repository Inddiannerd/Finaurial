const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be a positive number'],
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount must be a positive number'],
  },
});

module.exports = mongoose.model('Budget', BudgetSchema);
