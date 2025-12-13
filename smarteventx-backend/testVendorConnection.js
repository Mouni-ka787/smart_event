// Test script to check vendor account and database connection
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/smarteventx";

// Vendor schema (simplified)
const vendorSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
});

const Vendor = mongoose.model('User', vendorSchema);

async function testConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB successfully');
    
    // Find all vendor accounts
    const vendors = await Vendor.find({ role: 'vendor' });
    console.log(`Found ${vendors.length} vendor accounts`);
    
    // Display vendor information
    vendors.forEach(vendor => {
      console.log(`- ${vendor.name} (${vendor.email}) - Created: ${vendor.createdAt}`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testConnection();