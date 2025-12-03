import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';
import Service from '../models/Service';

// Load environment variables
dotenv.config();

const createTestService = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Successfully connected to MongoDB!');
    
    // Find a vendor
    const vendor = await User.findOne({ role: 'vendor' });
    if (!vendor) {
      console.log('No vendor found in database');
      await mongoose.connection.close();
      return;
    }
    
    console.log(`Found vendor: ${vendor.name} (${vendor.email})`);
    
    // Check if test service already exists
    const existingService = await Service.findOne({ name: 'Test Catering Service' });
    if (existingService) {
      console.log('Test service already exists:');
      console.log(`Name: ${existingService.name}`);
      console.log(`Vendor: ${existingService.vendor}`);
      await mongoose.connection.close();
      return;
    }
    
    // Create a test service
    const testService = new Service({
      name: 'Test Catering Service',
      description: 'A delicious catering service for all your event needs',
      category: 'Food & Beverage',
      price: 1500,
      priceType: 'per_event',
      vendor: vendor._id,
      images: ['https://example.com/image1.jpg'],
      isActive: true
    });
    
    const savedService = await testService.save();
    console.log('Test service created successfully:');
    console.log(`Name: ${savedService.name}`);
    console.log(`Vendor ID: ${savedService.vendor}`);
    console.log(`Category: ${savedService.category}`);
    console.log(`Price: $${savedService.price}`);
    
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('Error:', error);
  }
};

createTestService();