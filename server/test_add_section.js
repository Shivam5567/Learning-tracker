const mongoose = require('mongoose');
const Category = require('./models/Category');
const dotenv = require('dotenv');

dotenv.config();

async function testAddSection() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const category = await Category.findOne();
    if (!category) {
      console.log('No categories found to test with.');
      process.exit(0);
    }

    console.log('Testing Add Section to:', category.name);
    category.sections.push({ name: 'Test Section ' + Date.now(), topics: [] });
    await category.save();
    console.log('✅ SUCCESS: Section added and saved!');
    process.exit(0);
  } catch (err) {
    console.error('❌ FAILURE:', err.message);
    process.exit(1);
  }
}

testAddSection();
