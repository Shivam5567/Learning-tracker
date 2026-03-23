const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// Apply auth middleware to all routes
router.use(protect);

// Helper function to log activity inside other routes
const logActivity = async (userId) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Upsert: update if exists, otherwise create
    await ActivityLog.findOneAndUpdate(
      { user: userId, date: dateStr },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
  } catch (err) {
    console.error('Log activity error:', err);
  }
};

// @route   GET /api/activity
// @desc    Get all activity logs for a user (used for heatmap calendar)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user._id }).sort({ date: 1 });
    res.json(logs);
  } catch (err) {
    console.error('Get activity error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  router,
  logActivity
};
