const mongoose = require('mongoose');

const FeatureFlagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
      type: Date,
      default: Date.now
  }
});

// Middleware to update the `updatedAt` field on save
FeatureFlagSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FeatureFlag', FeatureFlagSchema);