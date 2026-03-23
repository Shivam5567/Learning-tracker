const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Stored as YYYY-MM-DD
    required: true,
  },
  count: {
    type: Number,
    default: 1, // Whenever created, base count is 1
  },
}, {
  timestamps: true,
});

// A user should only have ONE activity log per day
activityLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
