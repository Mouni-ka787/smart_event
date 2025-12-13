import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';

// Load environment variables
dotenv.config();

const checkUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Connected to database');
    
    // Get all users
    const users = await User.find({}, 'name email role createdAt');
    
    console.log('\n=== Users in Database ===');
    console.log('Total users:', users.length);
    console.log('');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      console.log('You need to register a user first.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
      
      // Count users by role
      const userCount = users.filter(u => u.role === 'user').length;
      const vendorCount = users.filter(u => u.role === 'vendor').length;
      const adminCount = users.filter(u => u.role === 'admin').length;
      
      console.log('=== Role Summary ===');
      console.log(`Users: ${userCount}`);
      console.log(`Vendors: ${vendorCount}`);
      console.log(`Admins: ${adminCount}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();