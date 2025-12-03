import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

console.log('Environment variables:');
console.log('MONGODB_URL:', process.env.MONGODB_URL);
console.log('PORT:', process.env.PORT);

// Test MongoDB connection
const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Successfully connected to MongoDB!');
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
};

testConnection();