const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
    trim: true,
  },
  date: {
    type: String, // Stored as YYYY-MM-DD for easy querying
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure a user can query their dates efficiently
todoSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Todo', todoSchema);
