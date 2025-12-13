import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';
import Service from './src/models/Service';
import Booking from './src/models/Booking';

// Load environment variables
dotenv.config();

const checkVendorData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Connected to database');
    
    // Get all vendors
    const vendors = await User.find({ role: 'vendor' }, 'name email');
    
    console.log('\n=== Vendors in Database ===');
    console.log('Total vendors:', vendors.length);
    console.log('');
    
    if (vendors.length === 0) {
      console.log('No vendors found in the database.');
    } else {
      for (const vendor of vendors) {
        console.log(`Vendor: ${vendor.name} (${vendor.email})`);
        
        // Check services for this vendor
        const services = await Service.find({ vendor: vendor._id });
        console.log(`  Services: ${services.length}`);
        
        // Check bookings for this vendor
        const bookings = await Booking.find({ vendor: vendor._id });
        console.log(`  Bookings: ${bookings.length}`);
        
        console.log('');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkVendorData();