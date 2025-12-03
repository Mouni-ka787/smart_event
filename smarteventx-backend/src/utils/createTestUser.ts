import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';

// Load environment variables
dotenv.config();

const createTestUser = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Successfully connected to MongoDB!');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:');
      console.log(`Name: ${existingUser.name}`);
      console.log(`Email: ${existingUser.email}`);
      console.log(`Role: ${existingUser.role}`);
      await mongoose.connection.close();
      return;
    }
    
    // Create a test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      phoneNumber: '+1234567890'
    });
    
    const savedUser = await testUser.save();
    console.log('Test user created successfully:');
    console.log(`Name: ${savedUser.name}`);
    console.log(`Email: ${savedUser.email}`);
    console.log(`Role: ${savedUser.role}`);
    console.log('Password is hashed and stored securely');
    
    // Also create a vendor user
    const vendorUser = new User({
      name: 'Test Vendor',
      email: 'vendor@example.com',
      password: 'password123',
      role: 'vendor',
      phoneNumber: '+1234567891'
    });
    
    const savedVendor = await vendorUser.save();
    console.log('\nTest vendor created successfully:');
    console.log(`Name: ${savedVendor.name}`);
    console.log(`Email: ${savedVendor.email}`);
    console.log(`Role: ${savedVendor.role}`);
    console.log('Password is hashed and stored securely');
    
    // Also create an admin user
    const adminUser = new User({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      phoneNumber: '+1234567892'
    });
    
    const savedAdmin = await adminUser.save();
    console.log('\nTest admin created successfully:');
    console.log(`Name: ${savedAdmin.name}`);
    console.log(`Email: ${savedAdmin.email}`);
    console.log(`Role: ${savedAdmin.role}`);
    console.log('Password is hashed and stored securely');
    
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('Error:', error);
  }
};

createTestUser();