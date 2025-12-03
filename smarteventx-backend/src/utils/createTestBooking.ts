import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';
import Service from '../models/Service';
import Booking from '../models/Booking';

// Load environment variables
dotenv.config();

const createTestBooking = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Successfully connected to MongoDB!');
    
    // Find a user (not vendor)
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('No user found in database');
      await mongoose.connection.close();
      return;
    }
    
    console.log(`Found user: ${user.name} (${user.email})`);
    
    // Find a service
    const service = await Service.findOne();
    if (!service) {
      console.log('No service found in database');
      await mongoose.connection.close();
      return;
    }
    
    console.log(`Found service: ${service.name}`);
    
    // Get the vendor from the service
    const vendor = await User.findById(service.vendor);
    if (!vendor) {
      console.log('No vendor found for service');
      await mongoose.connection.close();
      return;
    }
    
    console.log(`Found vendor: ${vendor.name} (${vendor.email})`);
    
    // Check if test booking already exists
    const existingBooking = await Booking.findOne({ eventName: 'Test Event' });
    if (existingBooking) {
      console.log('Test booking already exists:');
      console.log(`Event Name: ${existingBooking.eventName}`);
      console.log(`User: ${existingBooking.user}`);
      console.log(`Service: ${existingBooking.service}`);
      await mongoose.connection.close();
      return;
    }
    
    // Create a test booking
    const testBooking = new Booking({
      user: user._id,
      service: service._id,
      vendor: vendor._id,
      eventName: 'Test Event',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      guestCount: 50,
      specialRequests: 'Please include vegetarian options',
      totalPrice: 1500,
      status: 'confirmed',
      paymentStatus: 'paid'
    });
    
    const savedBooking = await testBooking.save();
    console.log('Test booking created successfully:');
    console.log(`Event Name: ${savedBooking.eventName}`);
    console.log(`User ID: ${savedBooking.user}`);
    console.log(`Service ID: ${savedBooking.service}`);
    console.log(`Vendor ID: ${savedBooking.vendor}`);
    console.log(`Total Price: $${savedBooking.totalPrice}`);
    console.log(`Status: ${savedBooking.status}`);
    
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('Error:', error);
  }
};

createTestBooking();