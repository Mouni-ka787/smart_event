// Script to check all users in the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx')
  .then(async () => {
    console.log('Connected to database');
    
    try {
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
      console.error('Error fetching users:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });