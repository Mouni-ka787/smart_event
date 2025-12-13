import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Simple booking schema to check data
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // This is the problematic reference
  serviceId: { type: String },
  serviceName: { type: String },
  eventName: { type: String },
  eventDate: { type: Date },
  guestCount: { type: Number, default: 1 },
  specialRequests: { type: String },
  totalPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['pending','confirmed','in_progress','completed','cancelled','refunded'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending','paid','released','refunded'], default: 'pending' },
  qrCode: { type: String },
  qrData: { type: String },
  paypalOrderId: { type: String },
  paypalCaptureId: { type: String },
  venueLocation: {
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  adminTrackingInfo: { type: mongoose.Schema.Types.Mixed },
  vendorTrackingInfo: { type: mongoose.Schema.Types.Mixed },
  debugMarker: { type: String, index: true }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

const checkBookings = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Connected to database');
    
    // Get all bookings
    const bookings = await Booking.find({});
    
    console.log('\n=== Booking Records ===');
    console.log('Total bookings:', bookings.length);
    console.log('');
    
    // Check each booking for vendor references
    for (const booking of bookings) {
      console.log(`Booking ID: ${booking._id}`);
      console.log(`  User: ${booking.user}`);
      console.log(`  Service: ${booking.service}`);
      console.log(`  Vendor: ${booking.vendor}`);
      console.log(`  Status: ${booking.status}`);
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

checkBookings();