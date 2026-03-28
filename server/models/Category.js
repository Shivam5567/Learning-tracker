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
  url: {
    type: String,
    trim: true,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  // DSA-specific
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', ''],
    default: '',
  },
  // Books-specific
  readingStatus: {
    type: String,
    enum: ['Not Started', 'Reading', 'Completed', ''],
    default: '',
  },
  pagesRead: {
    type: Number,
    default: 0,
  },
  totalPages: {
    type: Number,
    default: 0,
  },
  // Practical-specific
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', ''],
    default: '',
  },
  projectStatus: {
    type: String,
    enum: ['Planning', 'In Progress', 'Done', ''],
    default: '',
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
  isMastered: {
    type: Boolean,
    default: false,
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
  type: {
    type: String,
    enum: ['dsa', 'books', 'theory', 'practical', 'custom'],
    default: 'custom',
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
