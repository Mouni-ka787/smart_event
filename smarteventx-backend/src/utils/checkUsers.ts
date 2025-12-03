import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';

// Load environment variables
dotenv.config();

const checkUsers = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Successfully connected to MongoDB!');
    
    // Check if there are any users
    const users = await User.find({});
    console.log(`Found ${users.length} users in the database:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    if (users.length === 0) {
      console.log('No users found in the database. You need to register a user first.');
    }
    
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUsers();