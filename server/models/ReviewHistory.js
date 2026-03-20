const mongoose = require('mongoose');

const reviewHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  topicName: {
    type: String,
    required: true,
  },
  quality: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  reviewedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ReviewHistory', reviewHistorySchema);
