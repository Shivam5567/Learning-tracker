const express = require('express');
const Category = require('../models/Category');
const ReviewHistory = require('../models/ReviewHistory');
const { calculateSM2, getRevisionLabel } = require('../utils/sm2');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// @route   PUT /api/topics/complete
// @desc    Toggle topic completion and schedule revision via SM-2
router.put('/complete', async (req, res) => {
  try {
    const { categoryId, sectionId, topicId, quality } = req.body;

    const category = await Category.findOne({ _id: categoryId, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const section = category.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const topic = section.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Toggle completion
    if (!topic.completed) {
      topic.completed = true;
      topic.completedItems = topic.totalItems;

      // Apply SM-2 algorithm
      const sm2Result = calculateSM2(topic, quality || 4);
      topic.easeFactor = sm2Result.easeFactor;
      topic.interval = sm2Result.interval;
      topic.repetitions = sm2Result.repetitions;
      topic.nextReview = sm2Result.nextReview;
      topic.lastReviewed = sm2Result.lastReviewed;

      // Log review history
      await ReviewHistory.create({
        user: req.user._id,
        categoryId,
        topicId,
        topicName: topic.name,
        quality: quality || 4,
      });
    } else {
      // Undo completion
      topic.completed = false;
      topic.completedItems = 0;
      topic.nextReview = null;
      topic.lastReviewed = null;
      topic.easeFactor = 2.5;
      topic.interval = 0;
      topic.repetitions = 0;
    }

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/topics/revise
// @desc    Record a revision with quality rating, update SM-2 schedule
router.put('/revise', async (req, res) => {
  try {
    const { categoryId, sectionId, topicId, quality } = req.body;

    const category = await Category.findOne({ _id: categoryId, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const section = category.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const topic = section.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Apply SM-2 with the quality rating
    const sm2Result = calculateSM2(topic, quality);
    topic.easeFactor = sm2Result.easeFactor;
    topic.interval = sm2Result.interval;
    topic.repetitions = sm2Result.repetitions;
    topic.nextReview = sm2Result.nextReview;
    topic.lastReviewed = sm2Result.lastReviewed;

    // Log review history
    await ReviewHistory.create({
      user: req.user._id,
      categoryId,
      topicId,
      topicName: topic.name,
      quality,
    });

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/topics/due
// @desc    Get all topics due for revision
router.get('/due', async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id });
    // Use end of today so topics due today show up all day
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const dueTopics = [];

    categories.forEach(category => {
      category.sections.forEach(section => {
        section.topics.forEach(topic => {
          if (topic.completed && topic.nextReview && new Date(topic.nextReview) <= endOfToday) {
            dueTopics.push({
              categoryId: category._id,
              categoryName: category.name,
              sectionId: section._id,
              sectionName: section.name,
              topicId: topic._id,
              topicName: topic.name,
              nextReview: topic.nextReview,
              revisionLabel: getRevisionLabel(topic.nextReview),
              interval: topic.interval,
            });
          }
        });
      });
    });

    // Sort by most overdue first
    dueTopics.sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));

    res.json(dueTopics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/topics/review-history
// @desc    Get review history for analytics
router.get('/review-history', async (req, res) => {
  try {
    const history = await ReviewHistory.find({ user: req.user._id })
      .sort({ reviewedAt: -1 })
      .limit(100);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
