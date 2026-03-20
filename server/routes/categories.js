const express = require('express');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/categories
// @desc    Get all categories for user
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/categories
// @desc    Create a category
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({
      user: req.user._id,
      name,
      description: description || '',
      sections: [],
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================
// SECTION ROUTES
// ========================

// @route   POST /api/categories/:id/sections
// @desc    Add a section to a category
router.post('/:id/sections', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name } = req.body;
    category.sections.push({ name, topics: [] });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/categories/:id/sections/:sectionId
// @desc    Update a section
router.put('/:id/sections/:sectionId', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const section = category.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    if (req.body.name) section.name = req.body.name;
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/categories/:id/sections/:sectionId
// @desc    Delete a section
router.delete('/:id/sections/:sectionId', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.sections.pull({ _id: req.params.sectionId });
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================
// TOPIC ROUTES
// ========================

// @route   POST /api/categories/:id/sections/:sectionId/topics
// @desc    Add a topic to a section
router.post('/:id/sections/:sectionId/topics', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const section = category.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const { name, totalItems } = req.body;
    section.topics.push({
      name,
      totalItems: totalItems || 1,
      completedItems: 0,
      completed: false,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/categories/:id/sections/:sectionId/topics/:topicId
// @desc    Delete a topic
router.delete('/:id/sections/:sectionId/topics/:topicId', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const section = category.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    section.topics.pull({ _id: req.params.topicId });
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================
// BULK IMPORT
// ========================

// @route   POST /api/categories/:id/import
// @desc    Bulk import sections & topics from parsed Excel/CSV data
// @body    { sections: [{ name: "Section Name", topics: [{ name: "Topic", totalItems: 5 }] }] }
router.post('/:id/import', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { sections } = req.body;
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ message: 'No data to import. Expected { sections: [...] }' });
    }

    let importedSections = 0;
    let importedTopics = 0;

    for (const sectionData of sections) {
      if (!sectionData.name || !sectionData.name.trim()) continue;

      // Find existing section with same name or create new
      let section = category.sections.find(
        s => s.name.toLowerCase().trim() === sectionData.name.toLowerCase().trim()
      );

      if (!section) {
        category.sections.push({ name: sectionData.name.trim(), topics: [] });
        section = category.sections[category.sections.length - 1];
        importedSections++;
      }

      // Add topics to the section
      if (sectionData.topics && Array.isArray(sectionData.topics)) {
        for (const topicData of sectionData.topics) {
          if (!topicData.name || !topicData.name.trim()) continue;

          // Skip if topic with same name already exists in this section
          const exists = section.topics.some(
            t => t.name.toLowerCase().trim() === topicData.name.toLowerCase().trim()
          );
          if (exists) continue;

          section.topics.push({
            name: topicData.name.trim(),
            totalItems: parseInt(topicData.totalItems) || 1,
            completedItems: 0,
            completed: false,
          });
          importedTopics++;
        }
      }
    }

    await category.save();
    res.json({
      message: `Imported ${importedSections} new sections and ${importedTopics} new topics`,
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
