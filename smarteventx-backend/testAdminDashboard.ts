import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';
import Service from './src/models/Service';
import Booking from './src/models/Booking';
import EventModel from './src/models/Event';
import VendorAssignment from './src/models/VendorAssignment';

// Load environment variables
dotenv.config();

const testAdminDashboard = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Connected to database');
    
    // Test 1: Count all entities
    const userCount = await User.countDocuments({ role: 'user' });
    const vendorCount = await User.countDocuments({ role: 'vendor' });
    const serviceCount = await Service.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const eventCount = await EventModel.countDocuments();
    const assignmentCount = await VendorAssignment.countDocuments();
    
    console.log('\n=== Entity Counts ===');
    console.log(`Users: ${userCount}`);
    console.log(`Vendors: ${vendorCount}`);
    console.log(`Services: ${serviceCount}`);
    console.log(`Bookings: ${bookingCount}`);
    console.log(`Events: ${eventCount}`);
    console.log(`Vendor Assignments: ${assignmentCount}`);
    
    // Test 2: Check bookings with vendor references
    const bookingsWithVendors = await Booking.find({ vendor: { $exists: true, $ne: null } });
    console.log(`\n=== Bookings with Vendor References ===`);
    console.log(`Total: ${bookingsWithVendors.length}`);
    
    // Test 3: Check a specific booking to see if vendor reference works
    if (bookingsWithVendors.length > 0) {
      const sampleBooking = bookingsWithVendors[0];
      console.log(`\n=== Sample Booking ===`);
      console.log(`ID: ${sampleBooking._id}`);
      console.log(`Vendor ID: ${sampleBooking.vendor}`);
      
      // Try to populate the vendor
      const populatedBooking = await Booking.findById(sampleBooking._id)
        .populate('user', 'name')
        .populate('service', 'name')
        .populate('vendor', 'name email role');
      
      console.log(`Populated vendor: ${populatedBooking?.vendor ? 'SUCCESS' : 'FAILED'}`);
    }
    
    // Test 4: Check if we can find the vendor user
    if (bookingsWithVendors.length > 0 && bookingsWithVendors[0].vendor) {
      const vendorUser = await User.findById(bookingsWithVendors[0].vendor);
      console.log(`\n=== Vendor User ===`);
      if (vendorUser) {
        console.log(`Name: ${vendorUser.name}`);
        console.log(`Email: ${vendorUser.email}`);
        console.log(`Role: ${vendorUser.role}`);
      } else {
        console.log(`Vendor user NOT FOUND`);
      }
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAdminDashboard();