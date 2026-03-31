const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Retry once after 5 seconds before giving up
    console.log('Retrying connection in 5 seconds...');
    setTimeout(async () => {
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 10000,
        });
        console.log(`MongoDB Connected (retry): ${conn.connection.host}`);
      } catch (retryError) {
        console.error(`MongoDB retry failed: ${retryError.message}`);
        process.exit(1);
      }
    }, 5000);
  }
};

module.exports = connectDB;
