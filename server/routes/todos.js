const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Todo = require('../models/Todo');
const { logActivity } = require('./activity');

// Apply auth middleware to all routes
router.use(protect);

// @route   GET /api/todos
// @desc    Get todos for a date range (or all)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    const todos = await Todo.find(query).sort({ date: 1, createdAt: 1 });
    res.json(todos);
  } catch (err) {
    console.error('Get todos error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/todos
// @desc    Create a new todo
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { text, date } = req.body;

    if (!text || !date) {
      return res.status(400).json({ message: 'Please provide text and date' });
    }

    const todo = await Todo.create({
      user: req.user._id,
      text,
      date,
      completed: false,
    });

    res.status(201).json(todo);
  } catch (err) {
    console.error('Create todo error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/todos/:id
// @desc    Update a todo (e.g. mark completed)
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const { text, completed, date } = req.body;

    if (text !== undefined) todo.text = text;
    if (completed !== undefined) {
      // If marking as completed for the first time, log activity
      if (completed === true && todo.completed === false) {
        await logActivity(req.user._id);
      }
      todo.completed = completed;
    }
    if (date !== undefined) todo.date = date;

    await todo.save();
    res.json(todo);
  } catch (err) {
    console.error('Update todo error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/todos/:id
// @desc    Delete a todo
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo removed', id: req.params.id });
  } catch (err) {
    console.error('Delete todo error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
