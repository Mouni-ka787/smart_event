import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Simple user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Simple booking schema to check data
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // This is the problematic reference
  status: String,
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

const checkVendorReferences = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Connected to database');
    
    // Get bookings with vendor references
    const bookings = await Booking.find({ vendor: { $exists: true, $ne: null } });
    
    console.log('\n=== Bookings with Vendor References ===');
    console.log('Total bookings with vendors:', bookings.length);
    console.log('');
    
    // Check each booking for vendor references
    for (const booking of bookings) {
      console.log(`Booking ID: ${booking._id}`);
      console.log(`  User: ${booking.user}`);
      console.log(`  Vendor ID: ${booking.vendor}`);
      console.log(`  Status: ${booking.status}`);
      
      // Try to find the vendor user
      const vendorUser = await User.findById(booking.vendor);
      if (vendorUser) {
        console.log(`  Vendor Name: ${vendorUser.name}`);
        console.log(`  Vendor Email: ${vendorUser.email}`);
        console.log(`  Vendor Role: ${vendorUser.role}`);
      } else {
        console.log(`  Vendor: NOT FOUND`);
      }
      console.log('');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkVendorReferences();