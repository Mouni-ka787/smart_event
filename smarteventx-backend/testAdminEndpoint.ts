import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';
import axios from 'axios';

// Load environment variables
dotenv.config();

const testAdminEndpoint = async () => {
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
    
    // Generate a JWT token for the admin user (this is a simplified version)
    // In a real scenario, you would use the actual JWT generation logic
    console.log('\nTo test the admin dashboard, you would need to:');
    console.log('1. Log in as an admin through the frontend');
    console.log('2. Get the JWT token from the login response');
    console.log('3. Use that token to call the admin API endpoints');
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAdminEndpoint();