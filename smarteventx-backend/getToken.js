const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./dist/models/User');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const getToken = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Connected to database');
    
    // Get all vendors
    const vendors = await User.find({ role: 'vendor' });
    console.log('\n=== Vendor Accounts ===');
    console.log('Total vendors:', vendors.length);
    
    if (vendors.length === 0) {
      console.log('No vendors found in the database.');
    } else {
      const vendor = vendors[0];
      console.log(`\nVendor: ${vendor.name} (${vendor.email})`);
      console.log(`  ID: ${vendor._id}`);
      console.log(`  Role: ${vendor.role}`);
      
      // Create a JWT token for this vendor
      const token = jwt.sign({ userId: vendor._id }, process.env.JWT_SECRET || 'fallback_secret');
      console.log(`  JWT Token: Bearer ${token}`);
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

getToken();