const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  totalItems: {
    type: Number,
    default: 1,
  },
  completedItems: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  // SM-2 fields
  easeFactor: {
    type: Number,
    default: 2.5,
  },
  interval: {
    type: Number,
    default: 0,
  },
  repetitions: {
    type: Number,
    default: 0,
  },
  nextReview: {
    type: Date,
    default: null,
  },
  lastReviewed: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  topics: [topicSchema],
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  sections: [sectionSchema],
}, {
  timestamps: true,
});

// Virtual for total topics count
categorySchema.virtual('totalTopics').get(function () {
  return this.sections.reduce((sum, section) => sum + section.topics.length, 0);
});

// Virtual for completed topics count
categorySchema.virtual('completedTopics').get(function () {
  return this.sections.reduce((sum, section) => {
    return sum + section.topics.filter(t => t.completed).length;
  }, 0);
});

// Include virtuals in JSON
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
