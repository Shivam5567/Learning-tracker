require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const logPath = 'c:\\Users\\shiva\\Documents\\test_copilot\\server\\connection_error.log';

async function verifyConnection() {
  try {
    console.log('Testing connection...');
    fs.writeFileSync(logPath, 'Starting connection test...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000 
    });
    
    fs.appendFileSync(logPath, '✅ Connected successfully to Atlas!\n');
    process.exit(0);
  } catch (err) {
    fs.appendFileSync(logPath, '❌ Connection FAILED: ' + err.message + '\n');
    console.error(err);
    process.exit(1);
  }
}

verifyConnection();
