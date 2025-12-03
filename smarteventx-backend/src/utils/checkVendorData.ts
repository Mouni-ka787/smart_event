import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';
import Service, { IService } from '../models/Service';
import Booking, { IBooking } from '../models/Booking';

// Load environment variables
dotenv.config();

const checkVendorData = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Successfully connected to MongoDB!');
    
    // Check all users with vendor role
    const vendors = await User.find({ role: 'vendor' });
    console.log('\nVendors in database:');
    vendors.forEach(vendor => {
      console.log(`ID: ${vendor._id}`);
      console.log(`Name: ${vendor.name}`);
      console.log(`Email: ${vendor.email}`);
      console.log(`Role: ${vendor.role}`);
      console.log('---');
    });
    
    // Check services and their vendor references
    const services = await Service.find().populate('vendor');
    console.log('\nServices in database:');
    services.forEach(service => {
      console.log(`Service ID: ${service._id}`);
      console.log(`Service Name: ${service.name}`);
      console.log(`Vendor ID: ${service.vendor}`);
      console.log('---');
    });
    
    // Check bookings and their vendor references
    const bookings = await Booking.find().populate('vendor');
    console.log('\nBookings in database:');
    bookings.forEach(booking => {
      console.log(`Booking ID: ${booking._id}`);
      console.log(`Event Name: ${booking.eventName}`);
      console.log(`Vendor ID: ${booking.vendor}`);
      console.log('---');
    });
    
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('Error:', error);
  }
};

checkVendorData();