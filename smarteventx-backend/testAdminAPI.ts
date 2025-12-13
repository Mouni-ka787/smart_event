import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';

// Load environment variables
dotenv.config();

const testAdminAPI = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Connected to database');
    
    // Find an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found in the database');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log('Admin user found:');
    console.log(`  Name: ${adminUser.name}`);
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Role: ${adminUser.role}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAdminAPI();