const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    
    // In development, continue without MongoDB for now
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Running without MongoDB in development mode');
      return;
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;